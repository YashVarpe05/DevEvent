import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Registration from "@/database/registration.model";
import {
	sendEventReminderEmail,
	sendEventStartingSoonEmail,
	sendFeedbackRequestEmail,
} from "@/lib/email";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://devevents.dev";

// Lifecycle email pipeline — designed to run hourly (see vercel.json):
//  1. Day-before reminder (event starts in 24–48h)
//  2. Starting-soon nudge (event starts within ~70min; join link for online)
//  3. Post-event feedback prompt (event ended within the last 26h)
// Each stage claims an idempotency flag on the event before sending, so
// overlapping or repeated runs never double-email guests.

type LifecycleStage = "dayBeforeSentAt" | "hourBeforeSentAt" | "feedbackSentAt";

async function claimStage(eventId: { toString(): string }, stage: LifecycleStage): Promise<boolean> {
	const result = await Event.updateOne(
		{
			_id: eventId.toString(),
			$or: [
				{ [`lifecycleEmails.${stage}`]: null },
				{ [`lifecycleEmails.${stage}`]: { $exists: false } },
			],
		} as Record<string, unknown>,
		{ $set: { [`lifecycleEmails.${stage}`]: new Date() } },
	);
	return result.modifiedCount === 1;
}

async function confirmedGuests(eventId: { toString(): string }) {
	return Registration.find({ eventId: eventId.toString(), status: "confirmed" }).select(
		"attendeeEmail attendeeName",
	);
}

function formatLocation(event: {
	eventType: string;
	location?: { venueName?: string; city?: string; country?: string };
	online?: { meetingUrl?: string };
}): string {
	if (event.eventType !== "online" && event.location) {
		return (
			[event.location.venueName, event.location.city, event.location.country]
				.filter(Boolean)
				.join(", ") || "Location TBD"
		);
	}
	return event.online?.meetingUrl || "Online";
}

export async function GET(req: Request) {
	const authHeader = req.headers.get("authorization");
	const cronSecret = process.env.CRON_SECRET;

	if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		await connectDB();

		const now = new Date();
		const stats = { dayBefore: 0, startingSoon: 0, feedback: 0 };

		// ── Stage 1: day-before reminders ────────────────────────────────────
		const upcomingEvents = await Event.find({
			startAt: {
				$gte: new Date(now.getTime() + 24 * 60 * 60 * 1000),
				$lt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
			},
			status: "published",
		});

		for (const event of upcomingEvents) {
			if (!(await claimStage(event._id, "dayBeforeSentAt"))) continue;

			const dateStr = new Intl.DateTimeFormat("en-US", {
				dateStyle: "full",
				timeStyle: "short",
				timeZone: event.timezone || "UTC",
			}).format(event.startAt);
			const locationStr = formatLocation(event);

			for (const reg of await confirmedGuests(event._id)) {
				const ok = await sendEventReminderEmail(
					reg.attendeeEmail,
					reg.attendeeName,
					event.title,
					dateStr,
					locationStr,
				);
				if (ok) stats.dayBefore++;
			}
		}

		// ── Stage 2: starting-soon (within ~70 minutes) ──────────────────────
		const startingSoonEvents = await Event.find({
			startAt: { $gte: now, $lt: new Date(now.getTime() + 70 * 60 * 1000) },
			status: "published",
		});

		for (const event of startingSoonEvents) {
			if (!(await claimStage(event._id, "hourBeforeSentAt"))) continue;

			const timeStr = new Intl.DateTimeFormat("en-US", {
				timeStyle: "short",
				timeZone: event.timezone || "UTC",
			}).format(event.startAt);
			const isOnline =
				(event.eventType === "online" || event.eventType === "hybrid") &&
				Boolean(event.online?.meetingUrl);
			const joinInfo = isOnline
				? event.online!.meetingUrl!
				: formatLocation(event);

			for (const reg of await confirmedGuests(event._id)) {
				const ok = await sendEventStartingSoonEmail(
					reg.attendeeEmail,
					reg.attendeeName,
					event.title,
					timeStr,
					joinInfo,
					isOnline,
				);
				if (ok) stats.startingSoon++;
			}
		}

		// ── Stage 3: post-event feedback prompt ──────────────────────────────
		const endedEvents = await Event.find({
			endAt: {
				$gte: new Date(now.getTime() - 26 * 60 * 60 * 1000),
				$lt: now,
			},
			status: { $in: ["published", "completed"] },
		});

		for (const event of endedEvents) {
			if (!(await claimStage(event._id, "feedbackSentAt"))) continue;

			const registrations = await Registration.find({
				eventId: event._id,
				status: "confirmed",
			}).select("attendeeEmail attendeeName");

			for (const reg of registrations) {
				const ok = await sendFeedbackRequestEmail(
					reg.attendeeEmail,
					reg.attendeeName,
					event.title,
					`${BASE_URL}/my/registrations/${reg._id}`,
				);
				if (ok) stats.feedback++;
			}
		}

		return NextResponse.json({ success: true, ...stats });
	} catch (error: any) {
		console.error("Lifecycle email cron failed:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: error.message },
			{ status: 500 },
		);
	}
}
