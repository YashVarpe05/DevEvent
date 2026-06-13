export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { canManageEvent } from "@/lib/event-access";
import Event from "@/database/event.model";
import Registration from "@/database/registration.model";
import OrganizerProfile from "@/database/organizer-profile.model";
import { sendEventAnnouncementEmail } from "@/lib/email";
import { isRateLimited } from "@/lib/auth.utils";

const announcementSchema = z.object({
	subject: z.string().trim().min(3).max(150),
	message: z.string().trim().min(10).max(5000),
	// confirmed = ticket holders only; all_active also reaches waitlisted/pending guests
	audience: z.enum(["confirmed", "all_active"]).default("confirmed"),
});

const MAX_RECIPIENTS = 1000;
const SEND_CHUNK_SIZE = 25;

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const { id: eventId } = await props.params;

		await connectDB();

		const event = await Event.findById(eventId);
		if (!event || event.deletedAt) {
			return NextResponse.json({ message: "Event not found" }, { status: 404 });
		}

		if (!canManageEvent(event, session)) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		// 5 announcements per event per 24 hours
		if (await isRateLimited(`announce:${eventId}`, 5, 24 * 60 * 60 * 1000)) {
			return NextResponse.json(
				{ message: "Announcement limit reached for this event. Try again tomorrow." },
				{ status: 429 },
			);
		}

		const body = await req.json().catch(() => ({}));
		const parsed = announcementSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ message: "Invalid request payload", errors: parsed.error.issues },
				{ status: 400 },
			);
		}

		const statuses =
			parsed.data.audience === "all_active"
				? ["confirmed", "waitlisted", "pending_approval"]
				: ["confirmed"];

		const registrations = await Registration.find({
			eventId,
			status: { $in: statuses },
		})
			.select("attendeeEmail attendeeName")
			.limit(MAX_RECIPIENTS)
			.lean();

		// One email per unique address
		const recipients = new Map<string, string>();
		for (const reg of registrations) {
			if (reg.attendeeEmail && !recipients.has(reg.attendeeEmail)) {
				recipients.set(reg.attendeeEmail, reg.attendeeName || "Attendee");
			}
		}

		if (recipients.size === 0) {
			return NextResponse.json(
				{ message: "No guests to notify for this audience" },
				{ status: 400 },
			);
		}

		const profile = await OrganizerProfile.findById(event.organizerProfileId)
			.select("displayName")
			.lean();
		const organizerName = profile?.displayName || session.user.name || "The Host";

		const entries = [...recipients.entries()];
		let sent = 0;
		let failed = 0;

		for (let i = 0; i < entries.length; i += SEND_CHUNK_SIZE) {
			const chunk = entries.slice(i, i + SEND_CHUNK_SIZE);
			const results = await Promise.allSettled(
				chunk.map(([email, name]) =>
					sendEventAnnouncementEmail(
						email,
						name,
						event.title,
						organizerName,
						parsed.data.subject,
						parsed.data.message,
					),
				),
			);
			for (const result of results) {
				if (result.status === "fulfilled" && result.value) sent++;
				else failed++;
			}
		}

		return NextResponse.json(
			{
				message: `Announcement sent to ${sent} guest${sent === 1 ? "" : "s"}${failed > 0 ? ` (${failed} failed)` : ""}`,
				sent,
				failed,
			},
			{ status: 200 },
		);
	} catch (error: any) {
		console.error("Announcement error:", error);
		return NextResponse.json({ message: "Failed to send announcement" }, { status: 500 });
	}
}
