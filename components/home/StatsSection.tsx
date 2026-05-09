"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "../ui/animated-number";

const stats = [
	{ value: 2400, label: "Developers", suffix: "+" },
	{ value: 140, label: "Events Hosted", suffix: "+" },
	{ value: 28, label: "Cities", suffix: "" },
	{ value: 100, label: "Free & Open Source", suffix: "%" },
];

export function StatsSection() {
	return (
		<section
			className="relative border-y border-[var(--border-dim)]"
			style={{ backgroundColor: "var(--bg-base)" }}
		>
			<div className="mx-auto max-w-7xl px-5 sm:px-6 h-[72px] sm:h-24 md:h-32">
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.4 }}
					className="flex h-full items-center justify-between"
				>
					{stats.map((stat, i) => (
						<motion.div
							key={stat.label}
							initial={{ opacity: 0, y: 16 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{
								duration: 0.5,
								delay: i * 0.1,
								ease: [0.16, 1, 0.3, 1],
							}}
							className={`flex h-full flex-col justify-center px-2 sm:px-4 md:px-8 text-center flex-1 ${
								i !== stats.length - 1 ? "border-r border-[var(--border-dim)]" : ""
							}`}
						>
							<div
								className="flex items-center justify-center font-mono text-[20px] sm:text-[28px] md:text-[36px] font-medium leading-none"
								style={{ color: "var(--text-primary)" }}
							>
								<AnimatedNumber
									value={stat.value}
									className="tabular-nums font-mono"
								/>
								<span style={{ color: "var(--gold)", marginLeft: "1px" }}>
									{stat.suffix}
								</span>
							</div>
							<p
								className="mt-1 sm:mt-2 text-[9px] sm:text-[11px] md:text-[13px] font-medium uppercase tracking-[0.08em] leading-tight"
								style={{ color: "var(--text-muted)" }}
							>
								{stat.label}
							</p>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
