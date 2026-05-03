import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Order from "@/database/order.model";
import TicketType from "@/database/ticket-type.model";

export async function GET(request: Request) {
	try {
		const authHeader = request.headers.get("authorization");
		const cronSecret = process.env.CRON_SECRET;

		if (!cronSecret) {
			return NextResponse.json(
				{ error: "Server misconfiguration: CRON_SECRET is not set." },
				{ status: 500 },
			);
		}

		if (authHeader !== `Bearer ${cronSecret}`) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		// Task 1: Transition published events to `completed` if endAt is in the past
		const now = new Date();
		const eventsResult = await Event.updateMany(
			{
				status: "published",
				endAt: { $lt: now },
				deletedAt: null,
			},
			{
				$set: { status: "completed" },
			},
		);

		// Task 2: Expire pending orders stuck in pending_payment for > 30 mins
		const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
		const staleOrders = await Order.find({
			status: "pending_payment",
			createdAt: { $lt: thirtyMinsAgo },
		});

		let expiredOrdersCount = 0;
		for (const order of staleOrders) {
			// Release ticket inventory
			const refunds = [];
			for (const item of order.lineItems) {
				await TicketType.updateOne(
					{ _id: item.ticketTypeId },
					{ $inc: { availableQuantity: item.quantity } },
				);
				refunds.push({
					ticketTypeId: item.ticketTypeId,
					quantity: item.quantity,
				});
			}

			order.status = "cancelled";
			await order.save();
			expiredOrdersCount++;
		}

		return NextResponse.json({
			success: true,
			eventsCompleted: eventsResult.modifiedCount,
			ordersExpired: expiredOrdersCount,
		});
	} catch (error: any) {
		console.error("Cron endpoint error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to execute cron tasks" },
			{ status: 500 },
		);
	}
}
