export const dynamic = 'force-dynamic';
import crypto from "crypto";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import connectDB from "@/lib/mongodb";
import Order from "@/database/order.model";
import Referral from "@/database/referral.model";
import TicketType from "@/database/ticket-type.model";
import Registration from "@/database/registration.model";
import PaymentTransaction from "@/database/payment-transaction.model";
import Event from "@/database/event.model";
import User from "@/database/user.model";
import UserReferral from "@/database/user-referral.model";
import { generateQrPayload, generateTicketCode } from "@/lib/utils/ticket";
import { sendRegistrationEmail } from "@/lib/email";
import { trackServerEvent } from "@/lib/analytics";
import { generateEventICS } from "@/lib/ics";
import { adjustRegistrationsCount } from "@/lib/registrations";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

		if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		// Verify signature
		const expectedSignature = crypto
			.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
			.update(razorpay_order_id + "|" + razorpay_payment_id)
			.digest("hex");

		if (expectedSignature !== razorpay_signature) {
			return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
		}

		await connectDB();

		const order = await Order.findById(orderId);
		if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
		if (order.status === "paid") {
			return NextResponse.json({ success: true, orderId: order._id, alreadyPaid: true });
		}

		order.status = "paid";
		order.razorpayPaymentId = razorpay_payment_id;
		order.razorpaySignature = razorpay_signature;
		await order.save();

		// Process registrations
		const eventDoc = await Event.findById(order.eventId).select(
			"title slug shortDescription startAt endAt location eventType",
		);
		const buyer = await User.findById(order.buyerUserId).select("email name").lean();
		const buyerEmail = buyer?.email || "paid-attendee@unknown.local";
		const buyerName = buyer?.name || "Attendee";

		for (const item of order.lineItems) {
			const inv = await TicketType.findOneAndUpdate(
				{
					_id: item.ticketTypeId, status: "active",
					$expr: { $lte: [{ $add: ["$quantitySold", item.quantity] }, "$quantityTotal"] },
				},
				{ $inc: { quantitySold: item.quantity } },
				{ new: true },
			);
			if (!inv) {
				order.status = "payment_failed";
				await order.save();
				return NextResponse.json({ error: "Inventory conflict" }, { status: 409 });
			}
		}

		const existingRegs = await Registration.countDocuments({ orderId: order._id });
		if (existingRegs === 0) {
			const icsContent = eventDoc
				? generateEventICS({
						id: eventDoc._id.toString(),
						slug: eventDoc.slug,
						title: eventDoc.title,
						description: eventDoc.shortDescription,
						startAt: eventDoc.startAt,
						endAt: eventDoc.endAt,
						location: eventDoc.location,
						eventType: eventDoc.eventType,
					})
				: undefined;
			let createdSeats = 0;
			for (const item of order.lineItems) {
				for (let i = 0; i < item.quantity; i++) {
					const regId = new Types.ObjectId();
					const ticketCode = generateTicketCode();
					const qrPayload = generateQrPayload(regId.toString(), order.eventId.toString());
					await Registration.create({
						_id: regId, eventId: order.eventId, attendeeUserId: order.buyerUserId,
						attendeeEmail: buyerEmail, attendeeName: buyerName, status: "confirmed",
						bookingType: "paid", quantity: 1, ticketCode, qrPayload,
						orderId: order._id, ticketTypeId: item.ticketTypeId, source: "web",
						metadata: { razorpayPaymentId: razorpay_payment_id },
					});
					createdSeats++;
					await sendRegistrationEmail(buyerEmail, buyerName, eventDoc?.title || "DevEvent", ticketCode, icsContent);
				}
			}
			if (createdSeats > 0) {
				await adjustRegistrationsCount(order.eventId, createdSeats);
			}
		}

		// Update referral
		if (order.referralId) {
			await Referral.findByIdAndUpdate(order.referralId, {
				$inc: { conversions: 1, revenue: order.pricingSnapshot?.organizerNetEstimate || 0 },
			});
		}

		const userRef = await UserReferral.findOne({
			eventId: order.eventId, referredUserId: order.buyerUserId,
			status: { $in: ["clicked", "signed_up"] },
		}).sort({ createdAt: -1 });

		if (userRef) {
			await UserReferral.findByIdAndUpdate(userRef._id, {
				$set: { status: "converted", orderId: order._id },
			});
			trackServerEvent("user_referral_conversion_success", {
				referrerId: userRef.referrerId.toString(), eventId: order.eventId.toString(),
				referredUserId: order.buyerUserId.toString(), orderId: order._id.toString(),
			});
		}

		// Analytics + transaction record
		trackServerEvent("order_paid", {
			orderId: order._id.toString(), eventId: order.eventId.toString(),
			buyerUserId: order.buyerUserId.toString(), paymentGateway: "razorpay",
		});

		await PaymentTransaction.updateOne(
			{ type: "payment_captured", externalRef: razorpay_payment_id },
			{
				$setOnInsert: {
					orderId: order._id, eventId: order.eventId,
					organizerId: order.organizerId, buyerUserId: order.buyerUserId,
					type: "payment_captured", status: "succeeded",
					amount: order.lineItems.reduce((a: number, i: any) => a + i.amountTotal, 0) + order.pricingSnapshot.platformFeeAmount,
					currency: order.currency, externalRef: razorpay_payment_id,
					rawProviderPayload: { razorpayPaymentId: razorpay_payment_id, razorpayOrderId: razorpay_order_id },
					occurredAt: new Date(),
				},
			},
			{ upsert: true },
		);

		return NextResponse.json({ success: true, orderId: order._id });
	} catch (error: unknown) {
		console.error("Razorpay Webhook Error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal Server Error" },
			{ status: 500 },
		);
	}
}
