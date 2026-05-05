import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";
// Ensure models are registered for populate
import "@/database/user.model";
import "@/database/organizer-profile.model";

export async function GET(req: NextRequest, props: { params: Promise<{ slug: string }> }) {
	try {
        const { slug } = await props.params;
		await connectDB();

		const event = await Event.findOne({
            slug,
            deletedAt: null,
            status: "published",
            visibility: { $in: ["public", "unlisted"] }
        }).populate({
            path: 'organizerProfileId',
            select: 'organizationName bio websiteUrl logoUrl socialLinks'
        }).lean();

		if (!event) {
			return NextResponse.json({ message: "Event not found or unavailable" }, { status: 404 });
		}

		return NextResponse.json({ event }, { status: 200 });
	} catch (error: any) {
		console.error("Fetch public event error:", error);
		return NextResponse.json({ message: "Failed to fetch event details", error: error.message }, { status: 500 });
	}
}
