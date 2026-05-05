import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Registration from "@/database/registration.model";
import Event from "@/database/event.model";
import { CalendarDays, MapPin, Ticket, Video } from "lucide-react";

async function getMyRegistrations(userId: string) {
  await connectDB();
  // Ensure Event model is loaded
  require("@/database/event.model");

  const registrations = await Registration.find({ attendeeUserId: userId })
    .populate({
      path: "eventId",
      select: "title slug startAt endAt coverImageUrl eventType location online",
    })
    .sort({ createdAt: -1 })
    .lean();

  return registrations;
}

export const metadata = {
  title: "My Registrations | DevEvent",
};

export default async function MyRegistrationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/my/registrations");
  }

  const registrations = await getMyRegistrations(session.user.id) as any[];

  const now = new Date();

  // Split into upcoming and past based on event's end time
  const upcoming = registrations.filter((reg) => {
    if (!reg.eventId) return false;
    return new Date(reg.eventId.endAt) >= now;
  });

  const past = registrations.filter((reg) => {
    if (!reg.eventId) return false;
    return new Date(reg.eventId.endAt) < now;
  });

  const RegistrationCard = ({ reg }: { reg: any }) => {
    const event = reg.eventId;
    if (!event) return null;

    const startDate = new Date(event.startAt);
    
    return (
      <Link 
        href={`/my/registrations/${reg._id}`}
        className="block bg-white border border-gray-200 rounded-2xl p-4 md:p-6 hover:shadow-lg hover:border-primary/30 transition-all group"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Visual Thumbnail */}
          <div className="w-full md:w-48 aspect-video md:aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden shrink-0">
            {event.coverImageUrl ? (
              <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Ticket className="w-8 h-8 opacity-50" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start gap-4 mb-2">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                {reg.status === "cancelled" ? (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                    Cancelled
                  </span>
                ) : reg.status === "confirmed" ? (
                   <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                    Confirmed
                  </span>
                ) : (
                   <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                    {reg.status}
                  </span>
                )}
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarDays className="w-4 h-4 shrink-0 text-gray-400" />
                  <span>
                    {startDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} at {startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {event.eventType === "online" ? (
                    <Video className="w-4 h-4 shrink-0 text-gray-400" />
                  ) : (
                    <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                  )}
                  <span className="truncate">
                    {event.eventType === "online" ? "Online Event" : event.location?.venueName || event.location?.city || "In-Person Event"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Ticket Code: <span className="text-gray-900 font-mono tracking-wider">{reg.ticketCode}</span>
              </p>
              <span className="text-primary text-sm font-medium group-hover:underline">
                View Details &rarr;
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900">My Registrations</h1>
          <p className="text-gray-600 mt-2">Manage your tickets and upcoming events.</p>
        </div>

        {registrations.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No tickets yet</h2>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
              You haven't registered for any events. Discover upcoming tech events and secure your spot!
            </p>
            <Link 
              href="/events"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-md shadow-primary/20"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                  Upcoming Events
                </h2>
                <div className="space-y-4">
                  {upcoming.map((reg) => (
                    <RegistrationCard key={reg._id.toString()} reg={reg} />
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-6 opacity-80">Past Events</h2>
                <div className="space-y-4 opacity-75">
                  {past.map((reg) => (
                    <RegistrationCard key={reg._id.toString()} reg={reg} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
