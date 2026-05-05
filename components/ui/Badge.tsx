import { type ReactNode } from "react";

type BadgeVariant = "default" | "success" | "error" | "warning" | "accent";

interface BadgeProps {
	variant?: BadgeVariant;
	children: ReactNode;
	className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
	default: "bg-[var(--bg-overlay)] text-[var(--text-secondary)] border-[var(--border)]",
	success: "bg-[#3ECF8E1a] text-[var(--success)] border-[#3ECF8E33]",
	error: "bg-[#F044381a] text-[var(--error)] border-[#F0443833]",
	warning: "bg-[var(--accent-subtle)] text-[var(--accent)] border-[#FFB54733]",
	accent: "bg-[var(--accent-subtle)] text-[var(--accent)] border-[#FFB54733]",
};

function Badge({ variant = "default", children, className = "" }: BadgeProps) {
	return (
		<span
			className={[
				"inline-flex items-center",
				"px-2 py-[2px]",
				"text-[11px] font-medium uppercase tracking-[0.08em]",
				"rounded-[4px] border",
				variantStyles[variant],
				className,
			].join(" ")}
		>
			{children}
		</span>
	);
}

export { Badge };
export type { BadgeProps, BadgeVariant };
