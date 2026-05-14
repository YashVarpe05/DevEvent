"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const stats = [
	{ value: "2400+", label: "Developers" },
	{ value: "140+", label: "Events" },
	{ value: "28", label: "Cities" },
	{ value: "100%", label: "Open Source" },
] as const;

const cards = [
	{
		date: "OCT 14 · BANGALORE",
		description: "The premier React conference in Asia.",
		initial: { opacity: 0, rotate: -12, x: 60, y: -40 },
		rest: { opacity: 0.6, rotate: -8, x: 40, y: -30 },
		symbol: "</>",
		title: "React India 2024",
	},
	{
		date: "JAN 05 · HYDERABAD",
		description: "Hardware hacking at scale.",
		initial: { opacity: 0, rotate: 8, x: -20, y: 20 },
		rest: { opacity: 0.85, rotate: 3, x: 0, y: 0 },
		symbol: "{ }",
		title: "IoT Build Summit",
	},
	{
		date: "NOV 02 · MUMBAI",
		description: "Building the decentralized future.",
		initial: { opacity: 0, rotate: -6, x: -40, y: 40 },
		rest: { opacity: 1, rotate: -2, x: -30, y: 30 },
		symbol: "#_#",
		title: "Web3 Buildathon",
	},
] as const;

export default function Hero() {
	return (
		<section className="home-hero-section">
			<style>{heroStyles}</style>

			<div className="home-hero-left">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="home-hero-eyebrow"
				>
					{"// INDIA'S DEVELOPER EVENT PLATFORM"}
				</motion.div>

				<motion.h1
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
					className="home-hero-title"
				>
					Where Builders
					<br />
					<span>Come Together</span>
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="home-hero-copy"
				>
					Discover hackathons, meetups, and workshops. Book your spot in
					seconds. No fluff.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="home-hero-actions"
				>
					<Link href="/events" className="home-hero-primary">
						Browse Events
						<ArrowRight className="home-hero-icon" />
					</Link>
					<Link href="/become-organizer" className="home-hero-secondary">
						List an Event
					</Link>
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="home-hero-stats"
				>
					{stats.map((stat, index) => (
						<div className="home-hero-stat-group" key={stat.label}>
							<div className="home-hero-stat">
								<span>{stat.value}</span>
								{stat.label}
							</div>
							{index < stats.length - 1 && (
								<span className="home-hero-dot">·</span>
							)}
						</div>
					))}
				</motion.div>
			</div>

			<div className="home-hero-strip">
				<div className="home-hero-strip-text">
					HACKATHON · MEETUP · WORKSHOP · CONFERENCE · BUILDATHON · ASSEMBLY ·
					HACKATHON · MEETUP
				</div>
			</div>

			<div className="home-hero-right">
				<div className="grain-overlay" />
				<div className="home-card-stage">
					{cards.map((card, index) => (
						<EventStackCard card={card} index={index} key={card.title} />
					))}
				</div>
			</div>
		</section>
	);
}

function EventStackCard({
	card,
	index,
}: {
	card: (typeof cards)[number];
	index: number;
}) {
	const isFront = index === 2;
	const gradientFrom =
		index === 0 ? "#1A1B22" : index === 1 ? "#1E1F27" : "#34343C";

	return (
		<motion.div
			initial={card.initial}
			animate={card.rest}
			transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
			className={`home-event-card ${isFront ? "is-front" : ""}`}
		>
			{isFront && <div className="home-event-live">LIVE</div>}
			<div className="home-event-art">
				<div
					className="home-event-gradient"
					style={{
						background: `linear-gradient(135deg, ${gradientFrom}, #111113)`,
					}}
				/>
				<div className={`home-event-symbol ${isFront ? "is-front" : ""}`}>
					{card.symbol}
				</div>
			</div>
			<div className="home-event-date">{card.date}</div>
			<h3 className="home-event-title">{card.title}</h3>
			<p className="home-event-description">{card.description}</p>
			{isFront && (
				<div className="home-event-meta">
					<span>$50k Grant Pool</span>
					<i>·</i>
					<b>24h Hackathon</b>
				</div>
			)}
		</motion.div>
	);
}

const heroStyles = `
	.home-hero-section {
		position: relative;
		display: flex;
		min-height: calc(100vh - 64px);
		flex-direction: column;
		align-items: stretch;
		overflow: hidden;
		border-bottom: 1px solid var(--border-dim, #1F1F23);
		background: var(--bg-base, #0A0A0B);
	}

	.home-hero-left {
		position: relative;
		z-index: 10;
		display: flex;
		width: 100%;
		flex-direction: column;
		justify-content: center;
		padding: 80px 24px;
	}

	.home-hero-eyebrow {
		margin-bottom: 24px;
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--gold, #FF6B35);
	}

	.home-hero-title {
		margin: 0 0 24px;
		font-family: var(--font-display);
		font-size: clamp(48px, 5.8vw, 80px);
		font-weight: 700;
		line-height: 0.85;
		letter-spacing: -0.03em;
		text-transform: uppercase;
		color: var(--text-primary, #E8E6E3);
	}

	.home-hero-title span {
		color: var(--gold, #FF6B35);
		font-style: italic;
	}

	.home-hero-copy {
		margin: 0 0 40px;
		max-width: 420px;
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.7;
		color: var(--text-muted, #6B6B74);
	}

	.home-hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin-bottom: 64px;
	}

	.home-hero-primary,
	.home-hero-secondary {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 14px 28px;
		border-radius: 0;
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		transition: color 180ms ease, background-color 180ms ease, border-color 180ms ease;
	}

	.home-hero-primary {
		background: var(--gold, #FF6B35);
		color: var(--bg-base, #0A0A0B);
	}

	.home-hero-primary:hover {
		background: #FF8555;
	}

	.home-hero-secondary {
		border: 1px solid var(--border-dim, #1F1F23);
		color: var(--text-primary, #E8E6E3);
	}

	.home-hero-secondary:hover {
		border-color: var(--gold, #FF6B35);
		color: var(--gold, #FF6B35);
	}

	.home-hero-icon {
		width: 16px;
		height: 16px;
	}

	.home-hero-stats {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 24px;
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted, #6B6B74);
	}

	.home-hero-stat-group {
		display: flex;
		align-items: baseline;
		gap: 24px;
	}

	.home-hero-stat {
		display: flex;
		align-items: baseline;
		gap: 6px;
	}

	.home-hero-stat span {
		font-size: 14px;
		font-weight: 700;
		color: var(--gold, #FF6B35);
	}

	.home-hero-dot {
		color: var(--border-dim, #1F1F23);
	}

	.home-hero-strip {
		position: relative;
		z-index: 10;
		display: none;
		width: 40px;
		align-items: center;
		justify-content: center;
		border-left: 1px solid #1F1F23;
		border-right: 1px solid var(--border-dim, #1F1F23);
		background: var(--bg-base, #0A0A0B);
	}

	.home-hero-strip-text {
		white-space: nowrap;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--border-dim, #1F1F23);
		opacity: 0.6;
		writing-mode: vertical-rl;
		text-orientation: mixed;
		transform: rotate(180deg);
	}

	.home-hero-right {
		position: relative;
		width: 100%;
		min-height: 500px;
		overflow: hidden;
		background: var(--bg-base, #0A0A0B);
	}

	.home-card-stage {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.home-event-card {
		position: absolute;
		width: 280px;
		padding: 16px;
		border: 1px solid var(--border-dim, #1F1F23);
		border-radius: 0;
		background: var(--bg-surface, #111113);
		pointer-events: auto;
		transition: opacity 180ms ease, border-color 180ms ease;
	}

	.home-event-card:hover {
		z-index: 30;
		opacity: 1 !important;
	}

	.home-event-card.is-front:hover {
		border-color: var(--gold, #FF6B35);
	}

	.home-event-live {
		position: absolute;
		top: 12px;
		right: 12px;
		z-index: 10;
		padding: 4px 8px;
		background: var(--gold, #FF6B35);
		font-family: var(--font-mono);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--bg-base, #0A0A0B);
	}

	.home-event-art {
		position: relative;
		width: 100%;
		height: 160px;
		margin-bottom: 12px;
		overflow: hidden;
		border: 1px solid var(--border-dim, #1F1F23);
		background: var(--bg-surface, #111113);
	}

	.home-event-gradient,
	.home-event-symbol {
		position: absolute;
		inset: 0;
	}

	.home-event-symbol {
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-mono);
		font-size: 48px;
		color: var(--border-dim, #1F1F23);
	}

	.home-event-symbol.is-front {
		font-size: 40px;
	}

	.home-event-date {
		margin-bottom: 4px;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted, #6B6B74);
	}

	.home-event-title {
		margin: 0 0 8px;
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--text-primary, #E8E6E3);
	}

	.home-event-description {
		margin: 0;
		padding-top: 8px;
		border-top: 1px solid var(--border-dim, #1F1F23);
		font-family: var(--font-mono);
		font-size: 12px;
		line-height: 1.4;
		color: var(--text-muted, #6B6B74);
	}

	.home-event-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 12px;
		font-family: var(--font-mono);
		font-size: 10px;
		text-transform: uppercase;
	}

	.home-event-meta span {
		color: var(--gold, #FF6B35);
	}

	.home-event-meta i {
		font-style: normal;
		color: var(--border-dim, #1F1F23);
	}

	.home-event-meta b {
		font-weight: 400;
		color: var(--text-muted, #6B6B74);
	}

	@media (min-width: 1024px) {
		.home-hero-section {
			display: grid;
			grid-template-columns: minmax(0, 55%) 40px minmax(0, 1fr);
		}

		.home-hero-left {
			padding: 96px 40px;
		}

		.home-hero-copy {
			font-size: 17px;
		}

		.home-hero-strip {
			display: flex;
		}

		.home-hero-right {
			min-height: 0;
		}
	}
`;
