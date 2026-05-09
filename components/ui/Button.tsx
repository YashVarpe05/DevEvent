"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	loading?: boolean;
	children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
	primary: [
		"bg-[#C9A84C] text-[#08080A] font-semibold",
		"hover:bg-[#DFC06E] hover:shadow-[0_0_20px_rgba(201,168,76,0.2)]",
		"active:bg-[#8A6E2A]",
	].join(" "),
	secondary: [
		"bg-transparent text-[var(--text-primary)]",
		"border border-[var(--border-bright)]",
		"hover:border-[rgba(201,168,76,0.4)] hover:bg-[var(--gold-subtle)]",
	].join(" "),
	ghost: [
		"bg-transparent text-[var(--text-secondary)]",
		"hover:text-[var(--text-primary)]",
	].join(" "),
	danger: [
		"bg-transparent text-[var(--red)]",
		"border border-[rgba(204,70,70,0.3)]",
		"hover:bg-[rgba(204,70,70,0.08)]",
	].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: "h-8 px-3 text-[13px] rounded-[var(--radius-sm)]",
	md: "h-10 px-4 text-[14px] rounded-[var(--radius-md)]",
	lg: "h-12 px-6 text-[15px] rounded-[var(--radius-md)]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = "primary",
			size = "md",
			loading = false,
			disabled,
			children,
			className,
			style,
			...props
		},
		ref,
	) => {
		const isDisabled = disabled || loading;

		return (
			<motion.button
				ref={ref}
				whileTap={isDisabled ? undefined : { scale: 0.97 }}
				transition={{ duration: 0.1 }}
				disabled={isDisabled}
				className={cn(
					"inline-flex items-center justify-center gap-2",
					"font-medium tracking-[0.01em]",
					"transition-all duration-[160ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
					"cursor-pointer select-none",
					"disabled:opacity-40 disabled:cursor-not-allowed",
					variantClasses[variant],
					sizeClasses[size],
					className,
				)}
				style={style}
				{...(props as any)}
			>
				{loading ? (
					<span
						className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
						aria-label="Loading"
					/>
				) : (
					children
				)}
			</motion.button>
		);
	},
);

Button.displayName = "Button";
export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
