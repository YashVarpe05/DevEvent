import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Order from "@/database/order.model";
import User from "@/database/user.model";
import Registration from "@/database/registration.model";
import { sendOrganizerPayoutSummaryEmail } from "@/lib/email";

export async function GET(req: Request) {
	const authHeader = req.headers.get("authorization");
	const cronSecret = process.env.CRON_SECRET;

	if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		await connectDB();

		const now = new Date();
		// Look for events that ended in the past 24 hours
		const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

		const endedEvents = await Event.find({
			endAt: { $gte: yesterday, $lt: now },
			status: { $in: ["published", "unpublished"] },
		});

		let emailsSent = 0;

		for (const event of endedEvents) {
			const organizer = await User.findById(event.organizerId).select(
				"email name"
			);
			if (!organizer || !organizer.email) continue;

			// Total tickets sold (includes free tickets)
			const ticketCount = await Registration.countDocuments({
				eventId: event._id,
				status: "confirmed",
			});

			// Net revenue from paid orders
			const orders = await Order.find({
				eventId: event._id,
				status: "paid",
			}).select("pricingSnapshot currency");

			let totalRevenue = 0;
			let currency = event.currency || "USD";

			for (const order of orders) {
				totalRevenue += order.pricingSnapshot?.organizerNetEstimate || 0;
				if (order.currency) {
					currency = order.currency;
				}
			}

			const formattedRevenue = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: currency.toUpperCase(),
			}).format(totalRevenue);

			const success = await sendOrganizerPayoutSummaryEmail(
				organizer.email,
				organizer.name || "Organizer",
				event.title,
				ticketCount,
				formattedRevenue
			);

			if (success) emailsSent++;
		}

		return NextResponse.json({
			success: true,
			eventsProcessed: endedEvents.length,
			emailsSent,
		});
	} catch (error: any) {
		console.error("Organizer payout cron failed:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: error.message },
			{ status: 500 }
		);
	}
}
