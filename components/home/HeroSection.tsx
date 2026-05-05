"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

const ease = [0.16, 1, 0.3, 1];

export function HeroSection() {
	return (
		<section
			className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5"
			style={{ backgroundColor: "var(--bg-base)" }}
		>
			{/* Grid dot pattern */}
			<div
				className="pointer-events-none absolute inset-0 opacity-40"
				style={{
					backgroundImage:
						"radial-gradient(circle, #2A2A2A 1px, transparent 1px)",
					backgroundSize: "32px 32px",
				}}
			/>

			{/* Radial amber glow */}
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse 800px 400px at 50% 40%, rgba(255,181,71,0.06) 0%, transparent 70%)",
				}}
			/>

			{/* Top border line */}
			<div
				className="absolute top-0 left-0 right-0 h-px"
				style={{ backgroundColor: "var(--border)" }}
			/>

			{/* Content */}
			<div className="relative z-10 flex max-w-2xl flex-col items-center text-center">
				{/* Label */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, ease }}
				>
					<span
						className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.1em]"
						style={{ color: "var(--text-muted)" }}
					>
						<span style={{ color: "var(--accent)", fontSize: "8px" }}>
							●
						</span>
						India&apos;s Developer Event Platform
					</span>
				</motion.div>

				{/* Heading */}
				<motion.h1
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease, delay: 0.1 }}
					className="mt-6 font-display text-[40px] leading-[0.95] tracking-tight sm:text-[56px] md:text-[72px]"
					style={{ color: "var(--text-primary)" }}
				>
					Where Developers
					<br />
					Find Their{" "}
					<span style={{ color: "var(--accent)" }}>Next Event</span>
				</motion.h1>

				{/* Subheading */}
				<motion.p
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease, delay: 0.2 }}
					className="mt-5 max-w-[480px] text-[17px]"
					style={{ color: "var(--text-secondary)" }}
				>
					Discover tech meetups, hackathons, and workshops.
					<br />
					Book your spot in seconds.
				</motion.p>

				{/* CTA Buttons */}
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease, delay: 0.3 }}
					className="mt-8 flex items-center gap-3"
				>
					<Link href="/events">
						<Button variant="primary" size="lg">
							Browse Events
						</Button>
					</Link>
					<Link href="/become-organizer">
						<Button variant="secondary" size="lg">
							Host an Event
						</Button>
					</Link>
				</motion.div>

				{/* Social proof */}
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease, delay: 0.4 }}
					className="mt-8 flex items-center gap-3"
				>
					{/* Overlapping avatars */}
					<div className="flex -space-x-2">
						{["A", "R", "S", "P"].map((letter, i) => (
							<div
								key={i}
								className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] text-[10px] font-semibold"
								style={{
									backgroundColor: "var(--bg-overlay)",
									border: "1px solid var(--border)",
									color: "var(--text-muted)",
								}}
							>
								{letter}
							</div>
						))}
					</div>
					<span
						className="text-[13px]"
						style={{ color: "var(--text-muted)" }}
					>
						Join 500+ developers
					</span>
				</motion.div>
			</div>

			{/* Scroll indicator */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.6, delay: 0.6 }}
				className="absolute bottom-8 flex flex-col items-center gap-2"
			>
				<motion.div
					animate={{ y: [0, 6, 0] }}
					transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
				>
					<ChevronDown
						size={16}
						style={{ color: "var(--text-muted)" }}
					/>
				</motion.div>
				<span
					className="text-[11px] uppercase tracking-[0.1em]"
					style={{ color: "var(--text-muted)" }}
				>
					Scroll to explore
				</span>
			</motion.div>
		</section>
	);
}
