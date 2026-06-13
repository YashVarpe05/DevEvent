export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { canManageEvent } from "@/lib/event-access";
import Event from "@/database/event.model";
import OrganizerProfile from "@/database/organizer-profile.model";
import { sendEventInviteEmail } from "@/lib/email";
import { isRateLimited } from "@/lib/auth.utils";

const inviteSchema = z.object({
	emails: z
		.array(z.string().trim().toLowerCase().pipe(z.email()))
		.min(1)
		.max(20),
	message: z.string().trim().max(500).optional(),
});

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

		if (event.status !== "published") {
			return NextResponse.json(
				{ message: "Publish the event before inviting guests" },
				{ status: 400 },
			);
		}

		// 100 invites per event per 24 hours
		if (await isRateLimited(`invite:${eventId}`, 100, 24 * 60 * 60 * 1000)) {
			return NextResponse.json(
				{ message: "Invite limit reached for this event. Try again tomorrow." },
				{ status: 429 },
			);
		}

		const body = await req.json().catch(() => ({}));
		const parsed = inviteSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ message: "Invalid request payload — check the email addresses", errors: parsed.error.issues },
				{ status: 400 },
			);
		}

		const profile = await OrganizerProfile.findById(event.organizerProfileId)
			.select("displayName")
			.lean();
		const organizerName = profile?.displayName || session.user.name || "The Host";

		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://devevents.dev";
		const eventUrl = `${baseUrl}/events/${event.slug}`;

		const uniqueEmails = [...new Set(parsed.data.emails)];
		const results = await Promise.allSettled(
			uniqueEmails.map((email) =>
				sendEventInviteEmail(email, event.title, eventUrl, organizerName, parsed.data.message),
			),
		);

		const sent = results.filter((r) => r.status === "fulfilled" && r.value).length;
		const failed = uniqueEmails.length - sent;

		return NextResponse.json(
			{
				message: `Invitation sent to ${sent} ${sent === 1 ? "person" : "people"}${failed > 0 ? ` (${failed} failed)` : ""}`,
				sent,
				failed,
			},
			{ status: 200 },
		);
	} catch (error: any) {
		console.error("Invite error:", error);
		return NextResponse.json({ message: "Failed to send invitations" }, { status: 500 });
	}
}
