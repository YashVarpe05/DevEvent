export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { cacheDelByPrefix } from "@/lib/cache/redis";

export async function POST(
	req: NextRequest,
	props: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		const { id } = await props.params;

		await connectDB();
		const event = await Event.findById(id).lean();

		if (!event || event.deletedAt) {
			return NextResponse.json({ message: "Event not found" }, { status: 404 });
		}

		const isAdmin = session.user.roles?.includes("admin");
		const isOwner = event.organizerId.toString() === session.user.id;

		if (!isAdmin && !isOwner) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		if (event.status !== "published") {
			return NextResponse.json(
				{ message: "Event is not published" },
				{ status: 400 },
			);
		}

		const updatedEvent = await Event.findByIdAndUpdate(
			id,
			{ $set: { status: "unpublished" } },
			{ new: true },
		);

		await Promise.all([
			cacheDelByPrefix("discovery:search:"),
			cacheDelByPrefix("discovery:recommended:"),
		]);

		return NextResponse.json(
			{ message: "Event unpublished successfully", event: updatedEvent },
			{ status: 200 },
		);
	} catch (error: any) {
		console.error("Unpublish event error:", error);
		return NextResponse.json(
			{ message: "Failed to unpublish event", error: error.message },
			{ status: 500 },
		);
	}
}
