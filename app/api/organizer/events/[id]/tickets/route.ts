import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import TicketType from "@/database/ticket-type.model";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		// Check if event exists and belongs to the user
		const event = await Event.findOne({ _id: id, organizerId: session.user.id });

		if (!event) {
			return NextResponse.json({ error: "Event not found or unauthorized" }, { status: 404 });
		}

		const tickets = await TicketType.find({ eventId: id, status: { $ne: "archived" } });

		return NextResponse.json({ tickets });
	} catch (error: any) {
		console.error("Ticket Fetch Error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const event = await Event.findOne({ _id: id, organizerId: session.user.id });

		if (!event) {
			return NextResponse.json({ error: "Event not found or unauthorized" }, { status: 404 });
		}

		const body = await request.json();

		const ticket = await TicketType.create({
			...body,
			eventId: id,
		});

		return NextResponse.json({ ticket }, { status: 201 });
	} catch (error: any) {
		console.error("Ticket Create Error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
