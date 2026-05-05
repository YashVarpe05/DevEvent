import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Order from "@/database/order.model";
import Event from "@/database/event.model";

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

		const order = await Order.findById(id).lean();
		if (!order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		const isOwner = order.buyerUserId.toString() === session.user.id;
		const isAdmin = session.user.roles?.includes("admin");
		const isOrganizer = order.organizerId.toString() === session.user.id;

		if (!isOwner && !isAdmin && !isOrganizer) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const event = await Event.findById(order.eventId)
			.select("title slug")
			.lean();
		return NextResponse.json({ order: { ...order, event } });
	} catch (error: any) {
		console.error("Get order by id error", error);
		return NextResponse.json(
			{ error: error.message || "Failed to load order" },
			{ status: 500 },
		);
	}
}
