"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	loading?: boolean;
	children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
	primary: [
		"bg-[var(--accent)] text-[var(--text-inverse)]",
		"hover:bg-[var(--accent-dim)]",
	].join(" "),
	secondary: [
		"bg-transparent text-[var(--text-primary)]",
		"border border-[var(--border)]",
		"hover:bg-[var(--bg-hover)]",
	].join(" "),
	ghost: [
		"bg-transparent text-[var(--text-secondary)]",
		"hover:text-[var(--text-primary)]",
	].join(" "),
	danger: [
		"bg-transparent text-[var(--error)]",
		"border border-[var(--error)]",
		"hover:bg-[#F044381a]",
	].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
	sm: "h-8 px-3 text-[13px]",
	md: "h-10 px-4 text-[15px]",
	lg: "h-12 px-6 text-[15px]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = "primary",
			size = "md",
			loading = false,
			disabled,
			children,
			className = "",
			...props
		},
		ref,
	) => {
		const isDisabled = disabled || loading;

		return (
			<motion.button
				ref={ref}
				whileTap={isDisabled ? undefined : { scale: 0.97 }}
				disabled={isDisabled}
				className={[
					"inline-flex items-center justify-center gap-2",
					"font-medium tracking-[0.01em]",
					"rounded-[var(--radius-md)]",
					"transition-[background-color,color,border-color] duration-150",
					"cursor-pointer",
					"disabled:opacity-40 disabled:cursor-not-allowed",
					variantStyles[variant],
					sizeStyles[size],
					className,
				]
					.filter(Boolean)
					.join(" ")}
				{...props}
			>
				{loading ? (
					<Loader2
						className="animate-spin"
						style={{ width: 16, height: 16 }}
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
