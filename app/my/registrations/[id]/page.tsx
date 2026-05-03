import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Registration from "@/database/registration.model";
import { ArrowLeft, MapPin, CalendarDays, Clock, QrCode, Ticket, ExternalLink, Video } from "lucide-react";
import CancelRegistrationButton from "@/components/CancelRegistrationButton";

async function getRegistrationDetails(id: string, userId: string) {
  await connectDB();
  require("@/database/event.model");

  const reg = await Registration.findOne({ _id: id, attendeeUserId: userId })
    .populate("eventId")
    .lean();
    
  return reg;
}

export default async function TicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/my/registrations/${id}`);
  }

  const registration = await getRegistrationDetails(id, session.user.id) as any;

  if (!registration || !registration.eventId) {
    notFound();
  }

  const event = registration.eventId;
  const startDate = new Date(event.startAt);
  const isCancelled = registration.status === "cancelled";

  return (
    <main className="min-h-screen bg-gray-50 py-10 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link 
          href="/my/registrations"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Tickets
        </Link>
        
        {/* Ticket Artifact Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          
          {/* Top Decorative Header */}
          <div className={`h-32 relative ${isCancelled ? "bg-gray-300" : "bg-primary"}`}>
             <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent"></div>
             {event.coverImageUrl && !isCancelled && (
               <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                 <img src={event.coverImageUrl} alt="Event cover" className="w-full h-full object-cover grayscale" />
               </div>
             )}
          </div>
          
          {/* Avatar / Icon overlap */}
          <div className="px-8 relative">
             <div className={`w-20 h-20 rounded-2xl flex items-center justify-center -mt-10 border-4 border-white shadow-md
               ${isCancelled ? "bg-gray-200 text-gray-500" : "bg-white text-primary"}`}
             >
               <Ticket className="w-10 h-10" />
             </div>
             
             {/* Main Content */}
             <div className="mt-6 mb-8">
               <div className="flex flex-wrap items-start justify-between gap-4">
                 <div>
                   {isCancelled && (
                     <div className="inline-block bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-full mb-3">
                       Cancelled Registration
                     </div>
                   )}
                   <h1 className="text-3xl font-extrabold text-gray-900 mb-2 max-w-xl leading-tight">
                     {event.title}
                   </h1>
                   <p className="text-gray-500">
                     Registered on {new Date(registration.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                   </p>
                 </div>
                 
                 <div className="text-right shrink-0">
                   <p className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-widest">Ticket Code</p>
                   <p className={`font-mono text-2xl font-bold tracking-widest ${isCancelled ? "text-gray-400 line-through" : "text-gray-900"}`}>
                     {registration.ticketCode}
                   </p>
                 </div>
               </div>
             </div>
             
             {/* Divider */}
             <div className="border-t border-dashed border-gray-300 my-8 relative">
                {/* Cutouts */}
                <div className="absolute -left-12 -top-4 w-8 h-8 rounded-full bg-gray-50 border-r border-gray-200"></div>
                <div className="absolute -right-12 -top-4 w-8 h-8 rounded-full bg-gray-50 border-l border-gray-200"></div>
             </div>
             
             {/* Detail Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
               <div className="space-y-6">
                 <div>
                   <p className="text-sm font-medium text-gray-500 mb-1">Date & Time</p>
                   <div className="flex items-center gap-3 text-gray-900 font-medium">
                     <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                       <CalendarDays className="w-5 h-5" />
                     </div>
                     <div>
                       <p>{startDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}</p>
                       <p className="text-gray-600 font-normal text-sm flex items-center gap-1 mt-0.5">
                         <Clock className="w-3.5 h-3.5" /> 
                         {startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                       </p>
                     </div>
                   </div>
                 </div>
                 
                 <div>
                   <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                   <div className="flex items-start gap-3 text-gray-900 font-medium">
                     <div className="bg-primary/10 text-primary p-2 rounded-lg mt-0.5 shrink-0">
                       {event.eventType === "online" ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                     </div>
                     <div>
                       <p>{event.eventType === "online" ? "Online Platform" : event.location?.venueName || "Venue TBA"}</p>
                       {(event.eventType === "offline" || event.eventType === "hybrid") && event.location?.addressLine1 && (
                         <p className="text-gray-600 font-normal text-sm mt-0.5">{event.location.addressLine1}, {event.location.city}</p>
                       )}
                       {(event.eventType === "online" || event.eventType === "hybrid") && event.online?.platform && (
                         <p className="text-gray-600 font-normal text-sm mt-0.5">Via {event.online.platform}</p>
                       )}
                     </div>
                   </div>
                 </div>
                 
                 <div>
                   <p className="text-sm font-medium text-gray-500 mb-1">Attendee</p>
                   <p className="font-medium text-gray-900">{session.user.name}</p>
                   <p className="text-sm text-gray-500">{session.user.email}</p>
                 </div>
               </div>
               
               {/* QR Mockup Area */}
               <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                 {!isCancelled ? (
                   <>
                     <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4 inline-block">
                       {/* Mock QR graphic, visually representing the cryptographic payload */}
                       <div className="w-48 h-48 bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover opacity-80 mix-blend-multiply"></div>
                     </div>
                     <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                       <QrCode className="w-4 h-4" /> Ready for check-in
                     </p>
                     {registration.checkedInAt && (
                       <div className="mt-3 bg-green-100 text-green-700 font-bold px-4 py-1.5 rounded-full text-sm">
                         Checked In ✓
                       </div>
                     )}
                   </>
                 ) : (
                   <div className="text-center">
                     <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Ticket className="w-8 h-8 text-gray-400" />
                     </div>
                     <p className="text-gray-500 font-medium">Ticket Voided</p>
                   </div>
                 )}
               </div>
             </div>
          </div>
          
          <div className="bg-gray-50 border-t border-gray-200 p-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link 
              href={`/events/${event.slug}`}
              className="text-primary hover:text-primary/80 font-medium flex items-center gap-1.5 transition-colors"
            >
              Event Page <ExternalLink className="w-4 h-4" />
            </Link>
            
            {!isCancelled && !registration.checkedInAt && (
              <CancelRegistrationButton registrationId={registration._id.toString()} />
            )}
          </div>
          
        </div>
      </div>
    </main>
  );
}
