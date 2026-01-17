import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Event } from "@/database";

// Type definition for route params
type Params = {
	params: Promise<{
		slug: string;
	}>;
};

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 */
export async function GET(
	request: NextRequest,
	{ params }: Params
): Promise<NextResponse> {
	try {
		const { slug } = await params;

		// Validate slug parameter
		if (!slug || typeof slug !== "string" || slug.trim() === "") {
			return NextResponse.json(
				{ error: "Invalid slug parameter. Slug must be a non-empty string." },
				{ status: 400 }
			);
		}

		// Connect to database
		await connectDB();

		// Query event by slug
		const event = await Event.findOne({
			slug: slug.trim().toLowerCase(),
		}).lean();

		// Handle event not found
		if (!event) {
			return NextResponse.json(
				{ error: `Event with slug "${slug}" not found.` },
				{ status: 404 }
			);
		}

		// Return event data
		return NextResponse.json(
			{
				success: true,
				data: event,
			},
			{ status: 200 }
		);
	} catch (error) {
		// Log error for debugging (consider using a logging service in production)
		console.error("Error fetching event by slug:", error);

		// Handle unexpected errors
		return NextResponse.json(
			{
				error: "An unexpected error occurred while fetching the event.",
				...(process.env.NODE_ENV === "development" && {
					details: error instanceof Error ? error.message : "Unknown error",
				}),
			},
			{ status: 500 }
		);
	}
}
