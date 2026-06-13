import crypto from "crypto";
import FollowOrganizer from "@/database/follow-organizer.model";
import OrganizerProfile from "@/database/organizer-profile.model";
import "@/database/user.model";
import type { IEvent } from "@/database/event.model";
import { sendNewEventEmail } from "@/lib/email";
import { buildLocationString } from "@/lib/ics";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://devevents.dev";

// Bound the fan-out so a publish request stays fast; beyond this a real
// queue is needed.
const MAX_NOTIFICATIONS = 500;
const SEND_CHUNK_SIZE = 25;

function unsubscribeSecret(): string {
	return process.env.NEXTAUTH_SECRET || "fallback_secret";
}

export function signUnsubscribeToken(userId: string, organizerId: string): string {
	return crypto
		.createHmac("sha256", unsubscribeSecret())
		.update(`unfollow:${userId}:${organizerId}`)
		.digest("hex")
		.substring(0, 24);
}

export function verifyUnsubscribeToken(
	userId: string,
	organizerId: string,
	token: string,
): boolean {
	const expected = signUnsubscribeToken(userId, organizerId);
	if (token.length !== expected.length) return false;
	return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export function buildUnsubscribeUrl(userId: string, organizerId: string): string {
	const sig = signUnsubscribeToken(userId, organizerId);
	return `${BASE_URL}/api/public/follows/unsubscribe?uid=${userId}&oid=${organizerId}&sig=${sig}`;
}

// Emails every follower of the event's organizer about a newly published
// public event. Returns the number of emails sent.
export async function notifyFollowersOfNewEvent(event: IEvent): Promise<number> {
	if (event.visibility !== "public") return 0;

	const organizerId = event.organizerId.toString();

	const follows = (await FollowOrganizer.find({ organizerId })
		.populate({ path: "userId", select: "name email" })
		.sort({ createdAt: 1 })
		.limit(MAX_NOTIFICATIONS)
		.lean()) as Array<{
		userId?: { _id: { toString(): string }; name?: string; email?: string } | null;
	}>;

	const recipients = follows
		.filter((f) => f.userId?.email)
		.map((f) => ({
			followerId: f.userId!._id.toString(),
			email: f.userId!.email!,
			name: f.userId!.name || "there",
		}));

	if (recipients.length === 0) return 0;

	const profile = await OrganizerProfile.findById(event.organizerProfileId)
		.select("displayName")
		.lean();
	const organizerName = profile?.displayName || "An organizer you follow";

	const eventUrl = `${BASE_URL}/events/${event.slug}`;
	const dateStr = new Date(event.startAt).toLocaleString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		timeZone: event.timezone || "UTC",
	});
	const locationStr =
		event.eventType === "online"
			? "Online"
			: buildLocationString({
					id: "",
					slug: event.slug,
					title: event.title,
					startAt: event.startAt,
					endAt: event.endAt,
					location: event.location,
					eventType: event.eventType,
				}) || "Location on event page";

	let sent = 0;
	for (let i = 0; i < recipients.length; i += SEND_CHUNK_SIZE) {
		const chunk = recipients.slice(i, i + SEND_CHUNK_SIZE);
		const results = await Promise.allSettled(
			chunk.map((recipient) =>
				sendNewEventEmail(
					recipient.email,
					recipient.name,
					organizerName,
					event.title,
					dateStr,
					locationStr,
					eventUrl,
					buildUnsubscribeUrl(recipient.followerId, organizerId),
				),
			),
		);
		sent += results.filter((r) => r.status === "fulfilled" && r.value).length;
	}

	return sent;
}
