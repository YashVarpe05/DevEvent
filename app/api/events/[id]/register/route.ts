export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Event from "@/database/event.model";
import Registration from "@/database/registration.model";
import { registerEventSchema } from "@/lib/validations/registration";
import { generateTicketCode, generateQrPayload } from "@/lib/utils/ticket";
import {
	sendRegistrationEmail,
	sendWaitlistJoinedEmail,
	sendRegistrationPendingEmail,
} from "@/lib/email";
import { generateEventICS } from "@/lib/ics";
import {
	ACTIVE_REGISTRATION_STATUSES,
	adjustRegistrationsCount,
	countConfirmedSeats,
} from "@/lib/registrations";
import { isRateLimited } from "@/lib/auth.utils";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		const attendeeUserId = session.user.id;
		const { id: eventId } = await props.params;

		// Rate limit: 10 registration attempts per user per 5 minutes
		if (await isRateLimited(`register:${attendeeUserId}`, 10, 5 * 60 * 1000)) {
			return NextResponse.json(
				{ message: "Too many registration attempts. Please try again in a few minutes." },
				{ status: 429 },
			);
		}

		await connectDB();

		// Check event exists and is active
		const event = await Event.findById(eventId);
		if (!event || event.deletedAt) {
			return NextResponse.json({ message: "Event not found" }, { status: 404 });
		}

		if (event.status !== "published") {
			return NextResponse.json({ message: "Event is not open for registration" }, { status: 400 });
		}

		if (new Date(event.endAt) < new Date()) {
			return NextResponse.json({ message: "This event has already ended" }, { status: 400 });
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

		// Validate answers against the event's custom registration questions.
		// Answers are snapshotted with their label so the attendee view doesn't
		// depend on the event's current question list.
		const questions = event.registrationQuestions || [];
		const rawAnswers = parsedBody.data.answers || {};
		const answers: { id: string; label: string; value: string | boolean }[] = [];

		for (const question of questions) {
			const value = rawAnswers[question.id];
			const isEmpty =
				value === undefined ||
				value === null ||
				(typeof value === "string" && value.trim() === "") ||
				(question.type === "checkbox" && value !== true);

			if (question.required && isEmpty) {
				return NextResponse.json(
					{ message: `Please answer: ${question.label}` },
					{ status: 400 },
				);
			}
			if (isEmpty) continue;

			if (
				question.type === "select" &&
				(typeof value !== "string" || !question.options.includes(value))
			) {
				return NextResponse.json(
					{ message: `Invalid choice for: ${question.label}` },
					{ status: 400 },
				);
			}

			answers.push({
				id: question.id,
				label: question.label,
				value: question.type === "checkbox" ? true : String(value).trim(),
			});
		}

		// Check if user already has an active registration (confirmed, waitlisted, or pending)
		const existingRegistration = await Registration.findOne({
			eventId,
			attendeeUserId,
			status: { $in: ACTIVE_REGISTRATION_STATUSES },
		});

		if (existingRegistration) {
			const messages: Record<string, string> = {
				confirmed: "You are already registered for this event",
				waitlisted: "You are already on the waitlist for this event",
				pending_approval: "Your registration is already awaiting host approval",
			};
			return NextResponse.json(
				{
					message: messages[existingRegistration.status] || "You are already registered",
					status: existingRegistration.status,
				},
				{ status: 409 },
			);
		}

		// Capacity check — full events go to the waitlist when it's enabled
		let registrationStatus: "confirmed" | "waitlisted" | "pending_approval" = "confirmed";

		if (event.capacityType === "limited" && event.capacity) {
			const confirmedSeats = await countConfirmedSeats(new Types.ObjectId(eventId));

			if (confirmedSeats + quantity > event.capacity) {
				if (event.waitlistEnabled) {
					registrationStatus = "waitlisted";
				} else {
					return NextResponse.json({ message: "Event is sold out or insufficient capacity" }, { status: 409 });
				}
			}
		}

		// Approval mode: registrations that would be confirmed wait for the host instead.
		// Waitlisted registrations stay waitlisted; approval applies when they're promoted.
		if (registrationStatus === "confirmed" && event.requiresApproval) {
			registrationStatus = "pending_approval";
		}

		// Create registration
		const ticketCode = generateTicketCode();

		// Pre-generate the ObjectId so the QR payload can be signed before saving
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
			status: registrationStatus,
			metadata: answers.length > 0 ? { answers } : {}
		});

		await newRegistration.save();

		if (registrationStatus === "confirmed") {
			await adjustRegistrationsCount(eventId, quantity);
		}

		// Email hook per outcome
		const email = session.user.email!;
		const name = session.user.name || "Attendee";

		if (registrationStatus === "confirmed") {
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
			await sendRegistrationEmail(email, name, event.title, ticketCode, ics);
		} else if (registrationStatus === "waitlisted") {
			await sendWaitlistJoinedEmail(email, name, event.title);
		} else {
			await sendRegistrationPendingEmail(email, name, event.title);
		}

		const successMessages: Record<string, string> = {
			confirmed: "Registered successfully",
			waitlisted: "Added to the waitlist — we'll email you if a spot opens up",
			pending_approval: "Registration sent — the host will review your request",
		};

		return NextResponse.json(
			{
				message: successMessages[registrationStatus],
				status: registrationStatus,
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
