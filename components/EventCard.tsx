"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { IconMapPin } from "@tabler/icons-react";
import { Badge } from "./ui/Badge";
import { GlowBorderCard } from "./ui/glow-border-card";

interface EventCardProps {
	title: string;
	image: string;
	slug: string;
	location: string;
	date: string;
	time: string;
	category?: string;
	isPaid?: boolean;
	price?: number;
	currency?: string;
	organizerName?: string;
	index?: number;
	featured?: boolean;
}

function EventCard({
	title,
	image,
	slug,
	location,
	date,
	time,
	category,
	isPaid = false,
	price,
	currency = "INR",
	organizerName,
	index = 0,
	featured = false,
}: EventCardProps) {
	const priceLabel = isPaid
		? `${currency === "INR" ? "₹" : "$"}${price ?? 0}`
		: "Free";

	const cardContent = (
			<Link
				href={`/events/${slug}`}
				className="group block overflow-hidden no-underline rounded-[var(--radius-lg)] h-full flex flex-col"
				style={{
					backgroundColor: "var(--bg-surface)",
					border: featured
						? "1px solid transparent"
						: "1px solid var(--border-dim)",
					background: featured
						? "var(--bg-surface)"
						: "var(--bg-surface)",
					transition: "all 220ms cubic-bezier(0.16, 1, 0.3, 1)",
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.borderColor = featured ? "transparent" : "var(--border-bright)";
					e.currentTarget.style.transform = "translateY(-2px)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.borderColor = featured
						? "transparent"
						: "var(--border-dim)";
					e.currentTarget.style.transform = "translateY(0)";
				}}
			>
				{/* Image */}
				<div
					className="relative overflow-hidden"
					style={{ aspectRatio: "16/9", backgroundColor: "var(--bg-elevated)" }}
				>
					<img
						src={image}
						alt={title}
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
					/>
					{/* Category badge top-left */}
					{category && (
						<div className="absolute left-2 top-2">
							<Badge variant="default">{category}</Badge>
						</div>
					)}
					{/* Price badge top-right */}
					<div className="absolute right-2 top-2">
						<Badge variant={isPaid ? "default" : "gold"}>
							{priceLabel}
						</Badge>
					</div>
				</div>

				{/* Body */}
				<div className="p-4">
					{/* Date row */}
					<div
						className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em]"
						style={{ color: "var(--text-muted)" }}
					>
						<span>{date}</span>
						<span style={{ color: "var(--gold)", opacity: 0.5 }}>·</span>
						<span>{time}</span>
					</div>

					{/* Title */}
					<h3
						className="mt-2 line-clamp-2 text-[17px] font-semibold leading-snug"
						style={{
							fontFamily: "var(--font-display)",
							color: "var(--text-primary)",
							fontWeight: 600,
						}}
					>
						{title}
					</h3>

					{/* Location */}
					<div
						className="mt-2 flex items-center gap-1.5 text-[13px]"
						style={{ color: "var(--text-muted)" }}
					>
						<IconMapPin size={13} stroke={1.5} />
						<span>{location}</span>
					</div>

					{/* Footer */}
					<div
						className="mt-3 flex items-center justify-between pt-3"
						style={{ borderTop: "1px solid var(--border-dim)" }}
					>
						<div className="flex items-center gap-2">
							<div
								className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-[8px] font-mono"
								style={{
									backgroundColor: "var(--gold-subtle)",
									color: "var(--gold)",
									border: "1px solid var(--border-gold)",
								}}
							>
								{(organizerName || "D")[0].toUpperCase()}
							</div>
							<span
								className="text-[12px]"
								style={{ color: "var(--text-secondary)" }}
							>
								{organizerName || "DevEvent"}
							</span>
						</div>
						<span
							className="text-price text-[13px]"
							style={{
								color: isPaid ? "var(--text-primary)" : "var(--gold)",
							}}
						>
							{priceLabel}
						</span>
					</div>
				</div>
			</Link>
		);

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-60px" }}
			transition={{
				duration: 0.5,
				delay: index * 0.07,
				ease: [0.16, 1, 0.3, 1],
			}}
			className="h-full"
		>
			{featured ? (
				<GlowBorderCard
					colorPreset="custom"
					gradientColors={[
						"#C9A84C",
						"#DFC06E",
						"#8A6E2A",
						"#111113",
						"#111113",
						"#111113",
						"#111113",
						"#111113",
						"#8A6E2A",
						"#DFC06E",
					]}
					borderWidth="1.5px"
					borderRadius="var(--radius-lg)"
					className="h-full w-full"
				>
					{cardContent}
				</GlowBorderCard>
			) : (
				cardContent
			)}
		</motion.div>
	);
}

export default EventCard;
export type { EventCardProps };
