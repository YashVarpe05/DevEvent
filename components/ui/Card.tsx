import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "interactive" | "gold";

interface CardProps {
	children: ReactNode;
	className?: string;
	variant?: CardVariant;
	onClick?: () => void;
}

const baseStyles =
	"rounded-[var(--radius-lg)] overflow-hidden";

const variantStyles: Record<CardVariant, string> = {
	default: [
		"bg-[var(--bg-surface)]",
		"border border-[var(--border-dim)]",
	].join(" "),
	interactive: [
		"bg-[var(--bg-surface)]",
		"border border-[var(--border-dim)]",
		"cursor-pointer",
		"hover:border-[var(--border-bright)]",
		"hover:-translate-y-px",
		"transition-all duration-200 ease-[var(--ease-out)]",
	].join(" "),
	gold: [
		"border border-[var(--border-gold)]",
		"bg-gradient-to-br from-[var(--bg-surface)] to-[var(--gold-subtle)]",
	].join(" "),
};

function Card({
	children,
	className,
	variant = "default",
	onClick,
}: CardProps) {
	return (
		<div
			className={cn(baseStyles, variantStyles[variant], className)}
			onClick={onClick}
		>
			{children}
		</div>
	);
}

export { Card };
export type { CardProps, CardVariant };
