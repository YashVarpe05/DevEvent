import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, hint, className, id, ...props }, ref) => {
		const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

		return (
			<div className="flex flex-col gap-1.5">
				{label && (
					<label
						htmlFor={inputId}
						className="text-[13px] font-medium"
						style={{ color: "var(--text-secondary)" }}
					>
						{label}
					</label>
				)}
				<input
					ref={ref}
					id={inputId}
					className={cn(
						"h-11 w-full px-3.5",
						"text-[14px]",
						"rounded-[var(--radius-md)]",
						"border outline-none",
						"transition-all duration-150",
						"placeholder:text-[var(--text-muted)]",
						error
							? "border-[rgba(204,70,70,0.4)] shadow-[0_0_0_3px_rgba(204,70,70,0.06)]"
							: "border-[var(--border)] focus:border-[rgba(201,168,76,0.5)] focus:shadow-[0_0_0_3px_var(--gold-subtle)]",
						className,
					)}
					style={{
						backgroundColor: "var(--bg-surface)",
						color: "var(--text-primary)",
					}}
					{...props}
				/>
				{error && (
					<p
						className="text-[13px]"
						style={{ color: "var(--red)" }}
					>
						{error}
					</p>
				)}
				{hint && !error && (
					<p
						className="text-[13px]"
						style={{ color: "var(--text-muted)" }}
					>
						{hint}
					</p>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";
export { Input };
export type { InputProps };
