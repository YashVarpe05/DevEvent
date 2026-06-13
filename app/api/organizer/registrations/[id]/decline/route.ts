export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { canManageEvent } from "@/lib/event-access";
import Event from "@/database/event.model";
import Registration from "@/database/registration.model";
import { sendRegistrationDeclinedEmail } from "@/lib/email";

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
				{ message: `Cannot decline a registration with status: ${registration.status}` },
				{ status: 400 },
			);
		}

		registration.status = "cancelled_by_organizer";
		registration.cancelledAt = new Date();
		await registration.save();

		await sendRegistrationDeclinedEmail(
			registration.attendeeEmail,
			registration.attendeeName,
			event.title,
		);

		return NextResponse.json(
			{ message: "Registration declined", registration },
			{ status: 200 },
		);
	} catch (error: any) {
		console.error("Decline registration error:", error);
		return NextResponse.json({ message: "Failed to decline registration" }, { status: 500 });
	}
}
