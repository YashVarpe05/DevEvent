"use client";

import { useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { Globe, Lock, QrCode, Star, Users, Zap } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import ScrollReveal from "../components/ScrollReveal";

const heatmapData = [
	[1, 0, 2, 0, 4, 0, 1, 3, 0, 2, 0, 1, 4, 0, 0, 2],
	[0, 3, 0, 1, 0, 2, 4, 0, 1, 0, 3, 0, 2, 0, 1, 0],
	[2, 0, 4, 1, 0, 3, 0, 1, 0, 4, 0, 2, 0, 3, 0, 1],
] as const;

const featureCards = [
	{
		description: "End-to-end encryption and compliance ready.",
		delay: 0.1,
		Icon: Lock,
		title: "Secure",
		watermark: false,
	},
	{
		description: "Optimized edge routing globally.",
		delay: 0.15,
		Icon: Zap,
		title: "Lightning Fast",
		watermark: true,
	},
	{
		description: "Direct integrations for instant settlement.",
		delay: 0.2,
		Icon: QrCode,
		title: "UPI Native",
		watermark: false,
	},
	{
		description: "Built alongside thousands of organizers.",
		delay: 0.25,
		Icon: Users,
		title: "Community First",
		watermark: false,
	},
	{
		description: "Active deployment zones across India.",
		delay: 0.3,
		Icon: Globe,
		title: "28 Cities",
		watermark: false,
	},
] as const;

export default function FeaturesBento() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const reduceMotion = useReducedMotion();
	const initial = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 };
	const animate = isInView ? { opacity: 1, y: 0 } : {};

	return (
		<section className="features-bento">
			<style>{featuresBentoStyles}</style>
			<div className="features-bento__inner">
				<ScrollReveal>
					<div className="features-bento__header">
						<div className="features-bento__label">{"// WHY DEVEVENT"}</div>
						<h2 className="features-bento__headline">
							Built for <span>Builders</span>
						</h2>
					</div>
				</ScrollReveal>

				<div ref={ref} className="features-bento__grid">
					<motion.div
						initial={initial}
						animate={animate}
						transition={{ duration: 0.6, delay: 0 }}
						className="features-bento-card features-bento-card--open-source"
					>
						<div className="features-bento-card__top">
							<div>
								<h3 className="features-bento-card__title features-bento-card__title--large">
									100% Open Source
								</h3>
								<p className="features-bento-card__copy features-bento-card__copy--wide">
									Inspect the code, self-host the infrastructure, or contribute
									to the core. Total transparency.
								</p>
							</div>
							<div
								className="features-bento-card__stars"
								aria-label="12.4k GitHub stars"
							>
								<Star aria-hidden="true" size={16} />
								<span>12.4k</span>
							</div>
						</div>

						<div className="features-bento-card__heatmap" aria-hidden="true">
							{heatmapData.map((row, rowIndex) =>
								row.map((cell, columnIndex) => (
									<div
										key={`${rowIndex}-${columnIndex}`}
										className={`heatmap-cell active-${cell}`}
									/>
								)),
							)}
						</div>
					</motion.div>

					{featureCards.map((card) => (
						<FeatureCard
							key={card.title}
							animate={animate}
							description={card.description}
							delay={card.delay}
							Icon={card.Icon}
							initial={initial}
							title={card.title}
							watermark={card.watermark}
						/>
					))}
				</div>
			</div>
		</section>
	);
}

function FeatureCard({
	animate,
	description,
	delay,
	Icon,
	initial,
	title,
	watermark,
}: {
	animate: { opacity?: number; y?: number };
	description: string;
	delay: number;
	Icon: LucideIcon;
	initial: { opacity: number; y: number };
	title: string;
	watermark?: boolean;
}) {
	return (
		<motion.div
			initial={initial}
			animate={animate}
			transition={{ duration: 0.6, delay }}
			className="features-bento-card features-bento-card--small"
			data-watermark={watermark ? "true" : "false"}
		>
			<div className="features-bento-card__content">
				<Icon
					aria-hidden="true"
					className="features-bento-card__icon"
					size={32}
				/>
				<h3 className="features-bento-card__title">{title}</h3>
				<p className="features-bento-card__copy">{description}</p>
			</div>
			{watermark ? (
				<div className="features-bento-card__watermark" aria-hidden="true">
					99<span>ms</span>
				</div>
			) : null}
		</motion.div>
	);
}

const featuresBentoStyles = `
	.features-bento {
		width: 100%;
		padding: 96px 0;
		background: #0A0A0B;
		border-bottom: 1px solid #1F1F23;
	}

	.features-bento__inner {
		width: 100%;
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 24px;
		box-sizing: border-box;
	}

	.features-bento__header {
		margin-bottom: 48px;
		padding-left: 16px;
		border-left: 4px solid #FF6B35;
	}

	.features-bento__label {
		margin-bottom: 8px;
		color: #FF6B35;
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.1em;
		line-height: 1.2;
		text-transform: uppercase;
	}

	.features-bento__headline {
		margin: 0;
		color: #E8E6E3;
		font-family: var(--font-display);
		font-size: clamp(40px, 5vw, 56px);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 0.9;
	}

	.features-bento__headline span {
		color: #FF6B35;
		font-style: italic;
	}

	.features-bento__grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}

	.features-bento-card {
		position: relative;
		display: flex;
		min-height: 220px;
		overflow: hidden;
		flex-direction: column;
		justify-content: space-between;
		border: 1px solid #1F1F23;
		border-radius: 0;
		background: #111113;
		padding: 24px;
		transition: border-color 180ms ease;
	}

	.features-bento-card:hover {
		border-color: #FF6B35;
	}

	.features-bento-card:hover .features-bento-card__icon {
		color: #FF6B35;
	}

	.features-bento-card__top {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 24px;
	}

	.features-bento-card__title {
		margin: 0 0 8px;
		color: #E8E6E3;
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 700;
		letter-spacing: 0;
		line-height: 1.1;
	}

	.features-bento-card__title--large {
		font-size: clamp(28px, 3vw, 36px);
	}

	.features-bento-card__copy {
		margin: 0;
		color: #6B6B74;
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.02em;
		line-height: 1.55;
		text-transform: uppercase;
	}

	.features-bento-card__copy--wide {
		max-width: 500px;
		font-family: var(--font-body);
		font-size: 16px;
		letter-spacing: 0;
		line-height: 1.6;
		text-transform: none;
	}

	.features-bento-card__stars {
		display: inline-flex;
		flex: 0 0 auto;
		align-items: center;
		gap: 8px;
		border: 1px solid #1F1F23;
		background: #0A0A0B;
		color: #E8E6E3;
		font-family: var(--font-mono);
		font-size: 12px;
		line-height: 1;
		padding: 8px 12px;
	}

	.features-bento-card__stars svg {
		color: #FF6B35;
		fill: #FF6B35;
	}

	.features-bento-card__heatmap {
		display: grid;
		grid-template-columns: repeat(16, 10px);
		gap: 4px;
		margin-top: auto;
		padding-top: 32px;
		opacity: 0.62;
	}

	.features-bento-card__content {
		position: relative;
		z-index: 1;
	}

	.features-bento-card__icon {
		display: block;
		margin-bottom: 16px;
		color: #1F1F23;
		transition: color 180ms ease;
	}

	.features-bento-card__watermark {
		position: absolute;
		right: 8px;
		bottom: -10px;
		z-index: 0;
		color: #111113;
		font-family: var(--font-display);
		font-size: 100px;
		font-weight: 700;
		line-height: 0.8;
		pointer-events: none;
		user-select: none;
		transition: color 180ms ease;
	}

	.features-bento-card:hover .features-bento-card__watermark {
		color: #1A1B22;
	}

	.features-bento-card__watermark span {
		font-size: 50px;
	}

	@media (min-width: 768px) {
		.features-bento__grid {
			grid-template-columns: repeat(12, minmax(0, 1fr));
			grid-auto-rows: 220px;
		}

		.features-bento-card {
			min-height: 0;
		}

		.features-bento-card--open-source {
			grid-column: span 8;
			grid-row: span 2;
		}

		.features-bento-card--small {
			grid-column: span 4;
		}
	}

	@media (min-width: 1024px) {
		.features-bento__inner {
			padding-inline: 40px;
		}
	}

	@media (max-width: 640px) {
		.features-bento {
			padding: 72px 0;
		}

		.features-bento-card__top {
			flex-direction: column;
		}

		.features-bento-card__heatmap {
			grid-template-columns: repeat(12, 10px);
		}
	}
`;
