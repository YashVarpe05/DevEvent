"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import MagneticButton from "../components/MagneticButton";

export default function CTABottom() {
	const ref = useRef<HTMLElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const reduceMotion = useReducedMotion();
	const initial = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 };

	return (
		<section ref={ref} className="cta-bottom">
			<style>{ctaBottomStyles}</style>
			<motion.div
				aria-hidden="true"
				initial={reduceMotion ? { opacity: 0.12, scale: 1 } : { opacity: 0, scale: 0.8 }}
				animate={isInView ? { opacity: 1, scale: 1 } : {}}
				transition={{ duration: 1 }}
				className="cta-bottom__glow"
			/>

			<div className="cta-bottom__content">
				<motion.div
					initial={initial}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6 }}
					className="cta-bottom__label"
				>
					{"// READY TO BUILD?"}
				</motion.div>

				<motion.h2
					initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6, delay: 0.1 }}
					className="cta-bottom__headline"
				>
					Host Your <span>Next Big Event</span>
				</motion.h2>

				<motion.p
					initial={initial}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="cta-bottom__subtext"
				>
					Free to use. No credit card required.
				</motion.p>

				<motion.div
					initial={initial}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="cta-bottom__actions"
				>
					<MagneticButton strength={15}>
						<Link href="/become-organizer" className="cta-bottom__button cta-bottom__button--primary">
							List an Event
							<ArrowRight aria-hidden="true" size={16} />
						</Link>
					</MagneticButton>

					<MagneticButton strength={10}>
						<Link href="/events" className="cta-bottom__button cta-bottom__button--secondary">
							Browse Events
						</Link>
					</MagneticButton>
				</motion.div>
			</div>
		</section>
	);
}

const ctaBottomStyles = `
	.cta-bottom {
		position: relative;
		display: flex;
		width: 100%;
		overflow: hidden;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 128px 24px;
		background: var(--bg-base, #0A0A0B);
		border-top: 1px solid var(--border-dim, #1F1F23);
		text-align: center;
	}

	.cta-bottom__glow {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 400px;
		height: 400px;
		border-radius: 999px;
		background: radial-gradient(circle, rgba(255, 107, 53, 0.18) 0%, rgba(255, 107, 53, 0.1) 38%, rgba(255, 107, 53, 0) 70%);
		filter: blur(100px);
		pointer-events: none;
		transform: translate(-50%, -50%);
		animation: cta-glow-pulse 4s ease-in-out infinite;
	}

	.cta-bottom__content {
		position: relative;
		z-index: 1;
		display: flex;
		width: 100%;
		max-width: 768px;
		flex-direction: column;
		align-items: center;
		margin: 0 auto;
	}

	.cta-bottom__label {
		margin-bottom: 32px;
		color: var(--gold, #FF6B35);
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 0.15em;
		line-height: 1.2;
		text-transform: uppercase;
	}

	.cta-bottom__headline {
		margin: 0 0 24px;
		color: var(--text-primary, #E8E6E3);
		font-family: var(--font-display);
		font-size: clamp(40px, 6vw, 64px);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 0.9;
	}

	.cta-bottom__headline span {
		color: var(--gold, #FF6B35);
		font-style: italic;
	}

	.cta-bottom__subtext {
		margin: 0 0 40px;
		color: var(--text-muted, #6B6B74);
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.1em;
		line-height: 1.5;
		text-transform: uppercase;
	}

	.cta-bottom__actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.cta-bottom__button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-height: 48px;
		border-radius: 0;
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.12em;
		line-height: 1;
		padding: 16px 32px;
		text-decoration: none;
		text-transform: uppercase;
		transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease;
	}

	.cta-bottom__button--primary {
		background: var(--gold, #FF6B35);
		color: var(--bg-base, #0A0A0B);
	}

	.cta-bottom__button--primary:hover {
		background: var(--gold-hover, #FF8555);
	}

	.cta-bottom__button--secondary {
		border: 1px solid var(--border-dim, #1F1F23);
		color: var(--text-primary, #E8E6E3);
	}

	.cta-bottom__button--secondary:hover {
		border-color: var(--gold, #FF6B35);
		color: var(--gold, #FF6B35);
	}

	@keyframes cta-glow-pulse {
		0%,
		100% {
			opacity: 0.08;
		}

		50% {
			opacity: 0.16;
		}
	}

	@media (min-width: 640px) {
		.cta-bottom__actions {
			flex-direction: row;
		}
	}

	@media (min-width: 768px) {
		.cta-bottom {
			padding-block: 160px;
		}

		.cta-bottom__glow {
			width: 600px;
			height: 600px;
		}
	}

	@media (min-width: 1024px) {
		.cta-bottom {
			padding-inline: 40px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cta-bottom__glow {
			animation: none;
		}
	}
`;
