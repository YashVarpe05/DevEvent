export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { canManageEvent } from "@/lib/event-access";
import Event from "@/database/event.model";
import Registration from "@/database/registration.model";
import { sendRegistrationEmail } from "@/lib/email";
import { generateEventICS } from "@/lib/ics";
import { adjustRegistrationsCount, countConfirmedSeats } from "@/lib/registrations";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const { id: registrationId } = await props.params;

		await connectDB();

		const registration = await Registration.findById(registrationId);
		if (!registration) {
			return NextResponse.json({ message: "Registration not found" }, { status: 404 });
		}

		const event = await Event.findById(registration.eventId);
		if (!event) {
			return NextResponse.json({ message: "Event not found" }, { status: 404 });
		}

		if (!canManageEvent(event, session)) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		if (registration.status !== "pending_approval" && registration.status !== "waitlisted") {
			return NextResponse.json(
				{ message: `Cannot approve a registration with status: ${registration.status}` },
				{ status: 400 },
			);
		}

		// Don't approve past capacity
		if (event.capacityType === "limited" && event.capacity) {
			const confirmedSeats = await countConfirmedSeats(event._id);
			if (confirmedSeats + registration.quantity > event.capacity) {
				return NextResponse.json(
					{ message: "Event is at capacity — cancel another registration or raise the capacity first" },
					{ status: 409 },
				);
			}
		}

		registration.status = "confirmed";
		await registration.save();
		await adjustRegistrationsCount(event._id, registration.quantity);

		const ics = generateEventICS({
			id: event._id.toString(),
			slug: event.slug,
			title: event.title,
			description: event.shortDescription,
			startAt: event.startAt,
			endAt: event.endAt,
			location: event.location,
			eventType: event.eventType,
		});

		await sendRegistrationEmail(
			registration.attendeeEmail,
			registration.attendeeName,
			event.title,
			registration.ticketCode,
			ics,
		);

		return NextResponse.json(
			{ message: "Registration approved", registration },
			{ status: 200 },
		);
	} catch (error: any) {
		console.error("Approve registration error:", error);
		return NextResponse.json({ message: "Failed to approve registration" }, { status: 500 });
	}
}
