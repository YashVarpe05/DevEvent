export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { canManageEvent } from "@/lib/event-access";
import Event from "@/database/event.model";
import Registration from "@/database/registration.model";

// Reverses an accidental check-in. Staff mis-scan constantly at the door,
// so organizers/co-hosts need a one-tap undo.
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const { id: registrationId } = await props.params;

		await connectDB();

		const registration = await Registration.findById(registrationId).populate({
			path: "attendeeUserId",
			select: "name email",
		});
		if (!registration) {
			return NextResponse.json({ message: "Registration not found" }, { status: 404 });
		}

		const event = await Event.findById(registration.eventId).lean();
		if (!event) {
			return NextResponse.json({ message: "Event not found" }, { status: 404 });
		}

		if (!canManageEvent(event, session)) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		if (!registration.checkedInAt) {
			return NextResponse.json(
				{ message: "This attendee isn't checked in" },
				{ status: 400 },
			);
		}

		registration.checkedInAt = null;
		registration.checkedInBy = null;
		await registration.save();

		return NextResponse.json(
			{ message: "Check-in reversed", registration },
			{ status: 200 },
		);
	} catch (error: any) {
		console.error("Undo check-in error:", error);
		return NextResponse.json({ message: "Failed to undo check-in" }, { status: 500 });
	}
}
