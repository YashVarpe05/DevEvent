export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Event from "@/database/event.model";
import Registration from "@/database/registration.model";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		
		const { id: eventId } = await props.params;

		await connectDB();

		// Verify event ownership
		const event = await Event.findById(eventId).lean();
		if (!event) {
			return NextResponse.json({ message: "Event not found" }, { status: 404 });
		}

		const isAdmin = session.user.roles?.includes("admin");
		const isOwner = event.organizerId.toString() === session.user.id;

		if (!isAdmin && !isOwner) {
			return NextResponse.json({ message: "Forbidden: You do not have permission to view attendees for this event" }, { status: 403 });
		}

		// Pagination & Filtering
		const searchParams = req.nextUrl.searchParams;
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "50");
		const status = searchParams.get("status"); // e.g., 'confirmed', 'cancelled_by_user'
		
		const filter: any = { eventId };
		if (status) {
			filter.status = status;
		}

		const skip = (page - 1) * limit;

		const total = await Registration.countDocuments(filter);
		const attendees = await Registration.find(filter)
			.populate({ path: "attendeeUserId", select: "name email image" }) // optional mapping
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean();

		return NextResponse.json(
			{ 
				attendees,
				pagination: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit)
				}
			}, 
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Fetch organizer attendees error:", error);
		return NextResponse.json({ message: "Failed to fetch attendees" }, { status: 500 });
	}
}
