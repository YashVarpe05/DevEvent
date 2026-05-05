import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		
		const { searchParams } = new URL(req.url);
		const status = searchParams.get("status");

		await connectDB();

		const query: any = { organizerId: session.user.id, deletedAt: null };
		if (status) {
			query.status = status;
		}

		const events = await Event.find(query).sort({ createdAt: -1 });

		return NextResponse.json({ events }, { status: 200 });
	} catch (error: any) {
		console.error("GET /api/events/me error:", error);
		return NextResponse.json(
			{ message: "Failed to fetch events", error: error.message },
			{ status: 500 }
		);
	}
}
