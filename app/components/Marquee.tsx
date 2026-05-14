"use client";

import type { CSSProperties, ReactNode } from "react";

type MarqueeProps = {
	children: ReactNode;
	speed?: number;
	className?: string;
};

type MarqueeStyle = CSSProperties & {
	"--marquee-duration": string;
};

export default function Marquee({
	children,
	speed = 40,
	className = "",
}: MarqueeProps) {
	return (
		<div
			className={`de-marquee ${className}`.trim()}
			style={{ "--marquee-duration": `${speed}s` } as MarqueeStyle}
		>
			<style>{marqueeStyles}</style>
			<div className="de-marquee__track">
				<div className="de-marquee__group">{children}</div>
				<div className="de-marquee__group" aria-hidden="true">
					{children}
				</div>
			</div>
		</div>
	);
}

const marqueeStyles = `
	.de-marquee {
		position: relative;
		width: 100%;
		overflow: hidden;
	}

	.de-marquee__track {
		display: flex;
		width: max-content;
		animation: de-marquee-scroll var(--marquee-duration) linear infinite;
		white-space: nowrap;
		will-change: transform;
	}

	.de-marquee:hover .de-marquee__track {
		animation-play-state: paused;
	}

	.de-marquee__group {
		display: flex;
		min-width: max-content;
		flex-shrink: 0;
		align-items: center;
	}

	@keyframes de-marquee-scroll {
		from {
			transform: translate3d(0, 0, 0);
		}

		to {
			transform: translate3d(-50%, 0, 0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.de-marquee__track {
			animation: none;
			transform: none;
		}
	}
`;
