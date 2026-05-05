export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import TicketType from "@/database/ticket-type.model";
import { NextResponse } from "next/server";

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string; ticketId: string }> }
) {
	try {
		const { id, ticketId } = await params;
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

		const ticket = await TicketType.findOneAndUpdate(
			{ _id: ticketId, eventId: id },
			{ ...body },
			{ new: true, runValidators: true }
		);

		return NextResponse.json({ ticket });
	} catch (error: any) {
		console.error("Ticket Update Error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string; ticketId: string }> }
) {
	try {
		const { id, ticketId } = await params;
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const event = await Event.findOne({ _id: id, organizerId: session.user.id });

		if (!event) {
			return NextResponse.json({ error: "Event not found or unauthorized" }, { status: 404 });
		}

		// Soft delete by archiving
		await TicketType.findOneAndUpdate(
			{ _id: ticketId, eventId: id },
			{ status: "archived" }
		);

		return NextResponse.json({ message: "Ticket archived successfully" });
	} catch (error: any) {
		console.error("Ticket Delete Error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
