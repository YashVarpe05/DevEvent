"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { IconArrowRight, IconSparkles } from "@tabler/icons-react";
import { Button } from "../ui/Button";
import { FlipFadeText } from "../ui/flip-fade-text";

const fadeUp = {
	initial: { opacity: 0, y: 24 },
	animate: { opacity: 1, y: 0 },
};

export function HeroSection() {
	const sectionRef = useRef(null);
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start start", "end start"],
	});

	const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

	return (
		<section
			ref={sectionRef}
			className="relative flex min-h-[85vh] items-center justify-center overflow-hidden"
			style={{ backgroundColor: "var(--bg-void)" }}
		>
			{/* Grid lines BG */}
			<motion.div
				style={{ y: bgY }}
				className="pointer-events-none absolute inset-0"
			>
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `
							linear-gradient(to right, var(--border-dim) 1px, transparent 1px),
							linear-gradient(to bottom, var(--border-dim) 1px, transparent 1px)
						`,
						backgroundSize: "80px 80px",
						opacity: 0.3,
					}}
				/>
				{/* Gold radial glow top center */}
				<div
					className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px]"
					style={{
						background:
							"radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)",
					}}
				/>
			</motion.div>

			{/* Content */}
			<div className="relative z-10 mx-auto max-w-4xl px-5 text-center">
				{/* Eyebrow */}
				<motion.div
					variants={fadeUp}
					initial="initial"
					animate="animate"
					transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
					className="mx-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
					style={{
						border: "1px solid var(--border-gold)",
						backgroundColor: "var(--gold-subtle)",
						marginBottom: "20px"
					}}
				>
					<IconSparkles size={12} style={{ color: "var(--gold)" }} />
					<span
						className="text-[11px] font-medium uppercase tracking-[0.1em]"
						style={{ color: "var(--gold)" }}
					>
						India&#39;s Developer Event Platform
					</span>
				</motion.div>

				{/* Headline */}
				<motion.h1
					variants={fadeUp}
					initial="initial"
					animate="animate"
					transition={{
						duration: 0.6,
						delay: 0.1,
						ease: [0.16, 1, 0.3, 1],
					}}
					className="text-display-xl"
					style={{ color: "var(--text-primary)", marginBottom: "16px" }}
				>
					Where Builders
					<br />
					<em
						style={{
							fontStyle: "italic",
							color: "var(--gold)",
						}}
					>
						Come Together
					</em>
				</motion.h1>

				{/* Subhead */}
				<motion.p
					variants={fadeUp}
					initial="initial"
					animate="animate"
					transition={{
						duration: 0.5,
						delay: 0.2,
						ease: [0.16, 1, 0.3, 1],
					}}
					className="mx-auto max-w-xl text-[17px] leading-[1.6]"
					style={{ color: "var(--text-secondary)", marginBottom: "20px" }}
				>
					Discover hackathons, meetups, and tech workshops handpicked for
					developers who ship. Book your spot in seconds.
				</motion.p>

				{/* Rotating words */}
				<motion.div
					variants={fadeUp}
					initial="initial"
					animate="animate"
					transition={{
						duration: 0.5,
						delay: 0.25,
						ease: [0.16, 1, 0.3, 1],
					}}
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "10px",
						marginTop: "8px",
						marginBottom: "28px"
					}}
				>
					{/* "Trending:" label */}
					<span style={{
						fontFamily: "var(--font-body)",
						fontSize: "11px",
						fontWeight: 500,
						letterSpacing: "0.12em",
						textTransform: "uppercase",
						color: "var(--text-muted)",
						whiteSpace: "nowrap",
					}}>
						Trending:
					</span>

					{/* Separator dot */}
					<span style={{ 
						color: "var(--gold)", 
						opacity: 0.5, 
						fontSize: "8px" 
					}}>●</span>

					{/* FlipFadeText — properly constrained */}
					<div style={{
						overflow: "hidden",
						height: "20px",
						display: "flex",
						alignItems: "center",
					}}>
						<FlipFadeText
							words={[
								"Hackathons",
								"Meetups",
								"Workshops",
								"Open Source Days",
								"Conferences",
							]}
							interval={2200}
							letterDuration={0.25}
							staggerDelay={0.03}
							exitStaggerDelay={0.02}
							className="min-h-0 h-auto flex items-center justify-start p-0 m-0"
							textClassName="!text-[14px] !font-normal !normal-case !tracking-normal text-[#EDEAE1] gap-[0.05em] font-body"
						/>
					</div>
				</motion.div>

				{/* CTAs */}
				<motion.div
					variants={fadeUp}
					initial="initial"
					animate="animate"
					transition={{
						duration: 0.5,
						delay: 0.35,
						ease: [0.16, 1, 0.3, 1],
					}}
					className="flex flex-wrap items-center justify-center gap-3"
					style={{ marginBottom: "20px" }}
				>
					<Link href="/events">
						<Button variant="primary" size="lg" className="glow-gold-sm">
							Explore Events
							<IconArrowRight size={16} stroke={2} />
						</Button>
					</Link>
					<Link href="/become-organizer">
						<Button variant="secondary" size="lg">
							List Your Event
						</Button>
					</Link>
				</motion.div>
			</div>

			{/* Bottom fade */}
			<div
				className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
				style={{
					background:
						"linear-gradient(to top, var(--bg-base), transparent)",
				}}
			/>
		</section>
	);
}
