"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
	Eye,
	EyeOff,
	Loader2,
	Mail,
	Lock,
	User,
	CheckCircle,
} from "lucide-react";

export default function SignupPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [globalError, setGlobalError] = useState("");
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const passwordChecks = [
		{ label: "At least 8 characters", test: formData.password.length >= 8 },
		{ label: "One lowercase letter", test: /[a-z]/.test(formData.password) },
		{ label: "One uppercase letter", test: /[A-Z]/.test(formData.password) },
		{ label: "One number", test: /[0-9]/.test(formData.password) },
	];

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => {
				const next = { ...prev };
				delete next[field];
				return next;
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setGlobalError("");
		setLoading(true);

		try {
			const res = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await res.json();

			if (!res.ok) {
				if (data.fieldErrors) {
					setErrors(data.fieldErrors);
				} else {
					setGlobalError(data.message || "Signup failed.");
				}
			} else {
				setSuccess(true);
			}
		} catch {
			setGlobalError("An unexpected error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div style={{ textAlign: "center", padding: "16px 0" }}>
				<div
					style={{
						margin: "0 auto 16px auto",
						width: "56px",
						height: "56px",
						background: "var(--gold-subtle)",
						border: "1px solid rgba(201,168,76,0.2)",
						borderRadius: "50%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<CheckCircle style={{ color: "var(--gold)", width: "24px", height: "24px" }} />
				</div>
				<h2 style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--text-primary)", marginBottom: "8px" }}>
					Check your email
				</h2>
				<p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>
					We&apos;ve sent a verification link to{" "}
					<span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{formData.email}</span>.
					Click the link to activate your account.
				</p>
				<Link
					href="/login"
					className="hover:bg-[var(--gold-bright)] transition-colors duration-160"
					style={{
						display: "inline-block",
						background: "var(--gold)",
						color: "var(--text-inverse)",
						fontWeight: 600,
						fontSize: "14px",
						padding: "12px 32px",
						borderRadius: "var(--radius-md)",
					}}
				>
					Go to Login
				</Link>
			</div>
		);
	}

	return (
		<div>
			<h2 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
				Create an account
			</h2>
			<p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>
				Join DevEvent and never miss a great event
			</p>

			{globalError && (
				<div style={{ border: "1px solid rgba(204,70,70,0.3)", background: "rgba(204,70,70,0.06)", color: "#CC4646", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: "13px", marginBottom: "16px" }}>
					{globalError}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Name */}
				<div style={{ display: "flex", flexDirection: "column" }}>
					<label htmlFor="signup-name" style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", letterSpacing: "0.02em", marginBottom: "6px" }}>
						Full Name
					</label>
					<div className="relative">
						<User className="absolute left-[12px] top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)", width: "15px", height: "15px" }} />
						<input
							id="signup-name"
							type="text"
							value={formData.name}
							onChange={(e) => handleChange("name", e.target.value)}
							placeholder="John Doe"
							required
							className="w-full text-[14px] outline-none transition-colors duration-150 placeholder:text-[var(--text-muted)] focus:border-[rgba(201,168,76,0.5)] focus:ring-[3px] focus:ring-[var(--gold-subtle)]"
							style={{ height: "44px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", paddingLeft: "40px", paddingRight: "14px", color: "var(--text-primary)" }}
						/>
					</div>
					{errors.name && (
						<p style={{ fontSize: "12px", color: "#CC4646", marginTop: "4px" }}>{errors.name[0]}</p>
					)}
				</div>

				{/* Email */}
				<div style={{ display: "flex", flexDirection: "column" }}>
					<label htmlFor="signup-email" style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", letterSpacing: "0.02em", marginBottom: "6px" }}>
						Email
					</label>
					<div className="relative">
						<Mail className="absolute left-[12px] top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)", width: "15px", height: "15px" }} />
						<input
							id="signup-email"
							type="email"
							value={formData.email}
							onChange={(e) => handleChange("email", e.target.value)}
							placeholder="you@example.com"
							required
							className="w-full text-[14px] outline-none transition-colors duration-150 placeholder:text-[var(--text-muted)] focus:border-[rgba(201,168,76,0.5)] focus:ring-[3px] focus:ring-[var(--gold-subtle)]"
							style={{ height: "44px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", paddingLeft: "40px", paddingRight: "14px", color: "var(--text-primary)" }}
						/>
					</div>
					{errors.email && (
						<p style={{ fontSize: "12px", color: "#CC4646", marginTop: "4px" }}>{errors.email[0]}</p>
					)}
				</div>

				{/* Password */}
				<div style={{ display: "flex", flexDirection: "column" }}>
					<label htmlFor="signup-password" style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", letterSpacing: "0.02em", marginBottom: "6px" }}>
						Password
					</label>
					<div className="relative">
						<Lock className="absolute left-[12px] top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)", width: "15px", height: "15px" }} />
						<input
							id="signup-password"
							type={showPassword ? "text" : "password"}
							value={formData.password}
							onChange={(e) => handleChange("password", e.target.value)}
							placeholder="Create a strong password"
							required
							className="w-full text-[14px] outline-none transition-colors duration-150 placeholder:text-[var(--text-muted)] focus:border-[rgba(201,168,76,0.5)] focus:ring-[3px] focus:ring-[var(--gold-subtle)]"
							style={{ height: "44px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", paddingLeft: "40px", paddingRight: "40px", color: "var(--text-primary)" }}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-[var(--text-primary)]"
							style={{ color: "var(--text-muted)" }}
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
						<p style={{ fontSize: "12px", color: "#CC4646", marginTop: "4px" }}>{errors.password[0]}</p>
					)}

					{/* Password strength */}
					{formData.password && (
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginTop: "10px" }}>
							{passwordChecks.map((check) => (
								<div
									key={check.label}
									style={{
										display: "flex",
										alignItems: "center",
										gap: "6px",
										fontSize: "12px",
										color: check.test ? "var(--gold)" : "var(--text-muted)",
									}}
								>
									<div
										style={{
											height: "4px",
											width: "4px",
											borderRadius: "50%",
											background: check.test ? "var(--gold)" : "var(--border)",
										}}
									/>
									{check.label}
								</div>
							))}
						</div>
					)}
				</div>

				{/* Confirm Password */}
				<div style={{ display: "flex", flexDirection: "column" }}>
					<label
						htmlFor="signup-confirm-password"
						style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", letterSpacing: "0.02em", marginBottom: "6px" }}
					>
						Confirm Password
					</label>
					<div className="relative">
						<Lock className="absolute left-[12px] top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)", width: "15px", height: "15px" }} />
						<input
							id="signup-confirm-password"
							type="password"
							value={formData.confirmPassword}
							onChange={(e) =>
								handleChange("confirmPassword", e.target.value)
							}
							placeholder="Confirm your password"
							required
							className="w-full text-[14px] outline-none transition-colors duration-150 placeholder:text-[var(--text-muted)] focus:border-[rgba(201,168,76,0.5)] focus:ring-[3px] focus:ring-[var(--gold-subtle)]"
							style={{ height: "44px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", paddingLeft: "40px", paddingRight: "14px", color: "var(--text-primary)" }}
						/>
					</div>
					{errors.confirmPassword && (
						<p style={{ fontSize: "12px", color: "#CC4646", marginTop: "4px" }}>
							{errors.confirmPassword[0]}
						</p>
					)}
				</div>

				<button
					type="submit"
					disabled={loading}
					className="w-full flex items-center justify-center gap-2 transition-colors duration-160 hover:bg-[var(--gold-bright)] disabled:opacity-50 disabled:cursor-not-allowed"
					style={{ height: "44px", background: "var(--gold)", color: "var(--text-inverse)", fontWeight: 600, fontSize: "14px", borderRadius: "var(--radius-md)", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
				>
					{loading ? (
						<>
							<Loader2 className="animate-spin" style={{ width: "16px", height: "16px", color: "var(--text-inverse)" }} />
							Creating account...
						</>
					) : (
						"Create Account"
					)}
				</button>
			</form>

			{/* Google */}
			<div className="mt-5">
				<div className="relative mb-5">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full" style={{ borderTop: "1px solid var(--border-dim)" }} />
					</div>
					<div className="relative flex justify-center text-xs">
						<span style={{ background: "var(--bg-surface)", padding: "0 12px", color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
							or continue with
						</span>
					</div>
				</div>

				<button
					onClick={() => {
						setGoogleLoading(true);
						signIn("google", { callbackUrl: "/" });
					}}
					disabled={googleLoading}
					className="w-full flex items-center justify-center gap-3 transition-all duration-160 hover:bg-[var(--bg-overlay)] hover:border-[var(--border-bright)] disabled:opacity-50 disabled:cursor-not-allowed"
					style={{ height: "44px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "14px", fontWeight: 500 }}
				>
					{googleLoading ? (
						<Loader2 className="animate-spin" style={{ width: "16px", height: "16px" }} />
					) : (
						<svg className="h-5 w-5" viewBox="0 0 24 24">
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
					)}
					Continue with Google
				</button>
			</div>

			<p style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
				Already have an account?{" "}
				<Link
					href="/login"
					className="hover:text-[var(--gold-bright)] transition-colors"
					style={{ color: "var(--gold)" }}
				>
					Sign in
				</Link>
			</p>
		</div>
	);
}
