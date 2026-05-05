export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { OrganizerApplication, User } from "@/database";
import { adminApproveSchema } from "@/lib/validations/organizer.schemas";
import { sendApplicationApprovedEmail } from "@/lib/email";
import { z } from "zod";
import { Types } from "mongoose";

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
        const { id } = await params;
		const session = await auth();
		if (!session?.user?.id || !session.user.roles.includes("admin")) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json().catch(() => ({}));
		const validationResult = adminApproveSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: validationResult.error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		await connectDB();

		const application = await OrganizerApplication.findById(id);
		if (!application) {
			return NextResponse.json(
				{ error: "Application not found" },
				{ status: 404 },
			);
		}

		if (application.status !== "pending") {
			return NextResponse.json(
				{ error: `Application is already ${application.status}` },
				{ status: 400 },
			);
		}

		const user = await User.findById(application.userId.toString());
		if (!user) {
			return NextResponse.json(
				{ error: "Applicant user not found" },
				{ status: 404 },
			);
		}

		// 1. Update Application Strategy
		application.status = "approved";
		application.reviewedAt = new Date();
		application.reviewedBy = new Types.ObjectId(session.user.id);
		if (validationResult.data.reviewNotes) {
			application.reviewNotes = validationResult.data.reviewNotes;
		}
		await application.save();

		// 2. Update User Strategy (Grant Role & Status)
		if (!user.roles.includes("organizer")) {
			user.roles.push("organizer");
		}
		user.organizerStatus = "approved";
		user.organizerApprovedAt = new Date();
		user.organizerRejectionReason = null;
		await user.save();

		// 3. Notify User
		if (user.email) {
			await sendApplicationApprovedEmail(user.email, user.name || "Organizer");
		}

		return NextResponse.json(
			{
				message: "Application approved successfully",
				application,
				user: {
					id: user._id,
					roles: user.roles,
					organizerStatus: user.organizerStatus,
				},
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error approving organizer application:", error);
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
