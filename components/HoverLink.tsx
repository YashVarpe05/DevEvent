"use client";

import Link from "next/link";
import React, { useState } from "react";

type HoverLinkProps = React.ComponentProps<typeof Link> & {
	style?: React.CSSProperties;
	// Styles merged over `style` while hovered. Pass undefined to disable hover.
	hoverStyle?: React.CSSProperties;
};

// A next/link that applies a hover style via internal state. Exists so Server
// Components can get hover interactivity without passing event-handler props
// (which RSC forbids) — they just pass plain `style`/`hoverStyle` objects.
export default function HoverLink({ style, hoverStyle, children, ...props }: HoverLinkProps) {
	const [hovered, setHovered] = useState(false);
	return (
		<Link
			{...props}
			style={hovered && hoverStyle ? { ...style, ...hoverStyle } : style}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{children}
		</Link>
	);
}
