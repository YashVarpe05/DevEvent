import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Event from "@/database/event.model";
import Registration from "@/database/registration.model";
import { registerEventSchema } from "@/lib/validations/registration";
import { generateTicketCode, generateQrPayload } from "@/lib/utils/ticket";
import { sendRegistrationEmail } from "@/lib/email";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		const attendeeUserId = session.user.id;
		const { id: eventId } = await props.params;

		await connectDB();

		// Check event exists and is active
		const event = await Event.findById(eventId);
		if (!event || event.deletedAt) {
			return NextResponse.json({ message: "Event not found" }, { status: 404 });
		}

		if (event.status !== "published") {
			return NextResponse.json({ message: "Event is not open for registration" }, { status: 400 });
		}

		// Currently, we are only supporting free events in this phase
		if (event.isPaid) {
			return NextResponse.json({ message: "Paid events are not supported in this beta yet." }, { status: 400 });
		}

		const body = await req.json().catch(() => ({}));
		const parsedBody = registerEventSchema.safeParse(body);
		
		if (!parsedBody.success) {
			return NextResponse.json({ message: "Invalid request payload", errors: parsedBody.error.issues }, { status: 400 });
		}

		const quantity = parsedBody.data.quantity;

		// Optional: Check registration window if event.registrationStartAt / EndAt existed
		// (Skipped for MVP as schema dates are mostly event dates)
		
		// Concurrency & Capacity check
		if (event.capacityType === "limited" && event.capacity) {
			const confirmedCount = await Registration.countDocuments({
				eventId,
				status: "confirmed"
			});
			
			if (confirmedCount + quantity > event.capacity) {
				return NextResponse.json({ message: "Event is sold out or insufficient capacity" }, { status: 409 });
			}
		}

		// Check if user already registered
		const existingRegistration = await Registration.findOne({
			eventId,
			attendeeUserId,
			status: "confirmed"
		});

		if (existingRegistration) {
			return NextResponse.json({ message: "You are already registered for this event" }, { status: 409 });
		}

		// Create registration
		const ticketCode = generateTicketCode();
		
		// Use a placeholder payload during creation, then sign it with the actual ID after save
		// However, we need to save it, so we'll pre-generate an ObjectId.
		const { Types } = require("mongoose");
		const registrationId = new Types.ObjectId();
		const qrPayload = generateQrPayload(registrationId.toString(), eventId);

		const newRegistration = new Registration({
			_id: registrationId,
			eventId,
			attendeeUserId,
			attendeeEmail: session.user.email,
			attendeeName: session.user.name || "Attendee",
			attendeePhone: parsedBody.data.phone,
			bookingType: "free",
			quantity,
			ticketCode,
			qrPayload,
			source: parsedBody.data.source,
			status: "confirmed",
			metadata: {}
		});

		await newRegistration.save();

		// Trigger Email hook
		await sendRegistrationEmail(
            session.user.email!, 
            session.user.name || "Attendee", 
            event.title, 
            ticketCode
        );

		return NextResponse.json(
			{ 
				message: "Registered successfully", 
				registration: newRegistration 
			}, 
			{ status: 201 }
		);
	} catch (error: any) {
		console.error("Registration error:", error);
		if (error.code === 11000) {
			return NextResponse.json({ message: "You are already registered" }, { status: 409 });
		}
		return NextResponse.json({ message: "Failed to register for event" }, { status: 500 });
	}
}
