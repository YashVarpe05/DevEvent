"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import CountUp from "../components/CountUp";

const stats = [
	{ number: 2400, suffix: "+", label: "DEVELOPERS" },
	{ number: 140, suffix: "+", label: "EVENTS HOSTED" },
	{ number: 28, suffix: "", label: "CITIES" },
	{ number: 100, suffix: "%", label: "OPEN SOURCE" },
] as const;

export default function StatsBar() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<section ref={ref} className="stats-bar" aria-label="DevEvent platform stats">
			<style>{statsBarStyles}</style>
			<div className="stats-bar__inner">
				<div className="stats-bar__grid">
					{stats.map((stat, index) => (
						<motion.div
							key={stat.label}
							initial={{ opacity: 0, y: 20 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							className="stats-bar__item"
						>
							<div className="stats-bar__number">
								<CountUp
									target={stat.number}
									suffix={stat.suffix}
									duration={1.5}
									start={isInView}
								/>
							</div>
							<div className="stats-bar__label">{stat.label}</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

const statsBarStyles = `
	.stats-bar {
		width: 100%;
		background: var(--bg-surface, #111113);
		border-bottom: 1px solid var(--border-dim, #1F1F23);
	}

	.stats-bar__inner {
		width: min(100%, 1440px);
		margin: 0 auto;
		padding: 48px 24px;
	}

	.stats-bar__grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 32px 0;
	}

	.stats-bar__item {
		display: flex;
		min-height: 86px;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.stats-bar__number {
		margin-bottom: 8px;
		color: var(--gold, #FF6B35);
		font-family: var(--font-mono);
		font-size: 32px;
		font-weight: 700;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}

	.stats-bar__label {
		color: var(--text-muted, #6B6B74);
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.15em;
		line-height: 1.2;
		text-transform: uppercase;
	}

	@media (min-width: 768px) {
		.stats-bar__grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
			gap: 0;
		}

		.stats-bar__item:not(:last-child) {
			border-right: 1px solid var(--border-dim, #1F1F23);
		}

		.stats-bar__number {
			font-size: 40px;
		}
	}

	@media (min-width: 1024px) {
		.stats-bar__inner {
			padding-inline: 40px;
		}
	}
`;

