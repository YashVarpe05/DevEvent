"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import EventCard from "@/components/EventCard";
import ScrollReveal from "../components/ScrollReveal";

const filters = ["All", "Meetup", "Hackathon", "Workshop", "Conference"] as const;

type EventCategory = (typeof filters)[number];

/* eslint-disable @typescript-eslint/no-explicit-any */
interface EventsDiscoveryProps {
	events: any[];
}

export default function EventsDiscovery({ events }: EventsDiscoveryProps) {
	const [activeFilter, setActiveFilter] = useState<EventCategory>("All");

	const filteredEvents =
		activeFilter === "All"
			? events
			: events.filter(
					(event) =>
						event.category?.toLowerCase() === activeFilter.toLowerCase(),
				);

	// Limit to 6 events on the home page
	const displayEvents = filteredEvents.slice(0, 6);

	return (
		<section className="events-discovery">
			<style>{eventsDiscoveryStyles}</style>
			<div className="events-discovery__inner">
				<ScrollReveal>
					<div className="events-discovery__label">{"// UPCOMING EVENTS"}</div>
					<h2 className="events-discovery__headline">
						Find Your Next <span>Event</span>
					</h2>
					<p className="events-discovery__copy">
						Handpicked hackathons, meetups, and workshops happening across India.
					</p>
				</ScrollReveal>

				<ScrollReveal delay={0.1}>
					<div className="events-discovery__filters" aria-label="Event filters">
						{filters.map((filter) => (
							<button
								key={filter}
								type="button"
								aria-pressed={activeFilter === filter}
								onClick={() => setActiveFilter(filter)}
								className="events-discovery__filter"
								data-active={activeFilter === filter}
							>
								{filter}
							</button>
						))}
					</div>
				</ScrollReveal>

				<motion.div layout className="events-discovery__grid">
					<AnimatePresence mode="popLayout">
						{displayEvents.length > 0 ? (
							displayEvents.map((event, index) => {
								const dateStr = event.startAt
									? new Date(event.startAt).toLocaleDateString("en-IN", {
											month: "short",
											day: "numeric",
											year: "numeric",
										})
									: "";
								const timeStr = event.startAt
									? new Date(event.startAt).toLocaleTimeString("en-IN", {
											hour: "2-digit",
											minute: "2-digit",
										})
									: "";
								const locationStr =
									event.location?.city ||
									event.location?.venueName ||
									(event.eventType === "online" ? "Online" : "TBA");

								return (
									<motion.div
										key={event._id || event.slug || index}
										layout
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 16, scale: 0.98 }}
										transition={{ duration: 0.4, delay: index * 0.06 }}
										className="events-discovery__card-wrap"
									>
										<EventCard
											title={event.title}
											image={event.coverImageUrl || "/placeholder-event.jpg"}
											slug={event.slug}
											location={locationStr}
											date={dateStr}
											time={timeStr}
											category={event.category}
											isPaid={event.isPaid}
											price={event.basePrice}
											currency={event.currency || "INR"}
											organizerName={event.organizerName}
											index={index}
											featured={event.isFeatured}
										/>
									</motion.div>
								);
							})
						) : (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="events-discovery__empty"
							>
								<p>No events found for this category.</p>
								<Link href="/events" className="events-discovery__view-link">
									Browse All Events <ArrowRight aria-hidden="true" size={16} />
								</Link>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>

				<ScrollReveal delay={0.2}>
					<div className="events-discovery__view-all">
						<Link href="/events" className="events-discovery__view-link">
							View All Events <ArrowRight aria-hidden="true" size={16} />
						</Link>
					</div>
				</ScrollReveal>
			</div>
		</section>
	);
}

const eventsDiscoveryStyles = `
	.events-discovery {
		width: 100%;
		padding: 96px 0;
		background: var(--bg-base, #0A0A0B);
		border-bottom: 1px solid var(--border-dim, #1F1F23);
	}

	.events-discovery__inner {
		width: min(100%, 1440px);
		margin: 0 auto;
		padding: 0 24px;
	}

	.events-discovery__label {
		margin-bottom: 16px;
		color: var(--gold, #FF6B35);
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.1em;
		line-height: 1.2;
		text-transform: uppercase;
	}

	.events-discovery__headline {
		max-width: 720px;
		margin: 0 0 16px;
		color: var(--text-primary, #E8E6E3);
		font-family: var(--font-display);
		font-size: clamp(40px, 5vw, 56px);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 0.9;
	}

	.events-discovery__headline span {
		color: var(--gold, #FF6B35);
		font-style: italic;
	}

	.events-discovery__copy {
		max-width: 500px;
		margin: 0 0 32px;
		color: var(--text-muted, #6B6B74);
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.65;
	}

	.events-discovery__filters {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 40px;
	}

	.events-discovery__filter {
		appearance: none;
		border: 1px solid var(--border-dim, #1F1F23);
		border-radius: 4px;
		background: transparent;
		color: var(--text-muted, #6B6B74);
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.14em;
		line-height: 1;
		padding: 10px 16px;
		text-transform: uppercase;
		transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease;
	}

	.events-discovery__filter:hover {
		border-color: var(--text-muted, #6B6B74);
		color: var(--text-primary, #E8E6E3);
	}

	.events-discovery__filter[data-active="true"] {
		border-color: var(--gold, #FF6B35);
		background: var(--gold, #FF6B35);
		color: var(--bg-base, #0A0A0B);
		font-weight: 700;
	}

	.events-discovery__grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}

	.events-discovery__card-wrap {
		min-width: 0;
	}

	.events-discovery__empty {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 64px 24px;
		color: var(--text-muted, #6B6B74);
		font-family: var(--font-body);
		font-size: 16px;
		text-align: center;
	}

	.events-discovery__view-all {
		display: flex;
		justify-content: flex-end;
		margin-top: 40px;
	}

	.events-discovery__view-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		color: var(--gold, #FF6B35);
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		text-decoration: none;
	}

	.events-discovery__view-link:hover {
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	@media (min-width: 768px) {
		.events-discovery__grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 1024px) {
		.events-discovery__inner {
			padding-inline: 40px;
		}

		.events-discovery__grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (max-width: 640px) {
		.events-discovery {
			padding: 72px 0;
		}

		.events-discovery__view-all {
			justify-content: flex-start;
		}
	}
`;
