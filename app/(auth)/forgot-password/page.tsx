"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const res = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: email.trim().toLowerCase() }),
			});

			if (res.ok) {
				setSent(true);
			} else {
				const data = await res.json();
				setError(data.message || "Something went wrong.");
			}
		} catch {
			setError("An unexpected error occurred.");
		} finally {
			setLoading(false);
		}
	};

	if (sent) {
		return (
			<div className="text-center py-4">
				<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
					<CheckCircle className="h-8 w-8 text-primary" />
				</div>
				<h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
				<p className="text-light-200 text-sm mb-6">
					If an account with <span className="text-white font-medium">{email}</span> exists,
					we&apos;ve sent a password reset link.
				</p>
				<Link
					href="/login"
					className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to login
				</Link>
			</div>
		);
	}

	return (
		<div>
			<h2 className="text-2xl font-bold text-white mb-1">Forgot password?</h2>
			<p className="text-light-200 text-sm mb-6">
				Enter your email and we&apos;ll send you a reset link.
			</p>

			{error && (
				<div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-1.5">
					<label htmlFor="forgot-email" className="text-sm text-light-100">
						Email
					</label>
					<div className="relative">
						<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-light-200" />
						<input
							id="forgot-email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							required
							className="w-full rounded-lg border border-dark-200 bg-dark-200 py-2.5 pl-10 pr-4 text-white placeholder:text-light-200/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="w-full rounded-lg bg-primary py-2.5 font-semibold text-black transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
				>
					{loading ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Sending...
						</>
					) : (
						"Send Reset Link"
					)}
				</button>
			</form>

			<p className="mt-6 text-center">
				<Link
					href="/login"
					className="inline-flex items-center gap-2 text-light-200 hover:text-white transition-colors text-sm"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to login
				</Link>
			</p>
		</div>
	);
}
