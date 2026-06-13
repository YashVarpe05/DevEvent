export const dynamic = 'force-dynamic';
import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Registration from "@/database/registration.model";
import { ArrowLeft, Users, QrCode, Megaphone, Star } from "lucide-react";
import AttendeeTable from "@/components/organizer/AttendeeTable";
import { canManageEvent } from "@/lib/event-access";
import type { Session } from "next-auth";

async function getEventAndAttendees(eventId: string, session: Session) {
  await connectDB();
  require("@/database/user.model"); // ensure User is loaded for population

  const event = await Event.findById(eventId).lean();

  if (!event || !canManageEvent(event, session)) return null;

  // For initial load, fetch up to 100 recent attendees.
  // In a full production app with millions of row, we'd rely heavily on the client component fetching from an API.
  const attendees = await Registration.find({ eventId })
    .populate({
      path: "attendeeUserId",
      select: "name email image",
    })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
    
  // Convert _ids to strings for Client Component
  const serializedAttendees = attendees.map((a: any) => ({
    ...a,
    _id: a._id.toString(),
    eventId: a.eventId.toString(),
    // Populate returns null if the user account was deleted — fall back to
    // the snapshot fields stored on the registration itself.
    attendeeUserId: a.attendeeUserId
      ? { ...a.attendeeUserId, _id: a.attendeeUserId._id.toString() }
      : { _id: "", name: a.attendeeName, email: a.attendeeEmail },
  }));

  const total = await Registration.countDocuments({ eventId });
  const checkedInCount = await Registration.countDocuments({ eventId, checkedInAt: { $ne: null } });
  const confirmedCount = await Registration.countDocuments({ eventId, status: "confirmed" });
  const pendingCount = await Registration.countDocuments({ eventId, status: "pending_approval" });
  const waitlistedCount = await Registration.countDocuments({ eventId, status: "waitlisted" });
  const cancelledCount = await Registration.countDocuments({
    eventId,
    status: { $in: ["cancelled_by_user", "cancelled_by_organizer"] },
  });

  return {
    event: { ...event, _id: event._id.toString() },
    attendees: serializedAttendees,
    total,
    checkedInCount,
    confirmedCount,
    pendingCount,
    waitlistedCount,
    cancelledCount
  };
}

export default async function OrganizerAttendeesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/organizer/events/${id}/attendees`);
  }

  const data = await getEventAndAttendees(id, session);

  if (!data) {
    notFound();
  }

  const { event, attendees, total, checkedInCount, confirmedCount, pendingCount, waitlistedCount, cancelledCount } = data;
  const activeAttendees = confirmedCount;

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <Link 
          href={`/organizer/events/${event._id}`}
          style={{ color: "var(--text-secondary)", background: "var(--bg-surface)", border: "1px solid var(--border-dim)", padding: "8px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span style={{ color: "var(--border-dim)", fontWeight: 500 }}>|</span>
        <span style={{ color: "var(--text-secondary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.title}</span>
      </div>
      
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "24px", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "0 0 8px 0" }}>Manage Attendees</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", margin: 0 }}>View registrations, handle check-ins, and export data.</p>
        </div>
        
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link
          href={`/organizer/events/${event._id}/feedback`}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "var(--bg-surface)", border: "1px solid var(--border-dim)", color: "var(--text-primary)", padding: "10px 20px", borderRadius: "var(--radius-md)", fontWeight: 600, transition: "all 0.2s", textDecoration: "none" }}
        >
          <Star className="w-5 h-5" />
          Feedback
        </Link>
        <Link
          href={`/organizer/events/${event._id}/messages`}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "var(--bg-surface)", border: "1px solid var(--border-dim)", color: "var(--text-primary)", padding: "10px 20px", borderRadius: "var(--radius-md)", fontWeight: 600, transition: "all 0.2s", textDecoration: "none" }}
        >
          <Megaphone className="w-5 h-5" />
          Message Guests
        </Link>
        <Link
          href={`/organizer/events/${event._id}/check-in`}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "var(--gold)", color: "#000", padding: "10px 20px", borderRadius: "var(--radius-md)", fontWeight: 600, transition: "all 0.2s", textDecoration: "none", boxShadow: "0 0 16px var(--gold-dim)" }}
        >
          <QrCode className="w-5 h-5" />
          Open Check-in Scanner
        </Link>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-lg)", padding: "24px" }}>
           <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}><Users className="w-4 h-4" /> Total Registrations</p>
           <p style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: 0 }}>{total}</p>
        </div>
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-lg)", padding: "24px" }}>
           <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6" }}></span> Confirmed</p>
           <p style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: 0 }}>{activeAttendees}</p>
           {event.capacity && <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>of {event.capacity} capacity</p>}
        </div>
        {(pendingCount > 0 || waitlistedCount > 0 || event.requiresApproval) && (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-lg)", padding: "24px" }}>
           <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }}></span> Awaiting Action</p>
           <p style={{ fontSize: "32px", fontWeight: 700, color: "#f59e0b", fontFamily: "var(--font-display)", margin: 0 }}>{pendingCount + waitlistedCount}</p>
           <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{pendingCount} pending · {waitlistedCount} waitlisted</p>
        </div>
        )}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-lg)", padding: "24px" }}>
           <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--green)" }}></span> Checked In</p>
           <p style={{ fontSize: "32px", fontWeight: 700, color: "var(--green)", fontFamily: "var(--font-display)", margin: 0 }}>{checkedInCount}</p>
           <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
             {activeAttendees > 0 ? Math.round((checkedInCount / activeAttendees) * 100) : 0}% arrival rate
           </p>
        </div>
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-lg)", padding: "24px" }}>
           <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--red)" }}></span> Cancelled</p>
           <p style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: 0 }}>{cancelledCount}</p>
        </div>
      </div>

      <AttendeeTable 
        eventId={event._id} 
        initialAttendees={attendees} 
        totalExpected={total} 
      />

    </div>
  );
}
