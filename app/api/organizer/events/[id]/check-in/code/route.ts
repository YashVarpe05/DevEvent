export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Event from "@/database/event.model";
import Registration from "@/database/registration.model";
import User from "@/database/user.model";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { id: eventId } = await props.params;
    const { ticketCode } = await req.json();

    if (!ticketCode) {
      return NextResponse.json({ message: "Ticket code is required" }, { status: 400 });
    }

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

    // Find registration by code for this specific event
    const registration = await Registration.findOne({ 
      eventId, 
      ticketCode: ticketCode.toUpperCase().trim() 
    }).populate({
      path: "attendeeUserId",
      select: "name email"
    });

    if (!registration) {
      return NextResponse.json({ message: "Invalid ticket code for this event" }, { status: 404 });
    }

    // Validate status
    if (registration.status !== "confirmed") {
      return NextResponse.json({ 
        message: `Ticket is ${registration.status}`,
        registration 
      }, { status: 400 });
    }

    if (registration.checkedInAt) {
      return NextResponse.json({ 
        message: "Attendee already checked in", 
        registration 
      }, { status: 400 });
    }

    // Mark as checked in
    registration.checkedInAt = new Date();
    registration.checkedInBy = session.user.id;
    await registration.save();

    return NextResponse.json({ 
      message: "Check-in successful", 
      registration 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Check-in-by-code error:", error);
    return NextResponse.json({ message: "Failed to process check-in" }, { status: 500 });
  }
}
