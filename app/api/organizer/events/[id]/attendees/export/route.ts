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
		const isCoHost = session.user.email
			? (event.coHostEmails || []).includes(session.user.email.toLowerCase())
			: false;

		if (!isAdmin && !isOwner && !isCoHost) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		// Fetch all active attendees for export
		const attendees = await Registration.find({ eventId })
			.sort({ createdAt: -1 })
			.lean();

		const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

		// One column per custom registration question
		const questions = (event.registrationQuestions || []) as { id: string; label: string }[];

		// Build CSV String
		const headers = [
			"Ticket Code", "Name", "Email", "Phone", "Status", "Booking Date", "Checked In",
			...questions.map(q => csvCell(q.label)),
		];
		const rows = attendees.map(att => {
			const answers = (att.metadata?.answers || []) as { id: string; value: string | boolean }[];
			const answerById = new Map(answers.map(a => [a.id, a.value]));
			return [
				att.ticketCode,
				csvCell(att.attendeeName || ""),
				att.attendeeEmail,
				att.attendeePhone || "",
				att.status,
				new Date(att.createdAt).toISOString(),
				att.checkedInAt ? new Date(att.checkedInAt).toISOString() : "No",
				...questions.map(q => {
					const value = answerById.get(q.id);
					if (value === undefined) return "";
					return csvCell(value === true ? "Yes" : String(value));
				}),
			];
		});

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
