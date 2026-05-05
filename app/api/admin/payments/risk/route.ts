import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Order from "@/database/order.model";

export async function GET() {
	try {
		const session = await auth();
		if (!session?.user?.id || !session.user.roles?.includes("admin")) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		await connectDB();
		const riskyOrders = await Order.find({
			status: {
				$in: [
					"payment_failed",
					"chargeback",
					"refunded_partial",
					"refunded_full",
				],
			},
		})
			.sort({ updatedAt: -1 })
			.select(
				"eventId buyerUserId organizerId status stripePaymentIntentId stripeChargeId createdAt updatedAt",
			)
			.limit(200)
			.lean();

		return NextResponse.json({ orders: riskyOrders });
	} catch (error: any) {
		console.error("Admin risk payments error", error);
		return NextResponse.json(
			{ error: error.message || "Failed to load risk payments" },
			{ status: 500 },
		);
	}
}
