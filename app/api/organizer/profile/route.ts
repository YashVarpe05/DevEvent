export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { OrganizerProfile, User } from "@/database";
import { organizerProfileSchema } from "@/lib/validations/organizer.schemas";
import { z } from "zod";

export async function GET() {
	try {
		const session = await auth();
		if (!session?.user?.id || session.user.organizerStatus !== "approved") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const profile = await OrganizerProfile.findOne({ userId: session.user.id });

		return NextResponse.json({ profile }, { status: 200 });
	} catch (error) {
		console.error("Error fetching organizer profile:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PATCH(req: Request) {
	try {
		const session = await auth();
		if (!session?.user?.id || session.user.organizerStatus !== "approved") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const body = await req.json();
		const validationResult = organizerProfileSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: validationResult.error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		const profileData = validationResult.data;

		// Check slug uniqueness
		const existingSlug = await OrganizerProfile.findOne({
			slug: profileData.slug,
			userId: { $ne: session.user.id },
		});

		if (existingSlug) {
			return NextResponse.json(
				{ error: "Validation failed", details: { slug: ["Slug is already taken"] } },
				{ status: 400 },
			);
		}

		const profile = await OrganizerProfile.findOneAndUpdate(
			{ userId: session.user.id },
			{ ...profileData },
			{ new: true, upsert: true, runValidators: true },
		);

		return NextResponse.json(
			{
				message: "Profile updated successfully",
				profile,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating organizer profile:", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation failed", details: error.flatten().fieldErrors },
				{ status: 400 },
			);
		}
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
