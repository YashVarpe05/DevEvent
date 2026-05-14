"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

type CountUpProps = {
	target: number;
	suffix?: string;
	prefix?: string;
	duration?: number;
	className?: string;
	start?: boolean;
};

export default function CountUp({
	target,
	suffix = "",
	prefix = "",
	duration = 1.5,
	className = "",
	start = true,
}: CountUpProps) {
	const [count, setCount] = useState(0);
	const ref = useRef<HTMLSpanElement>(null);
	const frameRef = useRef<number | null>(null);
	const hasAnimated = useRef(false);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const reduceMotion = useReducedMotion();
	const shouldShowTarget = reduceMotion && start && isInView;
	const displayValue = shouldShowTarget ? target : count;

	useEffect(() => {
		if (!start || !isInView || hasAnimated.current) {
			return;
		}

		hasAnimated.current = true;

		if (reduceMotion) {
			return;
		}

		const startedAt = performance.now();
		const durationMs = duration * 1000;

		const tick = (now: number) => {
			const progress = Math.min((now - startedAt) / durationMs, 1);
			const eased = 1 - Math.pow(1 - progress, 3);

			setCount(Math.floor(eased * target));

			if (progress < 1) {
				frameRef.current = requestAnimationFrame(tick);
			} else {
				setCount(target);
			}
		};

		frameRef.current = requestAnimationFrame(tick);

		return () => {
			if (frameRef.current !== null) {
				cancelAnimationFrame(frameRef.current);
			}
		};
	}, [duration, isInView, reduceMotion, start, target]);

	return (
		<span ref={ref} className={className}>
			{prefix}
			{displayValue.toLocaleString()}
			{suffix}
		</span>
	);
}
