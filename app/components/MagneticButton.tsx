"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type MagneticButtonProps = {
	children: ReactNode;
	className?: string;
	strength?: number;
};

export default function MagneticButton({
	children,
	className = "",
	strength = 20,
}: MagneticButtonProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const reduceMotion = useReducedMotion();

	const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
		if (!ref.current || reduceMotion) {
			return;
		}

		const rect = ref.current.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const x = ((event.clientX - centerX) / rect.width) * strength;
		const y = ((event.clientY - centerY) / rect.height) * strength;

		setPosition({ x, y });
	};

	return (
		<motion.div
			ref={ref}
			onMouseMove={handleMouseMove}
			onMouseLeave={() => setPosition({ x: 0, y: 0 })}
			animate={reduceMotion ? { x: 0, y: 0 } : { x: position.x, y: position.y }}
			transition={{ type: "spring", stiffness: 350, damping: 15, mass: 0.5 }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
