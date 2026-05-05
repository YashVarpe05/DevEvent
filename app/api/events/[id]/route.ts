export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { cacheDelByPrefix } from "@/lib/cache/redis";

export async function GET(
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
		const event = await Event.findById(id);

		if (!event || event.deletedAt) {
			return NextResponse.json({ message: "Event not found" }, { status: 404 });
		}

		const isAdmin = session.user.roles?.includes("admin");
		const isOwner = event.organizerId.toString() === session.user.id;

		if (!isAdmin && !isOwner) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		return NextResponse.json({ event }, { status: 200 });
	} catch (error: any) {
		return NextResponse.json(
			{ message: "Failed to fetch event", error: error.message },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	req: NextRequest,
	props: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		const { id } = await props.params;

		const body = await req.json();
		delete body.status;
		delete body.organizerId;
		delete body.organizerProfileId;

		await connectDB();
		const event = await Event.findById(id);

		if (!event || event.deletedAt) {
			return NextResponse.json({ message: "Event not found" }, { status: 404 });
		}

		const isAdmin = session.user.roles?.includes("admin");
		const isOwner = event.organizerId.toString() === session.user.id;

		if (!isAdmin && !isOwner) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		Object.assign(event, body);
		await event.save();
		await Promise.all([
			cacheDelByPrefix("discovery:search:"),
			cacheDelByPrefix("discovery:recommended:"),
		]);

		return NextResponse.json(
			{ message: "Event updated", event },
			{ status: 200 },
		);
	} catch (error: any) {
		return NextResponse.json(
			{ message: "Failed to update event", error: error.message },
			{ status: 500 },
		);
	}
}

export async function DELETE(
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
		const event = await Event.findById(id);

		if (!event || event.deletedAt) {
			return NextResponse.json({ message: "Event not found" }, { status: 404 });
		}

		const isAdmin = session.user.roles?.includes("admin");
		const isOwner = event.organizerId.toString() === session.user.id;

		if (!isAdmin && !isOwner) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		event.deletedAt = new Date();
		await event.save();
		await Promise.all([
			cacheDelByPrefix("discovery:search:"),
			cacheDelByPrefix("discovery:recommended:"),
		]);

		return NextResponse.json(
			{ message: "Event deleted successfully" },
			{ status: 200 },
		);
	} catch (error: any) {
		return NextResponse.json(
			{ message: "Failed to delete event", error: error.message },
			{ status: 500 },
		);
	}
}
