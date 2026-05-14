"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import CountUp from "../components/CountUp";
import ScrollReveal from "../components/ScrollReveal";

const stats = [
	{ number: 2400, suffix: "+", label: "Developers joined last year" },
	{ number: 140, suffix: "+", label: "Events successfully hosted" },
	{ number: 28, suffix: "", label: "Cities across India" },
] as const;

const testimonials = [
	{
		author: "Alex Dev",
		quote:
			"The most beautiful event platform I've ever used. My attendees loved the seamless checkout.",
		role: "Creator, DevTools Meetup",
	},
	{
		author: "Priya Sharma",
		quote:
			"We switched from Luma to DevEvent and saw 3x more ticket sales in the first month. The UPI integration is a game changer.",
		role: "Organizer, React Mumbai",
	},
] as const;

export default function SocialProof() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const reduceMotion = useReducedMotion();
	const statInitial = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 };
	const testimonialInitial = reduceMotion
		? { opacity: 1, y: 0 }
		: { opacity: 0, y: 20 };

	return (
		<section className="social-proof">
			<style>{socialProofStyles}</style>
			<div className="social-proof__inner">
				<div ref={ref} className="social-proof__grid">
					<div className="social-proof__stats">
						{stats.map((stat, index) => (
							<motion.div
								key={stat.label}
								initial={statInitial}
								animate={isInView ? { opacity: 1, y: 0 } : {}}
								transition={{ duration: 0.6, delay: index * 0.15 }}
								className="social-proof__stat"
							>
								<div className="social-proof__stat-number">
									<CountUp
										target={stat.number}
										suffix={stat.suffix}
										duration={2}
										start={isInView}
									/>
								</div>
								<div className="social-proof__stat-label">{stat.label}</div>
							</motion.div>
						))}
					</div>

					<div className="social-proof__content">
						<ScrollReveal>
							<h2 className="social-proof__headline">
								Engineered for the builders who build the future.
							</h2>
							<p className="social-proof__copy">
								The most demanding tech communities rely on our infrastructure to
								run everything from local hackathons to global summits.
							</p>
						</ScrollReveal>

						<div className="social-proof__testimonials">
							{testimonials.map((testimonial, index) => (
								<motion.article
									key={testimonial.author}
									initial={testimonialInitial}
									animate={isInView ? { opacity: 1, y: 0 } : {}}
									transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
									className="social-proof__testimonial"
								>
									<span className="social-proof__quote-mark" aria-hidden="true">
										&ldquo;
									</span>
									<p className="social-proof__quote">{testimonial.quote}</p>
									<div className="social-proof__author-row">
										<div className="social-proof__avatar" aria-hidden="true" />
										<div>
											<h3 className="social-proof__author">
												{testimonial.author}
											</h3>
											<p className="social-proof__role">{testimonial.role}</p>
										</div>
									</div>
								</motion.article>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

const socialProofStyles = `
	.social-proof {
		width: 100%;
		padding: 96px 0;
		background: #111113;
		border-bottom: 1px solid #1F1F23;
	}

	.social-proof__inner {
		width: 100%;
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 24px;
		box-sizing: border-box;
	}

	.social-proof__grid {
		display: grid;
		grid-template-columns: 1fr;
		align-items: start;
		gap: 48px;
	}

	.social-proof__stats {
		display: flex;
		flex-direction: column;
		gap: 64px;
	}

	.social-proof__stat {
		padding-top: 24px;
		border-top: 2px solid #FF6B35;
	}

	.social-proof__stat-number {
		margin-bottom: 12px;
		color: #FF6B35;
		font-family: var(--font-mono);
		font-size: clamp(48px, 5vw, 64px);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0;
		line-height: 1;
	}

	.social-proof__stat-label {
		color: #6B6B74;
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.55;
	}

	.social-proof__content {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.social-proof__headline {
		max-width: 760px;
		margin: 0;
		color: #E8E6E3;
		font-family: var(--font-display);
		font-size: clamp(32px, 4vw, 48px);
		font-weight: 700;
		letter-spacing: 0;
		line-height: 1.05;
	}

	.social-proof__copy {
		max-width: 720px;
		margin: 16px 0 0;
		color: #6B6B74;
		font-family: var(--font-body);
		font-size: 18px;
		line-height: 1.65;
	}

	.social-proof__testimonials {
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
		margin-top: 32px;
	}

	.social-proof__testimonial {
		position: relative;
		display: flex;
		min-height: 280px;
		overflow: hidden;
		flex-direction: column;
		justify-content: space-between;
		border: 1px solid #1F1F23;
		border-radius: 0;
		background: #111113;
		padding: 32px;
		transition: border-color 180ms ease;
	}

	.social-proof__testimonial:hover {
		border-color: #FF6B35;
	}

	.social-proof__quote-mark {
		position: absolute;
		top: -20px;
		left: -10px;
		color: #FF6B35;
		font-family: var(--font-display);
		font-size: 160px;
		line-height: 1;
		opacity: 0.06;
		pointer-events: none;
		user-select: none;
	}

	.social-proof__quote {
		position: relative;
		z-index: 1;
		margin: 0 0 32px;
		color: #E8E6E3;
		font-family: var(--font-display);
		font-size: clamp(18px, 2vw, 22px);
		font-style: italic;
		line-height: 1.55;
	}

	.social-proof__author-row {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: 16px;
		margin-top: auto;
	}

	.social-proof__avatar {
		width: 40px;
		height: 40px;
		flex: 0 0 40px;
		border: 1px solid #1F1F23;
		background: #111113;
	}

	.social-proof__author {
		margin: 0 0 4px;
		color: #E8E6E3;
		font-family: var(--font-mono);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.2;
	}

	.social-proof__role {
		margin: 0;
		color: #6B6B74;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.08em;
		line-height: 1.35;
		text-transform: uppercase;
	}

	@media (min-width: 768px) {
		.social-proof__testimonials {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 1024px) {
		.social-proof__inner {
			padding-inline: 40px;
		}

		.social-proof__grid {
			grid-template-columns: 5fr 7fr;
			gap: 96px;
		}
	}

	@media (max-width: 640px) {
		.social-proof {
			padding: 72px 0;
		}

		.social-proof__stats {
			gap: 40px;
		}

		.social-proof__testimonial {
			min-height: 240px;
			padding: 28px 24px;
		}
	}
`;
