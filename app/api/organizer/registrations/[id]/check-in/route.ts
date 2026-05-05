import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Event from "@/database/event.model";
import Registration from "@/database/registration.model";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		
		const { id: registrationId } = await props.params;

		await connectDB();

		// Find registration
		const registration = await Registration.findById(registrationId);
		if (!registration) {
			return NextResponse.json({ message: "Registration not found" }, { status: 404 });
		}

		// Verify event ownership
		const event = await Event.findById(registration.eventId).lean();
		if (!event) {
			return NextResponse.json({ message: "Event not found" }, { status: 404 });
		}

		const isAdmin = session.user.roles?.includes("admin");
		const isOwner = event.organizerId.toString() === session.user.id;

		if (!isAdmin && !isOwner) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		// Validate status
		if (registration.status !== "confirmed") {
			return NextResponse.json({ message: `Cannot check in a registration with status: ${registration.status}` }, { status: 400 });
		}

		if (registration.checkedInAt) {
			return NextResponse.json({ message: "Attendee is already checked in" }, { status: 400 });
		}

		// Mark as checked in
		registration.checkedInAt = new Date();
		registration.checkedInBy = session.user.id;
		await registration.save();

		return NextResponse.json({ 
			message: "Successfully checked in", 
			registration 
		}, { status: 200 });

	} catch (error: any) {
		console.error("Check-in error:", error);
		return NextResponse.json({ message: "Failed to process check-in" }, { status: 500 });
	}
}
