export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Registration from "@/database/registration.model";
import Event from "@/database/event.model";
import { sendCancellationEmail } from "@/lib/email";
import { ACTIVE_REGISTRATION_STATUSES, adjustRegistrationsCount, promoteFromWaitlist } from "@/lib/registrations";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		const attendeeUserId = session.user.id;
		const { id: registrationId } = await props.params;

		await connectDB();

		const registration = await Registration.findById(registrationId);

		if (!registration) {
			return NextResponse.json({ message: "Registration not found" }, { status: 404 });
		}

		// Security: Only the attendee can cancel their own ticket
		if (registration.attendeeUserId.toString() !== attendeeUserId) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		if (!(ACTIVE_REGISTRATION_STATUSES as readonly string[]).includes(registration.status)) {
			return NextResponse.json({ message: "Registration is not active" }, { status: 400 });
		}

		const wasConfirmed = registration.status === "confirmed";

		registration.status = "cancelled_by_user";
		registration.cancelledAt = new Date();
		await registration.save();

		// Trigger Email hook
        const event = await Event.findById(registration.eventId);
        if (event) {
            await sendCancellationEmail(
                session.user.email!,
                session.user.name || "Attendee",
                event.title
            );

            // A confirmed seat just freed up — promote from the waitlist
            if (wasConfirmed) {
                await adjustRegistrationsCount(event._id, -registration.quantity);
                await promoteFromWaitlist(event);
            }
        }

		return NextResponse.json(
			{ message: "Registration cancelled successfully", registration },
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Cancel registration error:", error);
		return NextResponse.json({ message: "Failed to cancel registration" }, { status: 500 });
	}
}
