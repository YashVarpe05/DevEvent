export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { canManageEvent } from "@/lib/event-access";
import Event from "@/database/event.model";
import EventFeedback from "@/database/event-feedback.model";
import "@/database/user.model";

// Feedback summary + entries for the event host
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const { id: eventId } = await props.params;

		await connectDB();

		const event = await Event.findById(eventId);
		if (!event || event.deletedAt) {
			return NextResponse.json({ message: "Event not found" }, { status: 404 });
		}

		if (!canManageEvent(event, session)) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		const [summary] = await EventFeedback.aggregate([
			{ $match: { eventId: new Types.ObjectId(eventId) } },
			{
				$group: {
					_id: null,
					averageRating: { $avg: "$rating" },
					count: { $sum: 1 },
				},
			},
		]);

		const entries = await EventFeedback.find({ eventId })
			.populate({ path: "attendeeUserId", select: "name image" })
			.sort({ createdAt: -1 })
			.limit(100)
			.lean();

		return NextResponse.json(
			{
				averageRating: summary ? Math.round(summary.averageRating * 10) / 10 : null,
				count: summary?.count ?? 0,
				entries,
			},
			{ status: 200 },
		);
	} catch (error: any) {
		console.error("Organizer feedback fetch error:", error);
		return NextResponse.json({ message: "Failed to fetch feedback" }, { status: 500 });
	}
}
