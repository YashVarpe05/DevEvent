"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "../ui/animated-number";
import { TestimonialsCard } from "../ui/testimonials-card";

const stats = [
	{ value: 1, label: "Ticket Sales", prefix: "$", suffix: "M+" },
	{ value: 50, label: "Check-ins", prefix: "", suffix: "k+" },
	{ value: 4.9, label: "Rating", prefix: "", suffix: "/5" },
];

const testimonial = {
	id: 1,
	title: "A game changer",
	description: "\"The most beautiful event platform I've ever used. My attendees loved the seamless checkout.\" — Alex Dev, Creator, DevTools Meetup",
	image: "https://i.pravatar.cc/150?u=dev",
};

export function SocialProofSection() {
	return (
		<section
			className="relative py-24 overflow-hidden"
			style={{ backgroundColor: "var(--bg-base)" }}
		>
			<div className="mx-auto max-w-6xl px-5">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
					{/* Left: Stats */}
					<div className="flex flex-col gap-12">
						{stats.map((stat, i) => (
							<motion.div
								key={stat.label}
								initial={{ opacity: 0, x: -24 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
							>
								<div className="flex items-center gap-1 font-mono text-[48px] md:text-[64px] font-medium leading-none" style={{ color: "var(--text-primary)" }}>
									<span style={{ color: "var(--gold)" }}>{stat.prefix}</span>
									<AnimatedNumber value={stat.value} className="tabular-nums" />
									<span style={{ color: "var(--gold)" }}>{stat.suffix}</span>
								</div>
								<p className="mt-2 text-[16px] font-medium uppercase tracking-[0.08em]" style={{ color: "var(--text-muted)" }}>
									{stat.label}
								</p>
							</motion.div>
						))}
					</div>

					{/* Right: Testimonial */}
					<motion.div
						initial={{ opacity: 0, x: 24 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
						className="relative"
					>
						{/* Subtle background glow */}
						<div className="absolute -inset-4 bg-[var(--gold)] opacity-[0.03] blur-2xl rounded-full" />
						<TestimonialsCard items={[testimonial]} />
					</motion.div>
				</div>
			</div>
		</section>
	);
}
