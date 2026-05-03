import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { OrganizerApplication, User } from "@/database";
import { adminRejectSchema } from "@/lib/validations/organizer.schemas";
import { sendApplicationRejectedEmail } from "@/lib/email";
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

		const body = await req.json();
		const validationResult = adminRejectSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: validationResult.error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		const { rejectionReason, reviewNotes } = validationResult.data;

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

		// 1. Update Application
		application.status = "rejected";
		application.rejectionReason = rejectionReason;
		application.reviewedAt = new Date();
		application.reviewedBy = new Types.ObjectId(session.user.id);
		if (reviewNotes) {
			application.reviewNotes = reviewNotes;
		}
		await application.save();

		// 2. Update User Status
		user.organizerStatus = "rejected";
		user.organizerRejectedAt = new Date();
		user.organizerRejectionReason = rejectionReason;
		await user.save();

		// 3. Notify User
		if (user.email) {
			await sendApplicationRejectedEmail(
				user.email,
				user.name || "Explorer",
				rejectionReason,
			);
		}

		return NextResponse.json(
			{
				message: "Application rejected successfully",
				application,
				user: {
					id: user._id,
					organizerStatus: user.organizerStatus,
				},
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error rejecting organizer application:", error);
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
