export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import OrganizerProfile from "@/database/organizer-profile.model";
import Event from "@/database/event.model";
import { generateCalendarFeedICS } from "@/lib/ics";

// Subscribable iCalendar feed of an organizer's upcoming public events.
// Works with webcal:// in Apple Calendar / Google Calendar / Outlook —
// subscribers get new events automatically.
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const { slug } = await params;
		await connectDB();

		const organizer = await OrganizerProfile.findOne({
			slug,
			isPublic: true,
		})
			.select("displayName userId")
			.lean();
		if (!organizer) {
			return NextResponse.json({ message: "Organizer not found" }, { status: 404 });
		}

		const events = await Event.find({
			organizerId: organizer.userId,
			status: "published",
			visibility: "public",
			deletedAt: null,
			endAt: { $gte: new Date() },
		})
			.select("title slug shortDescription startAt endAt location eventType")
			.sort({ startAt: 1 })
			.limit(100)
			.lean();

		const calendarName = `${organizer.displayName || "DevEvent Organizer"} — Events`;
		const ics = generateCalendarFeedICS(
			calendarName,
			events.map((event) => ({
				id: event._id.toString(),
				slug: event.slug,
				title: event.title,
				description: event.shortDescription,
				startAt: event.startAt,
				endAt: event.endAt,
				location: event.location,
				eventType: event.eventType,
			})),
		);

		return new NextResponse(ics, {
			status: 200,
			headers: {
				"Content-Type": "text/calendar; charset=utf-8",
				"Content-Disposition": `attachment; filename="${slug}-events.ics"`,
				"Cache-Control": "public, max-age=3600",
			},
		});
	} catch (error: any) {
		console.error("Organizer calendar feed error:", error);
		return NextResponse.json({ message: "Failed to generate calendar feed" }, { status: 500 });
	}
}
