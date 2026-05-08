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
					Check your email
				</h2>
				<p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
					If an account with <span className="font-medium" style={{ color: "var(--text-primary)" }}>{email}</span> exists,
					we&apos;ve sent a password reset link.
				</p>
				<Link
					href="/login"
					className="inline-flex items-center gap-2 transition-colors text-sm"
					style={{ color: "var(--gold)" }}
					onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold-dim)")}
					onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gold)")}
				>
					<ArrowLeft className="h-4 w-4" />
					Back to login
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
				Forgot password?
			</h2>
			<p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
				Enter your email and we&apos;ll send you a reset link.
			</p>

			{error && (
				<div 
					className="mb-4 rounded-lg px-4 py-3 text-sm"
					style={{ 
						backgroundColor: "rgba(239, 68, 68, 0.1)", 
						border: "1px solid rgba(239, 68, 68, 0.3)",
						color: "#f87171"
					}}
				>
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-1.5">
					<label htmlFor="forgot-email" className="text-sm" style={{ color: "var(--text-secondary)" }}>
						Email
					</label>
					<div className="relative">
						<Mail 
							className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" 
							style={{ color: "var(--text-muted)" }}
						/>
						<input
							id="forgot-email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
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
					className="inline-flex items-center gap-2 transition-colors text-sm"
					style={{ color: "var(--text-secondary)" }}
					onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
					onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
				>
					<ArrowLeft className="h-4 w-4" />
					Back to login
				</Link>
			</p>
		</div>
	);
}
