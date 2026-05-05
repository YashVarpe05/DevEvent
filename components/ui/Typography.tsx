import { type ReactNode } from "react";

/* ── Heading ── */
interface HeadingProps {
	level: 1 | 2 | 3 | 4;
	children: ReactNode;
	className?: string;
}

const headingStyles: Record<number, string> = {
	1: "font-display text-5xl tracking-tight",
	2: "font-display text-3xl tracking-tight",
	3: "text-xl font-semibold",
	4: "text-base font-medium",
};

function Heading({ level, children, className = "" }: HeadingProps) {
	const Tag = `h${level}` as const;
	return (
		<Tag
			className={`${headingStyles[level]} ${className}`}
			style={{ color: "var(--text-primary)" }}
		>
			{children}
		</Tag>
	);
}

/* ── Text ── */
interface TextProps {
	size?: "sm" | "base" | "lg";
	muted?: boolean;
	children: ReactNode;
	className?: string;
}

const textSizeMap: Record<string, string> = {
	sm: "text-sm",
	base: "text-base",
	lg: "text-lg",
};

function Text({ size = "base", muted = false, children, className = "" }: TextProps) {
	return (
		<p
			className={`${textSizeMap[size]} ${className}`}
			style={{ color: muted ? "var(--text-muted)" : "var(--text-secondary)" }}
		>
			{children}
		</p>
	);
}

/* ── Label ── */
interface LabelProps {
	children: ReactNode;
	className?: string;
}

function Label({ children, className = "" }: LabelProps) {
	return (
		<span
			className={`text-[11px] font-medium uppercase tracking-[0.1em] ${className}`}
			style={{ color: "var(--text-muted)" }}
		>
			{children}
		</span>
	);
}

/* ── Mono ── */
interface MonoProps {
	children: ReactNode;
	className?: string;
}

function Mono({ children, className = "" }: MonoProps) {
	return (
		<span
			className={`font-mono text-sm ${className}`}
			style={{ color: "var(--text-muted)" }}
		>
			{children}
		</span>
	);
}

export { Heading, Text, Label, Mono };
export type { HeadingProps, TextProps, LabelProps, MonoProps };
