"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

type RevealDirection = "up" | "down" | "left" | "right";

type ScrollRevealProps = {
	children: ReactNode;
	className?: string;
	delay?: number;
	direction?: RevealDirection;
	duration?: number;
	once?: boolean;
};

const directions: Record<RevealDirection, { x: number; y: number }> = {
	down: { x: 0, y: -40 },
	left: { x: 40, y: 0 },
	right: { x: -40, y: 0 },
	up: { x: 0, y: 40 },
};

export default function ScrollReveal({
	children,
	className = "",
	delay = 0,
	direction = "up",
	duration = 0.6,
	once = true,
}: ScrollRevealProps) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once, margin: "-50px" });
	const reduceMotion = useReducedMotion();

	return (
		<motion.div
			ref={ref}
			initial={
				reduceMotion
					? { opacity: 1, x: 0, y: 0 }
					: { opacity: 0, ...directions[direction] }
			}
			animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
			transition={{ duration: reduceMotion ? 0 : duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
