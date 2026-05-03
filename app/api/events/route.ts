import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import OrganizerProfile from "@/database/organizer-profile.model";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { cacheDelByPrefix } from "@/lib/cache/redis";

export async function POST(req: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		const roles = session.user.roles || [];
		if (!roles.includes("organizer") && !roles.includes("admin")) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		await connectDB();

		// Find organizer profile
		const profile = await OrganizerProfile.findOne({ userId: session.user.id });
		if (!profile) {
			return NextResponse.json(
				{ message: "Organizer profile not found. Please complete onboarding." },
				{ status: 400 },
			);
		}

		const body = await req.json();

		// Basic validation for creating a draft
		if (
			!body.title ||
			!body.shortDescription ||
			!body.timezone ||
			!body.startAt ||
			!body.endAt
		) {
			return NextResponse.json(
				{
					message:
						"Missing required fields: title, shortDescription, timezone, startAt, endAt",
				},
				{ status: 400 },
			);
		}

		if (new Date(body.startAt) >= new Date(body.endAt)) {
			return NextResponse.json(
				{ message: "startAt must be before endAt" },
				{ status: 400 },
			);
		}

		// Create event
		const newEvent = await Event.create({
			...body,
			organizerId: session.user.id,
			organizerProfileId: profile._id,
			status: "draft", // enforce draft status on creation
		});

		await Promise.all([
			cacheDelByPrefix("discovery:search:"),
			cacheDelByPrefix("discovery:recommended:"),
		]);

		return NextResponse.json(
			{ message: "Event draft created", event: newEvent },
			{ status: 201 },
		);
	} catch (error: any) {
		console.error("POST /api/events error:", error);
		if (error.code === 11000) {
			return NextResponse.json(
				{ message: "A unique slug conflict occurred", error: error.message },
				{ status: 400 },
			);
		}
		return NextResponse.json(
			{ message: "Failed to create event", error: error.message },
			{ status: 500 },
		);
	}
}

// GET admin list
export async function GET(req: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user || !session.user.roles?.includes("admin")) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}
		await connectDB();
		const url = new URL(req.url);
		const page = parseInt(url.searchParams.get("page") || "1", 10);
		const limit = parseInt(url.searchParams.get("limit") || "50", 10);
		const skip = (page - 1) * limit;

		const total = await Event.countDocuments({ deletedAt: null });
		const events = await Event.find({ deletedAt: null })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean();

		return NextResponse.json({
			events,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		}, { status: 200 });
	} catch (error: any) {
		return NextResponse.json(
			{ message: "Failed to fetch events", error: error.message },
			{ status: 500 },
		);
	}
}
