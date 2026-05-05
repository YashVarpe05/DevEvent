import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Order from "@/database/order.model";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		// Ensure Event registration for population
		require("@/database/event.model");

		const orders = await Order.find({ buyerUserId: session.user.id })
			.populate("eventId", "title slug coverImageUrl")
			.select(
				"status currency lineItems pricingSnapshot refunds createdAt stripeCheckoutSessionId stripePaymentIntentId",
			)
			.sort({ createdAt: -1 });

		return NextResponse.json({ orders });
	} catch (error: any) {
		console.error("My Orders Fetch Error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
