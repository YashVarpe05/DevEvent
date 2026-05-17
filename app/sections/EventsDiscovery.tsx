"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/Button";

/* eslint-disable @typescript-eslint/no-explicit-any */
type EventsDiscoveryProps = {
  events: any[];
};

export default function EventsDiscovery({ events }: EventsDiscoveryProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  
  const filters = ["All", "Meetup", "Hackathon", "Workshop", "Conference"];

  const filteredEvents = (activeFilter === "All" 
    ? events 
    : events.filter(e => e.category?.toLowerCase() === activeFilter.toLowerCase())
  ).slice(0, 6);

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

        {filteredEvents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: 'var(--text-muted, #888892)',
            fontSize: '14px',
          }}>
            No events yet. Check back soon.
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <AnimatePresence>
              {filteredEvents.map((event, i) => (
                <motion.div
                  key={event._id?.toString() || i}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <EventCard
                    title={event.title}
                    image={event.coverImageUrl || ''}
                    slug={event.slug}
                    location={
                      event.eventType === 'online' 
                        ? 'Online' 
                        : event.location?.city || 'TBA'
                    }
                    date={new Date(event.startAt)
                      .toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    time={new Date(event.startAt)
                      .toLocaleTimeString('en-IN', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    isPaid={event.isPaid ?? (event.isFree === false)}
                    price={event.basePrice ?? (event.price ? parseFloat(event.price) : undefined)}
                    currency={event.currency || 'INR'}
                    category={typeof event.category === 'string' ? event.category : event.category?.name || 'Event'}
                    organizerName={typeof event.organizer === 'string' ? event.organizer : event.organizer?.firstName || 'Organizer'}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
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
