export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Event from "@/database/event.model";
import Registration from "@/database/registration.model";
import EventFeedback from "@/database/event-feedback.model";

const feedbackSchema = z.object({
	rating: z.number().int().min(1).max(5),
	comment: z.string().trim().max(2000).optional(),
});

// Submit (or update) feedback for an event the user attended
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const { id: eventId } = await props.params;

		await connectDB();

		const event = await Event.findById(eventId).select("endAt deletedAt");
		if (!event || event.deletedAt) {
			return NextResponse.json({ message: "Event not found" }, { status: 404 });
		}

		if (new Date(event.endAt) > new Date()) {
			return NextResponse.json(
				{ message: "Feedback opens after the event ends" },
				{ status: 400 },
			);
		}

		// Only people who actually held a ticket can rate
		const attended = await Registration.exists({
			eventId,
			attendeeUserId: session.user.id,
			status: { $in: ["confirmed", "no_show"] },
		});
		if (!attended) {
			return NextResponse.json(
				{ message: "Only attendees of this event can leave feedback" },
				{ status: 403 },
			);
		}

		const body = await req.json().catch(() => ({}));
		const parsed = feedbackSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ message: "Invalid feedback", errors: parsed.error.issues },
				{ status: 400 },
			);
		}

		const feedback = await EventFeedback.findOneAndUpdate(
			{ eventId, attendeeUserId: session.user.id },
			{
				$set: {
					rating: parsed.data.rating,
					comment: parsed.data.comment || undefined,
				},
			},
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		);

		return NextResponse.json(
			{ message: "Thanks for your feedback!", feedback },
			{ status: 200 },
		);
	} catch (error: any) {
		console.error("Feedback submit error:", error);
		return NextResponse.json({ message: "Failed to submit feedback" }, { status: 500 });
	}
}

// Fetch the current user's feedback for this event (to prefill the form)
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const { id: eventId } = await props.params;

		await connectDB();

		const feedback = await EventFeedback.findOne({
			eventId,
			attendeeUserId: session.user.id,
		}).lean();

		return NextResponse.json({ feedback }, { status: 200 });
	} catch (error: any) {
		console.error("Feedback fetch error:", error);
		return NextResponse.json({ message: "Failed to fetch feedback" }, { status: 500 });
	}
}
