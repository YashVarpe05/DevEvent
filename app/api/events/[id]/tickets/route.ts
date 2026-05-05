import connectDB from "@/lib/mongodb";
import TicketType from "@/database/ticket-type.model";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await connectDB();
		const { id } = await params;

		// Fetch active ticket types for the event
		const tickets = await TicketType.find({
			eventId: id,
			status: "active",
			isHidden: false
		}).select("-__v -createdAt -updatedAt");

		return NextResponse.json({ tickets });
	} catch (error: any) {
		console.error("Public Ticket Fetch Error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
