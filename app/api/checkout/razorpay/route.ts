export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import TicketType from "@/database/ticket-type.model";
import Order from "@/database/order.model";
import PromoCode from "@/database/promo-code.model";
import Referral from "@/database/referral.model";
import Registration from "@/database/registration.model";
import { razorpay } from "@/lib/razorpay";
import { calculatePricing } from "@/lib/pricing";
import { createCheckoutSessionSchema } from "@/lib/validations/checkout";
import { getClientIp, isRateLimited } from "@/lib/auth.utils";
import { trackServerEvent } from "@/lib/analytics";
import { generateTicketCode, generateQrPayload } from "@/lib/utils/ticket";
import { sendRegistrationEmail } from "@/lib/email";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		// Step 1 — Auth check
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		// Step 2 — Parse and validate body
		const body = await request.json();
		const parsed = createCheckoutSessionSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid payload", issues: parsed.error.issues },
				{ status: 400 },
			);
		}

		const { eventId, items, idempotencyKey, promoCode, referralCode } = parsed.data;

		// Step 3 — Rate limiting
		const clientIp = getClientIp(request);

		if (
			await isRateLimited(`checkout:create:${clientIp}`, 10, 10 * 60 * 1000)
		) {
			return NextResponse.json(
				{ error: "Too many checkout attempts" },
				{ status: 429 },
			);
		}
		if (
			await isRateLimited(
				`checkout:event-spike:${eventId}`,
				50,
				10 * 60 * 1000,
			)
		) {
			console.warn("Suspicious checkout spike detected", { eventId });
			return NextResponse.json(
				{ error: "Checkout temporarily limited for this event" },
				{ status: 429 },
			);
		}

		// Step 4 — Idempotency check (check existing order with razorpayOrderId)
		const existingOrder = await Order.findOne({
			eventId,
			buyerUserId: session.user.id,
			idempotencyKey,
			status: { $in: ["pending_payment", "payment_processing", "paid"] },
		});

		if (existingOrder?.razorpayOrderId) {
			return NextResponse.json({
				razorpayOrderId: existingOrder.razorpayOrderId,
				amount: existingOrder.lineItems.reduce((acc: number, item: any) => acc + item.amountTotal, 0) +
					existingOrder.pricingSnapshot.platformFeeAmount,
				currency: existingOrder.currency.toUpperCase(),
				orderId: existingOrder._id.toString(),
				keyId: process.env.RAZORPAY_KEY_ID,
				reused: true,
			});
		}

		// Step 5 — Validate event, tickets, promo code
		const event = await Event.findById(eventId);
		if (!event)
			return NextResponse.json({ error: "Event not found" }, { status: 404 });
		if (!event.isPaid) {
			return NextResponse.json(
				{ error: "This is not a paid event" },
				{ status: 400 },
			);
		}
		if (event.status !== "published") {
			return NextResponse.json(
				{ error: "Event is not open for ticket sales" },
				{ status: 400 },
			);
		}

		const now = new Date();
		if (event.registrationStartAt && now < event.registrationStartAt) {
			return NextResponse.json(
				{ error: "Ticket sales have not started" },
				{ status: 400 },
			);
		}
		if (event.registrationEndAt && now > event.registrationEndAt) {
			return NextResponse.json(
				{ error: "Ticket sales have ended" },
				{ status: 400 },
			);
		}

		const ticketTypes = await TicketType.find({
			_id: { $in: items.map((i) => i.ticketTypeId) },
			eventId: eventId,
			status: "active",
			isHidden: false,
		});

		if (ticketTypes.length !== items.length) {
			return NextResponse.json(
				{ error: "Some tickets are no longer available" },
				{ status: 400 },
			);
		}

		for (const selectedItem of items) {
			const ticket = ticketTypes.find(
				(t) => t._id.toString() === selectedItem.ticketTypeId,
			);
			if (!ticket) {
				return NextResponse.json(
					{ error: "Invalid ticket selection" },
					{ status: 400 },
				);
			}

			if (
				selectedItem.quantity < ticket.minPerOrder ||
				selectedItem.quantity > ticket.maxPerOrder
			) {
				return NextResponse.json(
					{
						error: `Ticket quantity for ${ticket.name} is outside allowed limits`,
					},
					{ status: 400 },
				);
			}

			if (ticket.salesStartAt && now < new Date(ticket.salesStartAt)) {
				return NextResponse.json(
					{ error: `${ticket.name} sales have not started` },
					{ status: 400 },
				);
			}
			if (ticket.salesEndAt && now > new Date(ticket.salesEndAt)) {
				return NextResponse.json(
					{ error: `${ticket.name} sales have ended` },
					{ status: 400 },
				);
			}

			const remaining = Math.max(0, ticket.quantityTotal - ticket.quantitySold);
			if (remaining < selectedItem.quantity) {
				return NextResponse.json(
					{ error: `${ticket.name} does not have enough inventory` },
					{ status: 409 },
				);
			}
		}

		// Validate Promo Code
		let discount;
		let appliedPromoCode;
		if (promoCode) {
			const promo = await PromoCode.findOne({
				eventId,
				code: promoCode.toUpperCase(),
				isActive: true,
			});

			if (!promo) {
				return NextResponse.json({ error: "Invalid promo code" }, { status: 400 });
			}

			if (promo.expiresAt && now > new Date(promo.expiresAt)) {
				return NextResponse.json({ error: "Promo code has expired" }, { status: 400 });
			}

			if (promo.maxUses && promo.currentUses >= promo.maxUses) {
				return NextResponse.json({ error: "Promo code has reached its usage limit" }, { status: 400 });
			}

			appliedPromoCode = promo;
			discount = {
				type: promo.type,
				value: promo.value,
			};
		}

		// Validate Referral Code
		let appliedReferral;
		if (referralCode) {
			const ref = await Referral.findOne({
				eventId,
				code: referralCode.toLowerCase(),
			});
			if (ref) {
				appliedReferral = ref;
			}
		}

		// User Referral lookup
		let appliedUserReferrerId;
		const { default: UserReferral } = await import("@/database/user-referral.model");
		const userRefRecord = await UserReferral.findOne({
			eventId,
			referredUserId: session.user.id,
		}).sort({ createdAt: -1 });

		if (userRefRecord && ["clicked", "signed_up"].includes(userRefRecord.status)) {
			appliedUserReferrerId = userRefRecord.referrerId.toString();
		} else {
			const { getUserReferralCookie } = await import("@/lib/utils/user-referral");
			const urefCookie = await getUserReferralCookie();
			if (urefCookie && urefCookie.eventId === eventId) {
				appliedUserReferrerId = urefCookie.referrerId;
			}
		}

		// Step 6 — Calculate pricing
		const pricingItems = items.map((item) => ({
			ticketType: ticketTypes.find(
				(t) => t._id.toString() === item.ticketTypeId,
			)!,
			quantity: item.quantity,
		}));

		const pricing = calculatePricing({
			lineItems: pricingItems.map((pi) => ({
				ticketTypeId: pi.ticketType._id.toString(),
				quantity: pi.quantity,
				unitPrice: pi.ticketType.price,
			})),
			currency: (
				ticketTypes[0]?.currency ||
				event.currency ||
				"inr"
			).toLowerCase(),
			organizerPlan: "free",
			eventId: event._id.toString(),
			discount,
		});

		// Calculate item-level discount proportional to subtotal if there's a discount
		const itemTotals = pricingItems.map((pi) => {
			const sub = pi.ticketType.price * pi.quantity;
			let itemDiscount = 0;
			if (pricing.discountAmount > 0 && pricing.subtotal > 0) {
				itemDiscount = Math.round(pricing.discountAmount * (sub / pricing.subtotal));
			}
			return {
				...pi,
				subtotal: sub,
				amountDiscount: itemDiscount,
				amountTotal: Math.max(0, sub - itemDiscount),
			};
		});

		// Fix any rounding diff on amountDiscount
		const totalAssignedDiscount = itemTotals.reduce((acc, it) => acc + it.amountDiscount, 0);
		if (totalAssignedDiscount !== pricing.discountAmount && itemTotals.length > 0) {
			itemTotals[0].amountDiscount += (pricing.discountAmount - totalAssignedDiscount);
			itemTotals[0].amountTotal = Math.max(0, itemTotals[0].subtotal - itemTotals[0].amountDiscount);
		}

		// Step 7 — Create Pending Order
		const order = await Order.create({
			eventId,
			buyerUserId: session.user.id,
			organizerId: event.organizerId,
			status: "pending_payment",
			paymentGateway: "razorpay",
			currency: pricing.currency,
			lineItems: itemTotals.map((it) => ({
				ticketTypeId: it.ticketType._id,
				ticketNameSnapshot: it.ticketType.name,
				quantity: it.quantity,
				unitPrice: it.ticketType.price,
				subtotal: it.subtotal,
				amountSubtotal: it.subtotal,
				amountDiscount: it.amountDiscount,
				amountTotal: it.amountTotal,
			})),
			pricingSnapshot: {
				platformFeeRate: pricing.platformFeeRate,
				platformFeeFixed: pricing.platformFeeFixed,
				platformFeeAmount: pricing.platformFeeAmount,
				processorFeeEstimate: pricing.processorFeeEstimate,
				organizerNetEstimate: pricing.organizerNetEstimate,
			},
			idempotencyKey,
			referralId: appliedReferral ? appliedReferral._id : undefined,
			referralCode: appliedReferral ? appliedReferral.code : undefined,
			refunds: [],
			expiresAt: new Date(Date.now() + 30 * 60000), // 30 min expiry
		});

		const appUrl =
			process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL;

		// --- FREE TIER BYPASS LOGIC ---
		const totalOrderAmount = pricing.totalBuyerPayable;

		if (totalOrderAmount === 0) {
			// Bypass Razorpay, finalize order immediately
			order.status = "paid";
			order.razorpayOrderId = "free_bypass_" + Date.now();
			await order.save();

			if (appliedPromoCode) {
				appliedPromoCode.currentUses += 1;
				await appliedPromoCode.save();
			}

			if (appliedReferral) {
				await Referral.findByIdAndUpdate(appliedReferral._id, {
					$inc: { conversions: 1 },
				});
			}

			if (appliedUserReferrerId) {
				await UserReferral.findOneAndUpdate(
					{ referrerId: appliedUserReferrerId, eventId, referredUserId: session.user.id },
					{ status: "converted", orderId: order._id },
					{ upsert: true }
				);

				trackServerEvent("user_referral_conversion_success", {
					referrerId: appliedUserReferrerId,
					eventId: eventId.toString(),
					referredUserId: session.user.id.toString(),
					orderId: order._id.toString(),
				});
			}

			const buyerEmail = session.user.email || "paid-attendee@unknown.local";
			const buyerName = session.user.name || "Attendee";

			for (const item of pricingItems) {
				const inventoryUpdate = await TicketType.findOneAndUpdate(
					{
						_id: item.ticketType._id,
						status: "active",
						$expr: {
							$lte: [
								{ $add: ["$quantitySold", item.quantity] },
								"$quantityTotal",
							],
						},
					},
					{ $inc: { quantitySold: item.quantity } },
					{ new: true },
				);

				if (!inventoryUpdate) {
					order.status = "payment_failed";
					await order.save();
					return NextResponse.json(
						{ error: "Inventory conflict during free order processing" },
						{ status: 409 },
					);
				}

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
						bookingType: "free",
						quantity: 1,
						ticketCode,
						qrPayload,
						orderId: order._id,
						ticketTypeId: item.ticketType._id,
						source: "web",
					});

					await sendRegistrationEmail(
						buyerEmail,
						buyerName,
						event.title,
						ticketCode,
					);
				}
			}

			trackServerEvent("free_order_processed", {
				orderId: order._id.toString(),
				eventId: eventId,
				buyerUserId: session.user.id,
			});

			return NextResponse.json({
				url: `${appUrl}/orders/${order._id}/confirmation`,
				orderId: order._id,
				pricing,
				bypassed: true,
			});
		}
		// --- END FREE TIER BYPASS LOGIC ---

		// Step 8 — Create Razorpay order
		const razorpayOrder = await razorpay.orders.create({
			amount: pricing.totalBuyerPayable,
			currency: pricing.currency.toUpperCase(),
			receipt: order._id.toString(),
			notes: {
				orderId: order._id.toString(),
				eventId: eventId,
				buyerUserId: session.user.id,
			},
		});

		// Step 9 — Save razorpayOrderId to order
		order.razorpayOrderId = razorpayOrder.id;
		await order.save();

		trackServerEvent("razorpay_order_created", {
			orderId: order._id.toString(),
			razorpayOrderId: razorpayOrder.id,
			eventId: eventId,
			buyerUserId: session.user.id,
		});

		// Step 10 — Return to client
		return NextResponse.json({
			razorpayOrderId: razorpayOrder.id,
			amount: pricing.totalBuyerPayable,
			currency: pricing.currency.toUpperCase(),
			orderId: order._id.toString(),
			keyId: process.env.RAZORPAY_KEY_ID,
			prefill: {
				name: session.user.name || "",
				email: session.user.email || "",
			},
			pricing,
		});
	} catch (error: unknown) {
		console.error("Razorpay Checkout Error:", error);
		const message =
			error instanceof Error ? error.message : "Internal Server Error";
		return NextResponse.json(
			{ error: message },
			{ status: 500 },
		);
	}
}
