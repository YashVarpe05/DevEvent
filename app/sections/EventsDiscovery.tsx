"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/Button";
import { getAllEvents } from "@/lib/actions/event.actions";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function EventsDiscovery() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  
  const filters = ["All", "Meetup", "Hackathon", "Workshop", "Conference"];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Fallback fake data if action fails or is missing
        const fallbackEvents = [
          {
            _id: "1",
            title: "Web3 Builders Meetup",
            slug: "web3-builders-meetup",
            date: "OCT 24, 2024",
            time: "10:00 AM",
            location: "BENGALURU",
            category: "Meetup",
            image: "",
            organizerName: "DevFolio",
            isPaid: false,
            featured: true,
          },
          {
            _id: "2",
            title: "AI Hackathon 2024",
            slug: "ai-hackathon-2024",
            date: "NOV 05, 2024",
            time: "09:00 AM",
            location: "HYDERABAD",
            category: "Hackathon",
            image: "",
            organizerName: "MLH",
            isPaid: true,
            price: 500,
          },
          {
            _id: "3",
            title: "React Server Components Workshop",
            slug: "rsc-workshop",
            date: "NOV 12, 2024",
            time: "02:00 PM",
            location: "REMOTE",
            category: "Workshop",
            image: "",
            organizerName: "ReactJS India",
            isPaid: false,
          }
        ];

        let fetchedEvents = fallbackEvents;
        
        try {
          // Attempt to fetch real events
          const result = await getAllEvents();
          if (result?.data && result.data.length > 0) {
            fetchedEvents = result.data.map((evt: any) => ({
              ...evt,
              date: new Date(evt.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
              time: new Date(evt.startDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              location: evt.location || "REMOTE",
              category: evt.category?.name || "Event",
              image: evt.imageUrl || "",
              organizerName: evt.organizer?.firstName || "Organizer",
              isPaid: evt.isFree === false,
              price: evt.price ? parseFloat(evt.price) : undefined,
            }));
          }
        } catch (e) {
          console.error("Using fallback events due to error:", e);
        }

        setEvents(fetchedEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = activeFilter === "All" 
    ? events 
    : events.filter(e => e.category?.toLowerCase() === activeFilter.toLowerCase());

  return (
    <section className="py-24 bg-bg-base border-b border-border-subtle" id="discover">
      <div className="max-w-[1440px] mx-auto px-6">
        
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="section-label mb-4 block">
              // UPCOMING EVENTS
            </span>
            <h2 className="editorial-headline text-[40px] md:text-[56px]">
              Find Your <br />
              <em className="text-accent not-italic pr-2">Next Event</em>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`font-mono text-[10px] sm:text-[12px] uppercase tracking-widest px-4 py-2 border rounded-none transition-all ${
                  activeFilter === filter
                    ? "bg-accent border-accent text-bg-base font-bold"
                    : "bg-bg-elevated border-border-subtle text-text-secondary hover:border-accent hover:text-accent"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full aspect-[4/5] animate-shimmer border border-border-subtle rounded-none" />
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredEvents.map((event, idx) => (
                <motion.div
                  key={event._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <EventCard {...event} index={idx} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="py-20 border border-border-subtle border-dashed flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 mb-4 flex items-center justify-center border border-border-subtle text-text-secondary font-mono text-2xl">
              0
            </div>
            <h3 className="font-display font-bold text-2xl text-text-primary mb-2">No events found</h3>
            <p className="font-mono text-[12px] uppercase text-text-secondary tracking-widest">
              Try selecting a different category
            </p>
          </div>
        )}

        <ScrollReveal delay={0.2} className="mt-16 flex justify-center">
          <Button href="/events" variant="secondary" size="lg">
            View All Events &rarr;
          </Button>
        </ScrollReveal>

      </div>
    </section>
  );
}
