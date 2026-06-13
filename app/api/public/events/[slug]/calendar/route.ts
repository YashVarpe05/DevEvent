export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { generateEventICS } from "@/lib/ics";

// Serves the event as an .ics file so attendees can add it to
// Apple Calendar, Outlook, or any other iCalendar client.
export async function GET(req: NextRequest, props: { params: Promise<{ slug: string }> }) {
	try {
		const { slug } = await props.params;

		await connectDB();

		const event = await Event.findOne({
			slug,
			deletedAt: null,
			status: "published",
			visibility: { $in: ["public", "unlisted"] },
		}).lean();

		if (!event) {
			return NextResponse.json({ message: "Event not found" }, { status: 404 });
		}

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

		return new NextResponse(ics, {
			status: 200,
			headers: {
				"Content-Type": "text/calendar; charset=utf-8",
				"Content-Disposition": `attachment; filename="${event.slug}.ics"`,
				"Cache-Control": "public, max-age=300",
			},
		});
	} catch (error: any) {
		console.error("Calendar export error:", error);
		return NextResponse.json({ message: "Failed to generate calendar file" }, { status: 500 });
	}
}
