export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import {
	OrganizerApplication,
	User,
} from "@/database";
import { organizerApplicationSchema } from "@/lib/validations/organizer.schemas";
import { sendApplicationSubmittedEmail } from "@/lib/email";
import { z } from "zod";

export async function POST(req: Request) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const user = await User.findById(session.user.id);
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Check if user has already applied
		if (user.organizerStatus !== "not_applied") {
			return NextResponse.json(
				{ error: `Application already submitted. Current status: ${user.organizerStatus}` },
				{ status: 400 },
			);
		}

		const body = await req.json();
		const validationResult = organizerApplicationSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: validationResult.error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		const applicationData = validationResult.data;

		// Create the application
		const application = await OrganizerApplication.create({
			userId: user._id,
			status: "pending",
			applicationData,
		});

		// Update user status
		user.organizerStatus = "pending";
		await user.save();

		// Notify user
		if (user.email) {
			await sendApplicationSubmittedEmail(
				user.email,
				user.name || "Event Explorer",
			);
		}

		return NextResponse.json(
			{
				message: "Application submitted successfully",
				application,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error submitting organizer application:", error);
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
