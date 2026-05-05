import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import OrganizerProfile from "@/database/organizer-profile.model";
import Event from "@/database/event.model";

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
		}).lean();
		if (!organizer) {
			return NextResponse.json(
				{ error: "Organizer not found" },
				{ status: 404 },
			);
		}

		const events = await Event.find({
			organizerId: organizer.userId,
			status: "published",
			visibility: "public",
			deletedAt: null,
			endAt: { $gte: new Date() },
		})
			.sort({ startAt: 1 })
			.limit(24)
			.lean();

		return NextResponse.json({ organizer, events });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to load organizer" },
			{ status: 500 },
		);
	}
}
