import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "gold" | "green" | "red" | "blue";

interface BadgeProps {
	variant?: BadgeVariant;
	children: ReactNode;
	className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
	default:
		"border-[var(--border)] text-[var(--text-secondary)] bg-transparent",
	gold:
		"border-[var(--border-gold)] text-[var(--gold)] bg-[var(--gold-subtle)]",
	green:
		"border-[rgba(42,157,111,0.25)] text-[var(--green)] bg-[rgba(42,157,111,0.08)]",
	red:
		"border-[rgba(204,70,70,0.25)] text-[var(--red)] bg-[rgba(204,70,70,0.08)]",
	blue:
		"border-[rgba(58,120,212,0.25)] text-[var(--blue)] bg-[rgba(58,120,212,0.08)]",
};

function Badge({ variant = "default", children, className }: BadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center",
				"h-5 px-[7px]",
				"text-[10px] font-medium uppercase tracking-[0.06em]",
				"rounded-[var(--radius-xs)] border",
				variantStyles[variant],
				className,
			)}
		>
			{children}
		</span>
	);
}

export { Badge };
export type { BadgeProps, BadgeVariant };
