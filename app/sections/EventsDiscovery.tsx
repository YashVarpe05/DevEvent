"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "../components/ScrollReveal";

const filters = ["All", "Meetup", "Hackathon", "Workshop", "Conference"] as const;

const events = [
	{
		category: "Meetup",
		date: "DEC 15 · MUMBAI",
		featured: true,
		location: "Mumbai",
		organizer: "ReactJS India",
		price: "FREE",
		spots: "24 spots left",
		title: "React Mumbai Meetup",
	},
	{
		category: "Hackathon",
		date: "NOV 02 · MUMBAI",
		featured: false,
		location: "Mumbai",
		organizer: "ETHIndia",
		price: "₹500",
		spots: "12 spots left",
		title: "Web3 Buildathon",
	},
	{
		category: "Workshop",
		date: "JAN 10 · PUNE",
		featured: false,
		location: "Pune",
		organizer: "GopherCon India",
		price: "₹1,999",
		spots: "8 spots left",
		title: "GoLang Workshop",
	},
	{
		category: "Conference",
		date: "DEC 12 · DELHI",
		featured: false,
		location: "Delhi NCR",
		organizer: "JSConf",
		price: "₹2,499",
		spots: "Sold Out",
		title: "JSConf India 2024",
	},
	{
		category: "Meetup",
		date: "NOV 18 · BANGALORE",
		featured: false,
		location: "Bangalore",
		organizer: "TFUG",
		price: "FREE",
		spots: "45 spots left",
		title: "AI Saturday",
	},
	{
		category: "Conference",
		date: "FEB 20 · HYDERABAD",
		featured: false,
		location: "Hyderabad",
		organizer: "AWS UG",
		price: "₹3,499",
		spots: "Early Bird",
		title: "DevOps Summit",
	},
] as const;

type EventCategory = (typeof filters)[number];

export default function EventsDiscovery() {
	const [activeFilter, setActiveFilter] = useState<EventCategory>("All");
	const filteredEvents =
		activeFilter === "All"
			? events
			: events.filter((event) => event.category === activeFilter);

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
						{filteredEvents.map((event, index) => (
							<motion.div
								key={event.title}
								layout
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 16, scale: 0.98 }}
								transition={{ duration: 0.4, delay: index * 0.06 }}
								className="events-discovery__card-wrap"
							>
								<Link
									href="/events"
									className="events-discovery-card"
									data-featured={event.featured}
								>
									<div className="events-discovery-card__cover">
										<div className="events-discovery-card__surface" />
										<div className="events-discovery-card__mark">&lt;/&gt;</div>
										<div className="events-discovery-card__badge">
											{event.category}
										</div>
										<div
											className="events-discovery-card__price"
											data-free={event.price === "FREE"}
										>
											{event.price}
										</div>
										<div className="events-discovery-card__hover" />
									</div>

									<div className="events-discovery-card__body">
										<div className="events-discovery-card__date">
											{event.date}
										</div>
										<h3 className="events-discovery-card__title">
											{event.title}
										</h3>
										<div className="events-discovery-card__meta">
											<div className="events-discovery-card__organizer">
												<div className="events-discovery-card__avatar" />
												<span>{event.organizer}</span>
											</div>
											<span
												className="events-discovery-card__spots"
												data-status={event.spots}
											>
												{event.spots}
											</span>
										</div>
										<span className="events-discovery-card__location">
											{event.location}
										</span>
									</div>
								</Link>
							</motion.div>
						))}
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
		background: #0A0A0B;
		border-bottom: 1px solid #1F1F23;
	}

	.events-discovery__inner {
		width: min(100%, 1440px);
		margin: 0 auto;
		padding: 0 24px;
	}

	.events-discovery__label {
		margin-bottom: 16px;
		color: #FF6B35;
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.1em;
		line-height: 1.2;
		text-transform: uppercase;
	}

	.events-discovery__headline {
		max-width: 720px;
		margin: 0 0 16px;
		color: #E8E6E3;
		font-family: var(--font-display);
		font-size: clamp(40px, 5vw, 56px);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 0.9;
	}

	.events-discovery__headline span {
		color: #FF6B35;
		font-style: italic;
	}

	.events-discovery__copy {
		max-width: 500px;
		margin: 0 0 32px;
		color: #6B6B74;
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
		border: 1px solid #1F1F23;
		border-radius: 4px;
		background: transparent;
		color: #6B6B74;
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
		border-color: #6B6B74;
		color: #E8E6E3;
	}

	.events-discovery__filter[data-active="true"] {
		border-color: #FF6B35;
		background: #FF6B35;
		color: #0A0A0B;
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

	.events-discovery-card {
		display: block;
		height: 100%;
		overflow: hidden;
		background: #111113;
		border: 1px solid #1F1F23;
		border-radius: 0;
		color: inherit;
		cursor: pointer;
		text-decoration: none;
		transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
	}

	.events-discovery-card:hover {
		border-color: #FF6B35;
		transform: translateY(-4px);
	}

	.events-discovery-card[data-featured="true"] {
		border-color: #FF6B35;
		box-shadow: 0 0 20px rgba(255, 107, 53, 0.1);
	}

	.events-discovery-card__cover {
		position: relative;
		height: 176px;
		overflow: hidden;
		background: #111113;
		border-bottom: 1px solid #1F1F23;
	}

	.events-discovery-card__surface {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, #1A1B22 0%, #111113 100%);
		transition: filter 240ms ease, transform 240ms ease;
	}

	.events-discovery-card[data-featured="true"] .events-discovery-card__surface {
		background: linear-gradient(135deg, #1A1B22 0%, #111113 100%);
	}

	.events-discovery-card:hover .events-discovery-card__surface {
		filter: saturate(1.25);
		transform: scale(1.02);
	}

	.events-discovery-card__mark {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #1F1F23;
		font-family: var(--font-mono);
		font-size: 40px;
		font-weight: 700;
	}

	.events-discovery-card__badge {
		position: absolute;
		top: 12px;
		left: 12px;
		border: 1px solid #1F1F23;
		background: #111113;
		color: #E8E6E3;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.08em;
		line-height: 1;
		padding: 6px 8px;
		text-transform: uppercase;
	}

	.events-discovery-card__price {
		position: absolute;
		top: 12px;
		right: 12px;
		color: #FF6B35;
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 700;
		line-height: 1;
		text-transform: uppercase;
	}

	.events-discovery-card__price[data-free="true"] {
		color: #00D4AA;
	}

	.events-discovery-card__hover {
		position: absolute;
		inset: 0;
		background: rgba(255, 107, 53, 0);
		transition: background-color 180ms ease;
	}

	.events-discovery-card:hover .events-discovery-card__hover {
		background: rgba(255, 107, 53, 0.05);
	}

	.events-discovery-card__body {
		padding: 16px;
	}

	.events-discovery-card__date {
		margin-bottom: 8px;
		color: #6B6B74;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.08em;
		line-height: 1.3;
		text-transform: uppercase;
	}

	.events-discovery-card__title {
		min-height: 46px;
		margin: 0 0 12px;
		color: #E8E6E3;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		letter-spacing: 0;
		line-height: 1.12;
	}

	.events-discovery-card__meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding-top: 12px;
		border-top: 1px solid #1F1F23;
	}

	.events-discovery-card__organizer {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 8px;
		color: #6B6B74;
		font-family: var(--font-mono);
		font-size: 11px;
		line-height: 1.2;
	}

	.events-discovery-card__organizer span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.events-discovery-card__avatar {
		width: 20px;
		height: 20px;
		flex: 0 0 20px;
		background: #1F1F23;
	}

	.events-discovery-card__spots {
		flex: 0 0 auto;
		color: #6B6B74;
		font-family: var(--font-mono);
		font-size: 10px;
		line-height: 1.2;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.events-discovery-card__spots[data-status="Early Bird"] {
		color: #FF6B35;
	}

	.events-discovery-card__location {
		display: block;
		margin-top: 10px;
		color: #45454D;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
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
		color: #FF6B35;
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
