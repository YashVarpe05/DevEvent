export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Order from "@/database/order.model";
import { stripe } from "@/lib/stripe";
import { organizerRefundSchema } from "@/lib/validations/refund";
import { trackServerEvent } from "@/lib/analytics";
import { NextResponse } from "next/server";
import { Types } from "mongoose";

type RefundEntry = {
	status: "pending" | "succeeded" | "failed";
	amount: number;
};

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();
		const body = await request.json().catch(() => ({}));
		const parsed = organizerRefundSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid payload", issues: parsed.error.issues },
				{ status: 400 },
			);
		}

		const isAdmin = session.user.roles?.includes("admin");
		const order = await Order.findById(id);

		if (
			!order ||
			(!isAdmin && order.organizerId.toString() !== session.user.id)
		) {
			return NextResponse.json(
				{ error: "Order not found or unauthorized" },
				{ status: 404 },
			);
		}

		if (!["paid", "refunded_partial"].includes(order.status)) {
			return NextResponse.json(
				{ error: "Only paid orders can be refunded" },
				{ status: 400 },
			);
		}

		if (!order.stripePaymentIntentId) {
			return NextResponse.json(
				{ error: "No payment intent found for this order" },
				{ status: 400 },
			);
		}

		const amountPaid =
			order.lineItems.reduce((sum, item) => sum + item.amountTotal, 0) +
			(order.pricingSnapshot?.platformFeeAmount || 0);
		const refundedSoFar = (order.refunds || [])
			.filter((refund: RefundEntry) => refund.status !== "failed")
			.reduce((sum: number, refund: RefundEntry) => sum + refund.amount, 0);
		const remainingRefundable = Math.max(0, amountPaid - refundedSoFar);

		if (remainingRefundable <= 0) {
			return NextResponse.json(
				{ error: "Order is no longer refundable" },
				{ status: 400 },
			);
		}

		const requestedAmount = parsed.data.amount || remainingRefundable;
		if (requestedAmount > remainingRefundable) {
			return NextResponse.json(
				{ error: "Requested refund exceeds refundable amount" },
				{ status: 400 },
			);
		}

		// Create Refund via Stripe
		// Note: For Destination Charges, we refund the PaymentIntent on the Platform.
		// Stripe handles reversing the transfer from the connected account automatically IF configured.
		const refund = await stripe.refunds.create({
			payment_intent: order.stripePaymentIntentId,
			amount: requestedAmount,
			reason: "requested_by_customer",
			reverse_transfer: true, // Reclaim funds from the connected account
			refund_application_fee: true, // Refund our platform fee too
			metadata: {
				orderId: order._id.toString(),
				initiatedByUserId: session.user.id,
				reason: parsed.data.reason,
			},
		});

		order.refunds.push({
			stripeRefundId: refund.id,
			amount: requestedAmount,
			reason: parsed.data.reason,
			// [FIXED]: Store refund initiator as a MongoDB ObjectId, not a raw session string.
			initiatedByUserId: new Types.ObjectId(session.user.id),
			initiatedByRole: isAdmin ? "admin" : "organizer",
			status: "pending",
			requestedAt: new Date(),
			completedAt: null,
		});

		order.status = "payment_processing";
		await order.save();

		trackServerEvent("refund_requested", {
			orderId: order._id.toString(),
			stripeRefundId: refund.id,
			initiatedByUserId: session.user.id,
			amount: requestedAmount,
		});

		return NextResponse.json({
			message: "Refund initiated successfully",
			refundId: refund.id,
			amount: requestedAmount,
		});
	} catch (error: unknown) {
		console.error("Refund Error:", error);
		const message =
			error instanceof Error ? error.message : "Internal server error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
