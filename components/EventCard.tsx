"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Badge } from "./ui/Badge";

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
}: EventCardProps) {
	const priceLabel = isPaid
		? `${currency === "INR" ? "₹" : "$"}${price ?? 0}`
		: "Free";

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-40px" }}
			transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
		>
			<Link
				href={`/events/${slug}`}
				className="group block overflow-hidden no-underline rounded-[var(--radius-lg)]"
				style={{
					backgroundColor: "var(--bg-elevated)",
					border: "1px solid var(--border)",
					transition: "border-color 200ms ease, transform 200ms cubic-bezier(0.16,1,0.3,1)",
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.borderColor = "var(--border-strong)";
					e.currentTarget.style.transform = "translateY(-2px)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.borderColor = "var(--border)";
					e.currentTarget.style.transform = "translateY(0)";
				}}
			>
				{/* Image */}
				<div className="relative aspect-video overflow-hidden">
					<img
						src={image}
						alt={title}
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
					/>
					{/* Category badge top-left */}
					{category && (
						<div className="absolute left-3 top-3">
							<Badge variant="default">{category}</Badge>
						</div>
					)}
					{/* Price badge top-right */}
					<div className="absolute right-3 top-3">
						<Badge variant={isPaid ? "default" : "accent"}>
							{priceLabel}
						</Badge>
					</div>
				</div>

				{/* Body */}
				<div className="flex flex-col gap-2.5 p-4">
					{/* Date row */}
					<div className="flex items-center gap-4">
						<span
							className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wide"
							style={{ color: "var(--text-muted)" }}
						>
							<Calendar size={12} />
							{date}
						</span>
						<span
							className="flex items-center gap-1.5 text-[12px] font-medium"
							style={{ color: "var(--text-muted)" }}
						>
							<Clock size={12} />
							{time}
						</span>
					</div>

					{/* Title */}
					<h3
						className="line-clamp-2 text-[17px] font-semibold leading-snug"
						style={{ color: "var(--text-primary)" }}
					>
						{title}
					</h3>

					{/* Location */}
					<span
						className="flex items-center gap-1.5 text-[13px]"
						style={{ color: "var(--text-muted)" }}
					>
						<MapPin size={13} />
						{location}
					</span>

					{/* Footer */}
					<div
						className="mt-1 flex items-center justify-between pt-3"
						style={{ borderTop: "1px solid var(--border)" }}
					>
						<span
							className="text-[13px]"
							style={{ color: "var(--text-secondary)" }}
						>
							{organizerName || "DevEvent"}
						</span>
						<span
							className="font-mono text-[13px] font-semibold"
							style={{
								color: isPaid
									? "var(--text-primary)"
									: "var(--accent)",
							}}
						>
							{priceLabel}
						</span>
					</div>
				</div>
			</Link>
		</motion.div>
	);
}

export default EventCard;
export type { EventCardProps };
