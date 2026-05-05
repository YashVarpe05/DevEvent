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
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		// Fetch all active attendees for export
		const attendees = await Registration.find({ eventId })
			.sort({ createdAt: -1 })
			.lean();

		// Build CSV String
		const headers = ["Ticket Code", "Name", "Email", "Phone", "Status", "Booking Date", "Checked In"];
		const rows = attendees.map(att => [
			att.ticketCode,
			`"${(att.attendeeName || "").replace(/"/g, '""')}"`,
			att.attendeeEmail,
			att.attendeePhone || "",
			att.status,
			new Date(att.createdAt).toISOString(),
			att.checkedInAt ? new Date(att.checkedInAt).toISOString() : "No"
		]);

		const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

		return new NextResponse(csvContent, {
			status: 200,
			headers: {
				"Content-Type": "text/csv; charset=utf-8",
				"Content-Disposition": `attachment; filename="attendees-${event.slug || eventId}.csv"`,
			},
		});
	} catch (error: any) {
		console.error("Export attendees error:", error);
		return NextResponse.json({ message: "Failed to export attendees" }, { status: 500 });
	}
}
