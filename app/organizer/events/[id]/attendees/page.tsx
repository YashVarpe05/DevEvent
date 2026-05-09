export const dynamic = 'force-dynamic';
import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Registration from "@/database/registration.model";
import { ArrowLeft, Users, QrCode } from "lucide-react";
import AttendeeTable from "@/components/organizer/AttendeeTable";

async function getEventAndAttendees(eventId: string, userId: string) {
  await connectDB();
  require("@/database/user.model"); // ensure User is loaded for population

  const event = await Event.findOne({ _id: eventId, organizerId: userId }).lean();
  
  if (!event) return null;

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
    attendeeUserId: {
      ...a.attendeeUserId,
      _id: a.attendeeUserId._id.toString()
    }
  }));

  const total = await Registration.countDocuments({ eventId });
  const checkedInCount = await Registration.countDocuments({ eventId, checkedInAt: { $ne: null } });
  const cancelledCount = await Registration.countDocuments({ eventId, status: "cancelled" });

  return { 
    event: { ...event, _id: event._id.toString() }, 
    attendees: serializedAttendees, 
    total,
    checkedInCount,
    cancelledCount
  };
}

export default async function OrganizerAttendeesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/organizer/events/${id}/attendees`);
  }

  const data = await getEventAndAttendees(id, session.user.id);

  if (!data) {
    notFound();
  }

  const { event, attendees, total, checkedInCount, cancelledCount } = data;
  const activeAttendees = total - cancelledCount;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="flex items-center gap-4 mb-4">
        <Link 
          href={`/organizer/events/${event._id}`}
          className="text-gray-500 hover:text-gray-900 transition-colors bg-white border border-gray-200 p-2 rounded-lg shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-gray-400 font-medium">|</span>
        <span className="text-gray-600 font-medium truncate">{event.title}</span>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Manage Attendees</h1>
          <p className="text-gray-500 mt-1">View registrations, handle check-ins, and export data.</p>
        </div>
        
        <Link 
          href={`/organizer/events/${event._id}/check-in`}
          className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <QrCode className="w-5 h-5" />
          Open Check-in Scanner
        </Link>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
           <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5"><Users className="w-4 h-4" /> Total Registrations</p>
           <p className="text-3xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
           <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Active Attendees</p>
           <p className="text-3xl font-bold text-gray-900">{activeAttendees}</p>
           {event.capacity && <p className="text-xs text-gray-400 mt-1">of {event.capacity} capacity</p>}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
           <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> Checked In</p>
           <p className="text-3xl font-bold text-green-600">{checkedInCount}</p>
           <p className="text-xs text-gray-400 mt-1">
             {activeAttendees > 0 ? Math.round((checkedInCount / activeAttendees) * 100) : 0}% arrival rate
           </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
           <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Cancelled</p>
           <p className="text-3xl font-bold text-gray-900">{cancelledCount}</p>
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
