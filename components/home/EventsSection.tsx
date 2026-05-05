"use client";

import { useState } from "react";
import Link from "next/link";
import EventCard from "@/components/EventCard";
import type { EventCardProps } from "@/components/EventCard";

interface EventsSectionProps {
	cards: Omit<EventCardProps, "organizerName">[];
}

const FILTERS = ["All", "Meetup", "Hackathon", "Workshop", "Conference"];

export function EventsSection({ cards }: EventsSectionProps) {
	const [active, setActive] = useState("All");

	const filtered =
		active === "All"
			? cards
			: cards.filter(
					(c) => c.category?.toLowerCase() === active.toLowerCase(),
				);

	return (
		<section className="w-full py-20" style={{ backgroundColor: "var(--bg-base)" }}>
			<div className="mx-auto max-w-6xl px-5 sm:px-8">
				{/* Header */}
				<div className="mb-8">
					<span
						className="text-[11px] font-medium uppercase tracking-[0.1em]"
						style={{ color: "var(--text-muted)" }}
					>
						UPCOMING EVENTS
					</span>
					<h2
						className="mt-2 font-display text-3xl tracking-tight"
						style={{ color: "var(--text-primary)" }}
					>
						What&apos;s Happening Near You
					</h2>
				</div>

				{/* Filter bar */}
				<div className="mb-8 flex gap-2 overflow-x-auto pb-1">
					{FILTERS.map((f) => (
						<button
							key={f}
							onClick={() => setActive(f)}
							className="cursor-pointer whitespace-nowrap px-4 text-[13px] font-medium transition-colors duration-150"
							style={{
								height: "32px",
								borderRadius: "var(--radius-md)",
								border:
									active === f
										? "1px solid var(--accent)"
										: "1px solid var(--border)",
								color:
									active === f
										? "var(--accent)"
										: "var(--text-muted)",
								backgroundColor:
									active === f
										? "var(--accent-subtle)"
										: "transparent",
							}}
						>
							{f}
						</button>
					))}
				</div>

				{/* Grid */}
				{filtered.length > 0 ? (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
						{filtered.map((card) => (
							<EventCard key={card.slug} {...card} />
						))}
					</div>
				) : (
					<div
						className="flex h-40 items-center justify-center rounded-[var(--radius-lg)]"
						style={{
							backgroundColor: "var(--bg-elevated)",
							border: "1px solid var(--border)",
						}}
					>
						<p
							className="text-[15px]"
							style={{ color: "var(--text-muted)" }}
						>
							No events in this category yet.
						</p>
					</div>
				)}

				{/* View all */}
				<div className="mt-8 flex justify-center">
					<Link
						href="/events"
						className="text-[13px] font-medium no-underline transition-colors duration-150"
						style={{ color: "var(--text-secondary)" }}
						onMouseEnter={(e) =>
							(e.currentTarget.style.color = "var(--text-primary)")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.color = "var(--text-secondary)")
						}
					>
						View all events →
					</Link>
				</div>
			</div>
		</section>
	);
}
