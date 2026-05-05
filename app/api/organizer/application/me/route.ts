export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { OrganizerApplication, User } from "@/database";

export async function GET() {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const application = await OrganizerApplication.findOne({
			userId: session.user.id,
		}).sort({ createdAt: -1 });

		const user = await User.findById(session.user.id).select(
			"organizerStatus organizerRejectionReason",
		);

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json(
			{
				application,
				status: user.organizerStatus,
				rejectionReason: user.organizerRejectionReason,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching organizer application:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
