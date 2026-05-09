"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import EventCard from "../EventCard";
import { LampContainer } from "../aceternity/lamp";

interface Event {
	_id: string;
	title: string;
	slug: string;
	thumbnail: string;
	location: string;
	eventStartDate: string;
	eventEndDate: string;
	category?: string;
	isPaid?: boolean;
	ticketPrice?: number;
	currency?: string;
	organizerProfileId?: { name?: string };
}

interface EventsSectionProps {
	events: Event[];
}

function formatDate(dateStr: string) {
	try {
		const d = new Date(dateStr);
		return d.toLocaleDateString("en-IN", {
			month: "short",
			day: "numeric",
		});
	} catch {
		return dateStr;
	}
}

function formatTime(dateStr: string) {
	try {
		const d = new Date(dateStr);
		return d.toLocaleTimeString("en-IN", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	} catch {
		return "";
	}
}

const FILTERS = ["All", "Hackathons", "Meetups", "Workshops"];

export function EventsSection({ events }: EventsSectionProps) {
	const [activeFilter, setActiveFilter] = useState("All");

	if (!events || events.length === 0) return null;

	const filteredEvents = events.filter((event) => {
		if (activeFilter === "All") return true;
		return event.category?.toLowerCase() === activeFilter.toLowerCase();
	});

	return (
		<section
			className="relative pb-24 w-full"
			style={{ backgroundColor: "var(--bg-base)" }}
		>
			{/* Lamp Header */}
			<LampContainer>
				<motion.h2
					initial={{ opacity: 0, y: 100 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{
						delay: 0.3,
						duration: 0.8,
						ease: "easeInOut",
					}}
					className="mt-8 py-4 text-center text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tight text-white"
					style={{ fontFamily: "var(--font-display)" }}
				>
					Upcoming Events
				</motion.h2>
			</LampContainer>

			<div className="mx-auto max-w-6xl px-5 -mt-20 relative z-10">
				{/* Filter Bar */}
				<div className="flex flex-wrap items-center justify-center gap-4 mb-12">
					{FILTERS.map((filter) => (
						<button
							key={filter}
							onClick={() => setActiveFilter(filter)}
							className="relative px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
							style={{
								color: activeFilter === filter ? "var(--gold)" : "var(--text-secondary)",
							}}
						>
							{filter}
							{activeFilter === filter && (
								<motion.div
									layoutId="activeFilterUnderline"
									className="absolute left-0 right-0 bottom-0 h-0.5 rounded-full"
									style={{ backgroundColor: "var(--gold)" }}
									transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
								/>
							)}
						</button>
					))}
				</div>

				{/* Event grid */}
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{filteredEvents.slice(0, 6).map((event, index) => (
						<EventCard
							key={event._id}
							title={event.title}
							image={event.thumbnail}
							slug={event.slug}
							location={event.location || "Online"}
							date={formatDate(event.eventStartDate)}
							time={formatTime(event.eventStartDate)}
							category={event.category}
							isPaid={event.isPaid}
							price={event.ticketPrice}
							currency={event.currency}
							organizerName={event.organizerProfileId?.name}
							index={index}
							featured={index === 0 && activeFilter === "All"}
						/>
					))}
				</div>

				{/* View all link */}
				{events.length > 6 && (
					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.4 }}
						className="mt-12 flex justify-center"
					>
						<a
							href="/events"
							className="group inline-flex items-center gap-2 text-[14px] font-medium no-underline transition-colors duration-[160ms]"
							style={{ color: "var(--text-secondary)" }}
							onMouseEnter={(e) =>
								(e.currentTarget.style.color = "var(--gold)")
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.color = "var(--text-secondary)")
							}
						>
							View all events
							<span className="inline-block transition-transform duration-[160ms] group-hover:translate-x-0.5">
								→
							</span>
						</a>
					</motion.div>
				)}
			</div>
		</section>
	);
}
