export const dynamic = 'force-dynamic';
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
		const page = parseInt(url.searchParams.get("page") || "1", 10);
		const limit = parseInt(url.searchParams.get("limit") || "50", 10);
		const skip = (page - 1) * limit;

		const query: any = { eventId: id, organizerId: session.user.id };
		if (status) {
			query.status = status;
		}

		const total = await Order.countDocuments(query);
		const orders = await Order.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.select(
				"status currency lineItems pricingSnapshot createdAt buyerUserId stripePaymentIntentId stripeCheckoutSessionId",
			)
			.lean();

		return NextResponse.json({
			orders,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error: any) {
		console.error("Organizer event orders error", error);
		return NextResponse.json(
			{ error: error.message || "Failed to load event orders" },
			{ status: 500 },
		);
	}
}
