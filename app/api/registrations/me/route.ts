export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Registration from "@/database/registration.model";
import Event from "@/database/event.model";

export async function GET(req: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		
		await connectDB();
		// Ensure Event model is registered before population
		await Event.init();

		const attendeeUserId = session.user.id;

		const registrations = await Registration.find({ attendeeUserId })
			.populate({
				path: "eventId",
				select: "title slug startDate endDate startTime endTime timezone location online coverImageUrl status eventType",
			})
			.sort({ createdAt: -1 })
			.lean();

		return NextResponse.json({ registrations }, { status: 200 });
	} catch (error: any) {
		console.error("Fetch personal registrations error:", error);
		return NextResponse.json({ message: "Failed to fetch registrations" }, { status: 500 });
	}
}
