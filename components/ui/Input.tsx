import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, hint, className = "", id, ...props }, ref) => {
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
					className={[
						"h-11 w-full px-3",
						"text-[15px]",
						"rounded-[var(--radius-md)]",
						"border outline-none",
						"transition-[border-color] duration-150",
						error
							? "border-[var(--error)]"
							: "border-[var(--border)] focus:border-[var(--accent)]",
						className,
					].join(" ")}
					style={{
						backgroundColor: "var(--bg-overlay)",
						color: "var(--text-primary)",
					}}
					{...props}
				/>
				{error && (
					<p
						className="text-[13px]"
						style={{ color: "var(--error)" }}
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
