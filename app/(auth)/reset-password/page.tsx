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
				<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
					<AlertCircle className="h-8 w-8 text-red-400" />
				</div>
				<h2 className="text-2xl font-bold text-white mb-2">Invalid link</h2>
				<p className="text-light-200 text-sm mb-6">
					This reset link is invalid or missing. Please request a new one.
				</p>
				<Link
					href="/forgot-password"
					className="inline-block rounded-lg bg-primary px-8 py-2.5 font-semibold text-black transition-all hover:bg-primary/90"
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
				<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
					<CheckCircle className="h-8 w-8 text-primary" />
				</div>
				<h2 className="text-2xl font-bold text-white mb-2">
					Password reset successful
				</h2>
				<p className="text-light-200 text-sm mb-6">
					Your password has been updated. You can now sign in.
				</p>
				<Link
					href="/login"
					className="inline-block rounded-lg bg-primary px-8 py-2.5 font-semibold text-black transition-all hover:bg-primary/90"
				>
					Sign In
				</Link>
			</div>
		);
	}

	return (
		<div>
			<h2 className="text-2xl font-bold text-white mb-1">
				Reset your password
			</h2>
			<p className="text-light-200 text-sm mb-6">
				Enter your new password below.
			</p>

			{globalError && (
				<div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
					{globalError}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-1.5">
					<label htmlFor="reset-password" className="text-sm text-light-100">
						New Password
					</label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-light-200" />
						<input
							id="reset-password"
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter new password"
							required
							className="w-full rounded-lg border border-dark-200 bg-dark-200 py-2.5 pl-10 pr-10 text-white placeholder:text-light-200/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-light-200 hover:text-white transition-colors"
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
						<p className="text-xs text-red-400">{errors.password[0]}</p>
					)}
				</div>

				<div className="space-y-1.5">
					<label
						htmlFor="reset-confirm-password"
						className="text-sm text-light-100"
					>
						Confirm New Password
					</label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-light-200" />
						<input
							id="reset-confirm-password"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="Confirm new password"
							required
							className="w-full rounded-lg border border-dark-200 bg-dark-200 py-2.5 pl-10 pr-4 text-white placeholder:text-light-200/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
						/>
					</div>
					{errors.confirmPassword && (
						<p className="text-xs text-red-400">
							{errors.confirmPassword[0]}
						</p>
					)}
				</div>

				<button
					type="submit"
					disabled={loading}
					className="w-full rounded-lg bg-primary py-2.5 font-semibold text-black transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
				>
					{loading ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
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
