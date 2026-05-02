import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Order from "@/database/order.model";

export async function GET(
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
		const event = await Event.findOne({
			_id: id,
			organizerId: session.user.id,
		}).lean();
		if (!event) {
			return NextResponse.json(
				{ error: "Event not found or unauthorized" },
				{ status: 404 },
			);
		}

		const url = new URL(request.url);
		const status = url.searchParams.get("status");
		const query: any = { eventId: id, organizerId: session.user.id };
		if (status) {
			query.status = status;
		}

		const orders = await Order.find(query)
			.sort({ createdAt: -1 })
			.select(
				"status currency lineItems pricingSnapshot createdAt buyerUserId stripePaymentIntentId stripeCheckoutSessionId",
			)
			.lean();

		return NextResponse.json({ orders });
	} catch (error: any) {
		console.error("Organizer event orders error", error);
		return NextResponse.json(
			{ error: error.message || "Failed to load event orders" },
			{ status: 500 },
		);
	}
}
