export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import Event from "@/database/event.model";
import OrganizerProfile from "@/database/organizer-profile.model";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { cacheDelByPrefix } from "@/lib/cache/redis";

// Fields an organizer may set when creating a draft. Status, ownership,
// stats, ranking scores, and slug stay server-managed.
const CREATABLE_FIELDS = [
	"title",
	"shortDescription",
	"description",
	"category",
	"tags",
	"coverImageUrl",
	"galleryImages",
	"eventType",
	"visibility",
	"timezone",
	"startAt",
	"endAt",
	"isAllDay",
	"location",
	"online",
	"capacityType",
	"capacity",
	"requiresApproval",
	"waitlistEnabled",
	"showGuestList",
	"coHostEmails",
	"registrationQuestions",
	"registrationStartAt",
	"registrationEndAt",
	"isPaid",
	"currency",
	"basePrice",
	"seo",
	"language",
] as const;

type RecurrenceFrequency = "weekly" | "biweekly" | "monthly";

const RECURRENCE_FREQUENCIES: RecurrenceFrequency[] = ["weekly", "biweekly", "monthly"];
const MAX_OCCURRENCES = 12;

function shiftDate(date: Date, frequency: RecurrenceFrequency, step: number): Date {
	const next = new Date(date);
	if (frequency === "weekly") next.setDate(next.getDate() + 7 * step);
	else if (frequency === "biweekly") next.setDate(next.getDate() + 14 * step);
	else next.setMonth(next.getMonth() + step);
	return next;
}

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

		const rawBody = await req.json();

		const body: Record<string, unknown> = {};
		for (const field of CREATABLE_FIELDS) {
			if (field in rawBody) {
				body[field] = rawBody[field];
			}
		}

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

		const startAt = new Date(body.startAt as string);
		const endAt = new Date(body.endAt as string);
		if (startAt >= endAt) {
			return NextResponse.json(
				{ message: "startAt must be before endAt" },
				{ status: 400 },
			);
		}

		// Optional recurrence: creates a series of linked draft events
		let recurrence: { frequency: RecurrenceFrequency; count: number } | null = null;
		if (rawBody.recurrence && typeof rawBody.recurrence === "object") {
			const frequency = rawBody.recurrence.frequency;
			const count = Number(rawBody.recurrence.count);
			if (
				!RECURRENCE_FREQUENCIES.includes(frequency) ||
				!Number.isInteger(count) ||
				count < 2 ||
				count > MAX_OCCURRENCES
			) {
				return NextResponse.json(
					{ message: `Invalid recurrence — frequency must be weekly, biweekly, or monthly and count between 2 and ${MAX_OCCURRENCES}` },
					{ status: 400 },
				);
			}
			recurrence = { frequency, count };
		}

		const seriesId = recurrence ? new Types.ObjectId() : null;

		// Create the first occurrence
		const newEvent = await Event.create({
			...body,
			organizerId: session.user.id,
			organizerProfileId: profile._id,
			status: "draft", // enforce draft status on creation
			seriesId,
		});

		// Create the remaining occurrences with shifted dates
		let occurrencesCreated = 1;
		if (recurrence && seriesId) {
			for (let step = 1; step < recurrence.count; step++) {
				await Event.create({
					...body,
					startAt: shiftDate(startAt, recurrence.frequency, step),
					endAt: shiftDate(endAt, recurrence.frequency, step),
					organizerId: session.user.id,
					organizerProfileId: profile._id,
					status: "draft",
					seriesId,
				});
				occurrencesCreated++;
			}
		}

		await Promise.all([
			cacheDelByPrefix("discovery:search:"),
			cacheDelByPrefix("discovery:recommended:"),
		]);

		return NextResponse.json(
			{
				message:
					occurrencesCreated > 1
						? `Created a series of ${occurrencesCreated} event drafts`
						: "Event draft created",
				event: newEvent,
				occurrencesCreated,
			},
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
