"use client";

import { motion } from "framer-motion";
import ExpandableBentoGrid from "../ui/expandable-bento-grid";
import { 
	IconCode, 
	IconCurrencyRupee, 
	IconQrcode, 
	IconUsers, 
	IconShieldCheck, 
	IconBolt 
} from "@tabler/icons-react";

const bentoItems = [
	{
		id: 1,
		title: "Discover Local Tech Events",
		description: "Find meetups, hackathons, and workshops near you tailored for developers.",
		content: (
			<div className="flex h-full w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-elevated)] p-4 group-hover:bg-[var(--gold-subtle)] transition-colors duration-300">
				<IconCode size={48} stroke={1} style={{ color: "var(--gold)" }} />
			</div>
		),
		icon: <IconCode className="h-4 w-4 text-[var(--gold)]" />,
		className: "md:col-span-2",
	},
	{
		id: 2,
		title: "Seamless Ticketing",
		description: "Book spots instantly and manage all your event tickets in one dashboard.",
		content: (
			<div className="flex h-full w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-elevated)] p-4 group-hover:bg-[var(--gold-subtle)] transition-colors duration-300">
				<IconCurrencyRupee size={48} stroke={1} style={{ color: "var(--gold)" }} />
			</div>
		),
		icon: <IconCurrencyRupee className="h-4 w-4 text-[var(--gold)]" />,
		className: "md:col-span-1",
	},
	{
		id: 3,
		title: "Lightning Fast",
		description: "Built on Next.js 15 for incredible performance.",
		content: (
			<div className="flex h-full w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-elevated)] p-4 group-hover:bg-[var(--gold-subtle)] transition-colors duration-300">
				<IconBolt size={48} stroke={1} style={{ color: "var(--gold)" }} />
			</div>
		),
		icon: <IconBolt className="h-4 w-4 text-[var(--gold)]" />,
		className: "md:col-span-1",
	},
	{
		id: 4,
		title: "Check in with QR",
		description: "Organizers can instantly verify tickets using built-in QR scanning.",
		content: (
			<div className="flex h-full w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-elevated)] p-4 group-hover:bg-[var(--gold-subtle)] transition-colors duration-300">
				<IconQrcode size={48} stroke={1} style={{ color: "var(--gold)" }} />
			</div>
		),
		icon: <IconQrcode className="h-4 w-4 text-[var(--gold)]" />,
		className: "md:col-span-2",
	},
	{
		id: 5,
		title: "Connect with Builders",
		description: "Network with like-minded developers, founders, and tech enthusiasts.",
		content: (
			<div className="flex h-full w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-elevated)] p-4 group-hover:bg-[var(--gold-subtle)] transition-colors duration-300">
				<IconUsers size={48} stroke={1} style={{ color: "var(--gold)" }} />
			</div>
		),
		icon: <IconUsers className="h-4 w-4 text-[var(--gold)]" />,
		className: "md:col-span-2",
	},
	{
		id: 6,
		title: "Admin Dashboard",
		description: "Powerful tools for organizers to manage attendees and sales.",
		content: (
			<div className="flex h-full w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-elevated)] p-4 group-hover:bg-[var(--gold-subtle)] transition-colors duration-300">
				<IconShieldCheck size={48} stroke={1} style={{ color: "var(--gold)" }} />
			</div>
		),
		icon: <IconShieldCheck className="h-4 w-4 text-[var(--gold)]" />,
		className: "md:col-span-1",
	},
];

export function BentoSection() {
	return (
		<section
			className="relative py-24"
			style={{ backgroundColor: "var(--bg-base)", borderTop: "1px solid var(--border-dim)" }}
		>
			<div className="mx-auto max-w-6xl px-5">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
					className="mb-16 text-center"
				>
					<h2 className="text-display-lg" style={{ color: "var(--text-primary)" }}>
						Built for Builders
					</h2>
					<p
						className="mx-auto mt-4 max-w-2xl text-[17px]"
						style={{ color: "var(--text-secondary)" }}
					>
						We built the platform we always wanted. No fluff, just tools that work.
					</p>
				</motion.div>

				<ExpandableBentoGrid items={bentoItems} />
			</div>
		</section>
	);
}
