export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { canManageEvent } from "@/lib/event-access";
import { verifyQrPayload } from "@/lib/utils/ticket";
import { isRateLimited } from "@/lib/auth.utils";
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

    // Rate limit per scanning user — closes brute-forcing of ticket codes.
    if (await isRateLimited(`checkin:${session.user.id}`, 120, 60 * 1000)) {
      return NextResponse.json(
        { message: "Too many check-in attempts. Slow down a moment." },
        { status: 429 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const { ticketCode, payload } = body as { ticketCode?: string; payload?: string };

    if (!ticketCode && !payload) {
      return NextResponse.json({ message: "A ticket code or QR is required" }, { status: 400 });
    }

    await connectDB();

    const event = await Event.findById(eventId).lean();
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    if (!canManageEvent(event, session)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Resolve the registration. A scanned QR carries a signed payload —
    // verify the signature first so forged/tampered QRs are rejected before
    // any DB lookup. Manually typed codes fall back to a code match.
    let registration;
    let scanMethod: "qr" | "code" = "code";

    if (payload) {
      const verified = verifyQrPayload(payload);
      if (!verified) {
        return NextResponse.json(
          { message: "Invalid or tampered QR code" },
          { status: 400 },
        );
      }
      if (verified.eventId !== eventId) {
        return NextResponse.json(
          { message: "This ticket is for a different event" },
          { status: 400 },
        );
      }
      scanMethod = "qr";
      registration = await Registration.findOne({
        _id: verified.registrationId,
        eventId,
      }).populate({ path: "attendeeUserId", select: "name email" });
    } else {
      registration = await Registration.findOne({
        eventId,
        ticketCode: ticketCode!.toUpperCase().trim(),
      }).populate({ path: "attendeeUserId", select: "name email" });
    }

    if (!registration) {
      return NextResponse.json(
        { message: scanMethod === "qr" ? "Ticket not found for this event" : "Invalid ticket code for this event" },
        { status: 404 },
      );
    }

    if (registration.status !== "confirmed") {
      return NextResponse.json({
        message: `Ticket is ${registration.status}`,
        registration,
      }, { status: 400 });
    }

    if (registration.checkedInAt) {
      return NextResponse.json({
        message: "Attendee already checked in",
        registration,
      }, { status: 400 });
    }

    registration.checkedInAt = new Date();
    registration.checkedInBy = session.user.id;
    await registration.save();

    return NextResponse.json({
      message: "Check-in successful",
      scanMethod,
      registration,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Check-in-by-code error:", error);
    return NextResponse.json({ message: "Failed to process check-in" }, { status: 500 });
  }
}
