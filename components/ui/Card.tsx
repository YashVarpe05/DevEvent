"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface CardProps {
	children: ReactNode;
	className?: string;
	interactive?: boolean;
	onClick?: () => void;
}

function Card({
	children,
	className = "",
	interactive = false,
	onClick,
}: CardProps) {
	const baseStyles = [
		"rounded-[var(--radius-lg)]",
		"border border-[var(--border)]",
		"bg-[var(--bg-elevated)]",
		"transition-[border-color] duration-200 ease-in-out",
	].join(" ");

	if (interactive) {
		return (
			<motion.div
				whileHover={{ scale: 1.005 }}
				onClick={onClick}
				className={[
					baseStyles,
					"cursor-pointer",
					"hover:border-[#FFB54766]",
					className,
				].join(" ")}
			>
				{children}
			</motion.div>
		);
	}

	return (
		<div
			className={[
				baseStyles,
				"hover:border-[var(--border-strong)]",
				className,
			].join(" ")}
		>
			{children}
		</div>
	);
}

export { Card };
export type { CardProps };
