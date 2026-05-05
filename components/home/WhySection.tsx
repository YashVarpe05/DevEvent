"use client";

import { motion } from "framer-motion";
import { Code2, IndianRupee, Ticket } from "lucide-react";

const features = [
	{
		icon: Code2,
		title: "Open Source Forever",
		body: "Self-host it. Fork it. Contribute to it. No lock-in, ever.",
	},
	{
		icon: IndianRupee,
		title: "Made for Indian Devs",
		body: "UPI, Razorpay, and Stripe — pay the way you already do.",
	},
	{
		icon: Ticket,
		title: "Instant Tickets",
		body: "QR-coded tickets generated in seconds. No printing, no hassle.",
	},
];

export function WhySection() {
	return (
		<section
			className="w-full py-20"
			style={{
				backgroundColor: "var(--bg-elevated)",
				borderTop: "1px solid var(--border)",
				borderBottom: "1px solid var(--border)",
			}}
		>
			<div className="mx-auto max-w-6xl px-5 sm:px-8">
				<div className="mb-12">
					<span
						className="text-[11px] font-medium uppercase tracking-[0.1em]"
						style={{ color: "var(--text-muted)" }}
					>
						WHY DEVEVENT
					</span>
					<h2
						className="mt-2 font-display text-3xl tracking-tight"
						style={{ color: "var(--text-primary)" }}
					>
						Built Different
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-12 md:grid-cols-3">
					{features.map((feature, i) => (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, y: 16 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{
								duration: 0.5,
								ease: [0.16, 1, 0.3, 1],
								delay: i * 0.1,
							}}
							className="flex flex-col gap-4"
						>
							{/* Icon */}
							<div
								className="flex h-10 w-10 items-center justify-center"
								style={{
									backgroundColor: "var(--accent-subtle)",
									borderRadius: "var(--radius-md)",
								}}
							>
								<feature.icon
									size={20}
									style={{ color: "var(--accent)" }}
								/>
							</div>

							{/* Title */}
							<h3
								className="text-[17px] font-semibold"
								style={{ color: "var(--text-primary)" }}
							>
								{feature.title}
							</h3>

							{/* Body */}
							<p
								className="text-[14px] leading-relaxed"
								style={{ color: "var(--text-secondary)" }}
							>
								{feature.body}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
