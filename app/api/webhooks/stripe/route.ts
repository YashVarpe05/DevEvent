import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { stripe } from "@/lib/stripe";
import connectDB from "@/lib/mongodb";
import Order from "@/database/order.model";
import PromoCode from "@/database/promo-code.model";
import Referral from "@/database/referral.model";
import TicketType from "@/database/ticket-type.model";
import Registration from "@/database/registration.model";
import PaymentTransaction from "@/database/payment-transaction.model";
import OrganizerProfile from "@/database/organizer-profile.model";
import StripeWebhookEvent from "@/database/stripe-webhook-event.model";
import Event from "@/database/event.model";
import User from "@/database/user.model";
import UserReferral from "@/database/user-referral.model";
import { generateQrPayload, generateTicketCode } from "@/lib/utils/ticket";
import { sendRegistrationEmail } from "@/lib/email";
import { trackServerEvent } from "@/lib/analytics";

export async function POST(req: Request) {
	const signature = (await headers()).get("stripe-signature");
	const secret = process.env.STRIPE_WEBHOOK_SECRET;

	if (!signature || !secret) {
		return NextResponse.json(
			{ error: "Missing signature or webhook secret" },
			{ status: 400 },
		);
	}

	const payload = await req.text();
	let stripeEvent: any;

	try {
		stripeEvent = stripe.webhooks.constructEvent(payload, signature, secret);
	} catch (error: any) {
		return NextResponse.json(
			{ error: `Webhook signature verification failed: ${error.message}` },
			{ status: 400 },
		);
	}

	await connectDB();

	const alreadyProcessed = await StripeWebhookEvent.findOne({
		eventId: stripeEvent.id,
	}).lean();
	if (alreadyProcessed) {
		return NextResponse.json({ received: true, deduplicated: true });
	}

	try {
		switch (stripeEvent.type) {
			case "checkout.session.completed":
				await handleCheckoutSessionCompleted(stripeEvent.data.object);
				break;
			case "payment_intent.succeeded":
				await handlePaymentIntentSucceeded(stripeEvent.data.object);
				break;
			case "payment_intent.payment_failed":
				await handlePaymentIntentFailed(stripeEvent.data.object);
				break;
			case "charge.refunded":
				await handleChargeRefunded(stripeEvent.data.object);
				break;
			case "charge.dispute.created":
				await handleChargeDisputeCreated(stripeEvent.data.object);
				break;
			case "account.updated":
				await handleAccountUpdated(stripeEvent.data.object);
				break;
			default:
				break;
		}

		await StripeWebhookEvent.create({
			eventId: stripeEvent.id,
			eventType: stripeEvent.type,
			processedAt: new Date(),
		});
	} catch (error) {
		console.error("Stripe webhook processing error", error);
		return NextResponse.json(
			{ error: "Webhook processing failed" },
			{ status: 500 },
		);
	}

	return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: any) {
	const orderId = session.client_reference_id || session.metadata?.orderId;
	if (!orderId) {
		return;
	}

	const order = await Order.findById(orderId);
	if (!order) {
		return;
	}

	if (
		["paid", "refunded_partial", "refunded_full", "chargeback"].includes(
			order.status,
		)
	) {
		return;
	}

	order.status = "payment_processing";
	order.stripeCheckoutSessionId = session.id;
	order.stripePaymentIntentId =
		session.payment_intent || order.stripePaymentIntentId;
	await order.save();

	trackServerEvent("checkout_completed", {
		orderId: order._id.toString(),
		stripeCheckoutSessionId: session.id,
		stripePaymentIntentId: session.payment_intent,
	});

	if (session.payment_status === "paid" && session.payment_intent) {
		await finalizePaidOrder(
			order._id.toString(), 
			session.payment_intent, 
			null, 
			session.metadata?.promoCodeId,
			session.metadata?.referralId,
			session.metadata?.userReferrerId
		);
	}
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
	const order = await findOrderByPaymentIntent(
		paymentIntent.id,
		paymentIntent.metadata?.orderId,
	);

	if (!order) {
		return;
	}

	await finalizePaidOrder(
		order._id.toString(),
		paymentIntent.id,
		paymentIntent.latest_charge || null,
		paymentIntent.metadata?.promoCodeId,
		paymentIntent.metadata?.referralId,
		paymentIntent.metadata?.userReferrerId
	);
}

async function finalizePaidOrder(
	orderId: string,
	paymentIntentId: string,
	latestChargeId: string | null,
	promoCodeId?: string,
	referralId?: string,
	userReferrerId?: string
) {
	const order = await Order.findById(orderId);
	if (!order) {
		return;
	}

	if (order.status === "paid") {
		return;
	}

	const eventDoc = await Event.findById(order.eventId).select("title");
	const buyer = await User.findById(order.buyerUserId)
		.select("email name")
		.lean();
	const buyerEmail = buyer?.email || "paid-attendee@unknown.local";
	const buyerName = buyer?.name || "Attendee";

	for (const item of order.lineItems) {
		const inventoryUpdate = await TicketType.findOneAndUpdate(
			{
				_id: item.ticketTypeId,
				status: "active",
				$expr: {
					$lte: [{ $add: ["$quantitySold", item.quantity] }, "$quantityTotal"],
				},
			},
			{ $inc: { quantitySold: item.quantity } },
			{ new: true },
		);

		if (!inventoryUpdate) {
			order.status = "payment_failed";
			order.stripePaymentIntentId = paymentIntentId;
			await order.save();
			trackServerEvent("payment_failed", {
				orderId: order._id.toString(),
				stripePaymentIntentId: paymentIntentId,
				reason: "inventory_conflict",
			});
			return;
		}
	}

	const existingRegs = await Registration.countDocuments({
		orderId: order._id,
	});
	if (existingRegs === 0) {
		for (const item of order.lineItems) {
			for (let i = 0; i < item.quantity; i++) {
				const registrationId = new Types.ObjectId();
				const ticketCode = generateTicketCode();
				const qrPayload = generateQrPayload(
					registrationId.toString(),
					order.eventId.toString(),
				);

				await Registration.create({
					_id: registrationId,
					eventId: order.eventId,
					attendeeUserId: order.buyerUserId,
					attendeeEmail: buyerEmail,
					attendeeName: buyerName,
					status: "confirmed",
					bookingType: "paid",
					quantity: 1,
					ticketCode,
					qrPayload,
					orderId: order._id,
					ticketTypeId: item.ticketTypeId,
					source: "web",
					metadata: { paymentIntentId },
				});

				await sendRegistrationEmail(
					buyerEmail,
					buyerName,
					eventDoc?.title || "DevEvent",
					ticketCode,
				);
			}
		}
	}

	order.status = "paid";
	order.stripePaymentIntentId = paymentIntentId;
	order.stripeChargeId = latestChargeId || order.stripeChargeId;
	await order.save();

	if (promoCodeId) {
		await PromoCode.findByIdAndUpdate(promoCodeId, { $inc: { currentUses: 1 } });
	}

	if (referralId) {
		await Referral.findByIdAndUpdate(referralId, { 
			$inc: { 
				conversions: 1, 
				revenue: order.pricingSnapshot?.organizerNetEstimate || 0 
			} 
		});
	}

	if (userReferrerId) {
		await UserReferral.findOneAndUpdate(
			{
				referrerId: userReferrerId,
				eventId: order.eventId,
				referredUserId: order.buyerUserId,
			},
			{
				$set: {
					status: "converted",
					orderId: order._id,
				},
			},
			{ sort: { createdAt: -1 } }
		);

		trackServerEvent("user_referral_conversion_success", {
			referrerId: userReferrerId,
			eventId: order.eventId.toString(),
			referredUserId: order.buyerUserId.toString(),
			orderId: order._id.toString(),
		});
	}

	trackServerEvent("order_paid", {
		orderId: order._id.toString(),
		eventId: order.eventId.toString(),
		buyerUserId: order.buyerUserId.toString(),
		promoCodeId,
	});

	await PaymentTransaction.updateOne(
		{ type: "payment_captured", externalRef: paymentIntentId },
		{
			$setOnInsert: {
				orderId: order._id,
				eventId: order.eventId,
				organizerId: order.organizerId,
				buyerUserId: order.buyerUserId,
				type: "payment_captured",
				status: "succeeded",
				amount:
					order.lineItems.reduce((acc, item) => acc + item.amountTotal, 0) +
					order.pricingSnapshot.platformFeeAmount,
				currency: order.currency,
				externalRef: paymentIntentId,
				rawProviderPayload: { paymentIntentId, orderId: order._id.toString() },
				occurredAt: new Date(),
			},
		},
		{ upsert: true },
	);

	trackServerEvent("payment_succeeded", {
		orderId: order._id.toString(),
		stripePaymentIntentId: paymentIntentId,
		stripeChargeId: latestChargeId,
	});
}

async function handlePaymentIntentFailed(paymentIntent: any) {
	const order = await findOrderByPaymentIntent(
		paymentIntent.id,
		paymentIntent.metadata?.orderId,
	);

	if (!order) {
		return;
	}

	order.status = "payment_failed";
	order.stripePaymentIntentId = paymentIntent.id;
	await order.save();

	trackServerEvent("payment_failed", {
		orderId: order._id.toString(),
		stripePaymentIntentId: paymentIntent.id,
	});
}

async function handleChargeRefunded(charge: any) {
	const paymentIntentId = charge.payment_intent;
	if (!paymentIntentId) {
		return;
	}

	const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
	if (!order) {
		return;
	}

	const amountPaid =
		order.lineItems.reduce((acc, item) => acc + item.amountTotal, 0) +
		order.pricingSnapshot.platformFeeAmount;
	const refundedAmount = Number(charge.amount_refunded || 0);
	order.status =
		refundedAmount >= amountPaid ? "refunded_full" : "refunded_partial";
	await order.save();

	await Registration.updateMany(
		{ orderId: order._id, status: "confirmed" },
		{ $set: { status: "cancelled_by_organizer", cancelledAt: new Date() } },
	);

	await PaymentTransaction.updateOne(
		{ type: "refund_issued", externalRef: charge.id },
		{
			$setOnInsert: {
				orderId: order._id,
				eventId: order.eventId,
				organizerId: order.organizerId,
				buyerUserId: order.buyerUserId,
				type: "refund_issued",
				status: "succeeded",
				amount: refundedAmount,
				currency: charge.currency || order.currency,
				externalRef: charge.id,
				rawProviderPayload: {
					id: charge.id,
					payment_intent: charge.payment_intent,
					amount_refunded: charge.amount_refunded,
				},
				occurredAt: new Date(),
			},
		},
		{ upsert: true },
	);

	const refundEntry = order.refunds.find(
		(refund: any) => refund.stripeRefundId === charge.refunds?.data?.[0]?.id,
	);
	if (refundEntry) {
		refundEntry.status = "succeeded";
		refundEntry.completedAt = new Date();
	}
	await order.save();

	trackServerEvent("refund_succeeded", {
		orderId: order._id.toString(),
		stripeChargeId: charge.id,
		stripePaymentIntentId: paymentIntentId,
	});
}

async function handleChargeDisputeCreated(dispute: any) {
	const paymentIntentId = dispute.payment_intent;
	if (!paymentIntentId) {
		return;
	}

	const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
	if (!order) {
		return;
	}

	order.status = "chargeback";
	await order.save();

	await PaymentTransaction.updateOne(
		{ type: "chargeback", externalRef: dispute.id },
		{
			$setOnInsert: {
				orderId: order._id,
				eventId: order.eventId,
				organizerId: order.organizerId,
				buyerUserId: order.buyerUserId,
				type: "chargeback",
				status: "pending",
				amount: dispute.amount,
				currency: dispute.currency || order.currency,
				externalRef: dispute.id,
				rawProviderPayload: {
					id: dispute.id,
					reason: dispute.reason,
					status: dispute.status,
				},
				occurredAt: new Date(),
			},
		},
		{ upsert: true },
	);

	trackServerEvent("chargeback_created", {
		orderId: order._id.toString(),
		disputeId: dispute.id,
		stripePaymentIntentId: paymentIntentId,
	});
}

async function handleAccountUpdated(account: any) {
	await OrganizerProfile.findOneAndUpdate(
		{ stripeConnectedAccountId: account.id },
		{
			$set: {
				chargesEnabled: !!account.charges_enabled,
				payoutsEnabled: !!account.payouts_enabled,
				stripeOnboardingComplete: !!account.details_submitted,
			},
		},
	);

	trackServerEvent("organizer_connected_account_updated", {
		stripeConnectedAccountId: account.id,
		chargesEnabled: !!account.charges_enabled,
		payoutsEnabled: !!account.payouts_enabled,
	});
}

async function findOrderByPaymentIntent(
	paymentIntentId?: string,
	metadataOrderId?: string,
) {
	if (paymentIntentId) {
		const byPi = await Order.findOne({
			stripePaymentIntentId: paymentIntentId,
		});
		if (byPi) {
			return byPi;
		}
	}

	if (metadataOrderId) {
		return Order.findById(metadataOrderId);
	}

	return null;
}
