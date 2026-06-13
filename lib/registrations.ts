import { Types } from "mongoose";
import Registration from "@/database/registration.model";
import EventModel from "@/database/event.model";
import type { IEvent } from "@/database/event.model";
import { sendWaitlistPromotedEmail } from "@/lib/email";
import { generateEventICS } from "@/lib/ics";

// Statuses that hold (or may hold) a spot / block re-registration
export const ACTIVE_REGISTRATION_STATUSES = [
	"confirmed",
	"pending_approval",
	"waitlisted",
] as const;

// Keeps event.stats.registrationsCount in sync — it feeds the popularity
// ranking. Call with +n when registrations are confirmed, -n when cancelled.
export async function adjustRegistrationsCount(
	eventId: string | Types.ObjectId,
	delta: number,
): Promise<void> {
	try {
		await EventModel.updateOne(
			{ _id: eventId },
			{ $inc: { "stats.registrationsCount": delta } },
		);
	} catch (error) {
		console.error("Failed to adjust registrationsCount:", error);
	}
}

// Number of seats currently taken by confirmed registrations (sums quantity,
// so multi-seat free registrations are counted correctly).
export async function countConfirmedSeats(eventId: string | Types.ObjectId): Promise<number> {
	const result = await Registration.aggregate([
		{
			$match: {
				eventId: new Types.ObjectId(eventId.toString()),
				status: "confirmed",
			},
		},
		{ $group: { _id: null, seats: { $sum: "$quantity" } } },
	]);
	return result[0]?.seats ?? 0;
}

export function remainingSeats(event: Pick<IEvent, "capacityType" | "capacity">, confirmedSeats: number): number | undefined {
	if (event.capacityType !== "limited" || !event.capacity) return undefined;
	return Math.max(0, event.capacity - confirmedSeats);
}

// Promote waitlisted registrations (oldest first) into freed-up capacity.
// Called after a confirmed registration is cancelled. Safe to call for
// unlimited-capacity events (promotes everyone waiting) and events without
// a waitlist (no-op). Returns the number of promoted registrations.
export async function promoteFromWaitlist(event: IEvent): Promise<number> {
	// Don't promote into past events
	if (new Date(event.endAt) < new Date()) return 0;

	let promoted = 0;

	// Process one at a time so each capacity check reflects prior promotions
	for (let i = 0; i < 25; i++) {
		let available: number | undefined;
		if (event.capacityType === "limited" && event.capacity) {
			const confirmedSeats = await countConfirmedSeats(event._id as Types.ObjectId);
			available = event.capacity - confirmedSeats;
			if (available <= 0) break;
		}

		const filter: Record<string, unknown> = {
			eventId: event._id,
			status: "waitlisted",
		};
		if (available !== undefined) {
			filter.quantity = { $lte: available };
		}

		const next = await Registration.findOneAndUpdate(
			filter,
			{ $set: { status: "confirmed" } },
			{ sort: { createdAt: 1 }, new: true },
		);

		if (!next) break;
		promoted++;
		await adjustRegistrationsCount(event._id as Types.ObjectId, next.quantity);

		try {
			const ics = generateEventICS({
				id: event._id!.toString(),
				slug: event.slug,
				title: event.title,
				description: event.shortDescription,
				startAt: event.startAt,
				endAt: event.endAt,
				location: event.location,
				eventType: event.eventType,
			});
			await sendWaitlistPromotedEmail(
				next.attendeeEmail,
				next.attendeeName,
				event.title,
				next.ticketCode,
				ics,
			);
		} catch (error) {
			console.error("Failed to send waitlist promotion email:", error);
		}
	}

	return promoted;
}
