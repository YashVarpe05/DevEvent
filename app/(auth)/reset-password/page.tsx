"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
	Eye,
	EyeOff,
	Loader2,
	Lock,
	CheckCircle,
	AlertCircle,
} from "lucide-react";

function ResetPasswordForm() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [globalError, setGlobalError] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	if (!token) {
		return (
			<div className="text-center py-4">
				<div 
					className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
					style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
				>
					<AlertCircle className="h-8 w-8" style={{ color: "#f87171" }} />
				</div>
				<h2 
					className="text-2xl font-bold mb-2"
					style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}
				>
					Invalid link
				</h2>
				<p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
					This reset link is invalid or missing. Please request a new one.
				</p>
				<Link
					href="/forgot-password"
					className="inline-block rounded-lg px-8 py-2.5 font-semibold transition-all"
					style={{ backgroundColor: "var(--gold)", color: "var(--bg-void)" }}
					onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--gold-dim)")}
					onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--gold)")}
				>
					Request New Link
				</Link>
			</div>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setGlobalError("");
		setLoading(true);

		try {
			const res = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, password, confirmPassword }),
			});

			const data = await res.json();

			if (!res.ok) {
				if (data.fieldErrors) {
					setErrors(data.fieldErrors);
				} else {
					setGlobalError(data.message || "Reset failed.");
				}
			} else {
				setSuccess(true);
			}
		} catch {
			setGlobalError("An unexpected error occurred.");
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className="text-center py-4">
				<div 
					className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
					style={{ backgroundColor: "rgba(223, 168, 116, 0.1)" }}
				>
					<CheckCircle className="h-8 w-8" style={{ color: "var(--gold)" }} />
				</div>
				<h2 
					className="text-2xl font-bold mb-2"
					style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}
				>
					Password reset successful
				</h2>
				<p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
					Your password has been updated. You can now sign in.
				</p>
				<Link
					href="/login"
					className="inline-block rounded-lg px-8 py-2.5 font-semibold transition-all"
					style={{ backgroundColor: "var(--gold)", color: "var(--bg-void)" }}
					onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--gold-dim)")}
					onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--gold)")}
				>
					Sign In
				</Link>
			</div>
		);
	}

	return (
		<div>
			<h2 
				className="text-2xl font-bold mb-1"
				style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}
			>
				Reset your password
			</h2>
			<p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
				Enter your new password below.
			</p>

			{globalError && (
				<div 
					className="mb-4 rounded-lg px-4 py-3 text-sm"
					style={{ 
						backgroundColor: "rgba(239, 68, 68, 0.1)", 
						border: "1px solid rgba(239, 68, 68, 0.3)",
						color: "#f87171"
					}}
				>
					{globalError}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-1.5">
					<label htmlFor="reset-password" className="text-sm" style={{ color: "var(--text-secondary)" }}>
						New Password
					</label>
					<div className="relative">
						<Lock 
							className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" 
							style={{ color: "var(--text-muted)" }} 
						/>
						<input
							id="reset-password"
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter new password"
							required
							className="w-full rounded-lg py-2.5 pl-10 pr-10 transition-all"
							style={{ 
								backgroundColor: "var(--bg-elevated)", 
								border: "1px solid var(--border-dim)",
								color: "var(--text-primary)",
								outline: "none"
							}}
							onFocus={(e) => {
								e.currentTarget.style.borderColor = "var(--gold)";
								e.currentTarget.style.boxShadow = "0 0 0 1px var(--gold)";
							}}
							onBlur={(e) => {
								e.currentTarget.style.borderColor = "var(--border-dim)";
								e.currentTarget.style.boxShadow = "none";
							}}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
							style={{ color: "var(--text-muted)" }}
							onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
							onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							{showPassword ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</button>
					</div>
					{errors.password && (
						<p className="text-xs" style={{ color: "#f87171" }}>{errors.password[0]}</p>
					)}
				</div>

				<div className="space-y-1.5">
					<label
						htmlFor="reset-confirm-password"
						className="text-sm" 
						style={{ color: "var(--text-secondary)" }}
					>
						Confirm New Password
					</label>
					<div className="relative">
						<Lock 
							className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" 
							style={{ color: "var(--text-muted)" }}
						/>
						<input
							id="reset-confirm-password"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="Confirm new password"
							required
							className="w-full rounded-lg py-2.5 pl-10 pr-4 transition-all"
							style={{ 
								backgroundColor: "var(--bg-elevated)", 
								border: "1px solid var(--border-dim)",
								color: "var(--text-primary)",
								outline: "none"
							}}
							onFocus={(e) => {
								e.currentTarget.style.borderColor = "var(--gold)";
								e.currentTarget.style.boxShadow = "0 0 0 1px var(--gold)";
							}}
							onBlur={(e) => {
								e.currentTarget.style.borderColor = "var(--border-dim)";
								e.currentTarget.style.boxShadow = "none";
							}}
						/>
					</div>
					{errors.confirmPassword && (
						<p className="text-xs" style={{ color: "#f87171" }}>
							{errors.confirmPassword[0]}
						</p>
					)}
				</div>

				<button
					type="submit"
					disabled={loading}
					className="w-full rounded-lg py-2.5 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					style={{ 
						backgroundColor: "var(--gold)", 
						color: "var(--bg-void)",
						border: "none"
					}}
					onMouseEnter={(e) => {
						if (!loading) e.currentTarget.style.backgroundColor = "var(--gold-dim)";
					}}
					onMouseLeave={(e) => {
						if (!loading) e.currentTarget.style.backgroundColor = "var(--gold)";
					}}
				>
					{loading ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--bg-void)" }} />
							Resetting...
						</>
					) : (
						"Reset Password"
					)}
				</button>
			</form>
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<div className="text-center text-light-200">Loading...</div>}>
			<ResetPasswordForm />
		</Suspense>
	);
}
