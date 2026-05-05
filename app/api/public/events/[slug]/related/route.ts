import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { getRelatedEventsByEvent } from "@/lib/discovery/recommendations";
import { DISCOVERY_CONFIG } from "@/lib/discovery/config";
import { trackServerEvent } from "@/lib/analytics";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const { slug } = await params;
		await connectDB();

		const event = await Event.findOne({
			slug,
			status: "published",
			visibility: { $in: ["public", "unlisted"] },
			deletedAt: null,
		}).lean();

		if (!event) {
			return NextResponse.json({ error: "Event not found" }, { status: 404 });
		}

		const related = await getRelatedEventsByEvent(
			{
				_id: event._id.toString(),
				category: event.category,
				tags: event.tags,
				location: event.location,
				startAt: event.startAt,
			},
			DISCOVERY_CONFIG.thresholds.relatedLimit,
		);

		trackServerEvent("related_event_clicked", {
			eventId: event._id.toString(),
			relatedCount: related.length,
		});

		return NextResponse.json({ events: related });
	} catch (error: any) {
		console.error("Related events error", error);
		return NextResponse.json(
			{ error: error.message || "Failed to load related events" },
			{ status: 500 },
		);
	}
}
