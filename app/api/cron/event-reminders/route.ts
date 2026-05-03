import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Registration from "@/database/registration.model";
import { sendEventReminderEmail } from "@/lib/email";

export async function GET(req: Request) {
	const authHeader = req.headers.get("authorization");
	const cronSecret = process.env.CRON_SECRET;

	// In Vercel, cron jobs can also pass x-vercel-cron header
	// But using Authorization Bearer token is a reliable common pattern
	if (
		!cronSecret ||
		(authHeader !== `Bearer ${cronSecret}` &&
			req.headers.get("authorization") !== `Bearer ${cronSecret}`)
	) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		await connectDB();

		const now = new Date();
		// Look for events starting tomorrow (between 24h and 48h from now)
		const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
		const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

		const events = await Event.find({
			startAt: { $gte: tomorrow, $lt: dayAfter },
			status: "published",
		});

		let emailsSent = 0;

		for (const event of events) {
			const dateStr = new Intl.DateTimeFormat("en-US", {
				dateStyle: "full",
				timeStyle: "short",
				timeZone: event.timezone || "UTC",
			}).format(event.startAt);

			let locationStr = "Online";
			if (event.eventType !== "online" && event.location) {
				locationStr =
					[
						event.location.venueName,
						event.location.city,
						event.location.country,
					]
						.filter(Boolean)
						.join(", ") || "Location TBD";
			} else if (event.eventType === "online" && event.online?.meetingUrl) {
				locationStr = event.online.meetingUrl;
			}

			const registrations = await Registration.find({
				eventId: event._id,
				status: "confirmed",
			}).select("attendeeEmail attendeeName");

			for (const reg of registrations) {
				const success = await sendEventReminderEmail(
					reg.attendeeEmail,
					reg.attendeeName,
					event.title,
					dateStr,
					locationStr
				);
				if (success) emailsSent++;
			}
		}

		return NextResponse.json({
			success: true,
			eventsProcessed: events.length,
			emailsSent,
		});
	} catch (error: any) {
		console.error("Event reminder cron failed:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: error.message },
			{ status: 500 }
		);
	}
}
