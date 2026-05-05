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
		// Clear field-specific errors on change
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
			<div className="text-center py-4">
				<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
					<CheckCircle className="h-8 w-8 text-primary" />
				</div>
				<h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
				<p className="text-light-200 text-sm mb-6">
					We&apos;ve sent a verification link to{" "}
					<span className="text-white font-medium">{formData.email}</span>.
					Click the link to activate your account.
				</p>
				<Link
					href="/login"
					className="inline-block rounded-lg bg-primary px-8 py-2.5 font-semibold text-black transition-all hover:bg-primary/90"
				>
					Go to Login
				</Link>
			</div>
		);
	}

	return (
		<div>
			<h2 className="text-2xl font-bold text-white mb-1">Create an account</h2>
			<p className="text-light-200 text-sm mb-6">
				Join DevEvent and never miss a great event
			</p>

			{globalError && (
				<div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
					{globalError}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Name */}
				<div className="space-y-1.5">
					<label htmlFor="signup-name" className="text-sm text-light-100">
						Full Name
					</label>
					<div className="relative">
						<User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-light-200" />
						<input
							id="signup-name"
							type="text"
							value={formData.name}
							onChange={(e) => handleChange("name", e.target.value)}
							placeholder="John Doe"
							required
							className="w-full rounded-lg border border-dark-200 bg-dark-200 py-2.5 pl-10 pr-4 text-white placeholder:text-light-200/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
						/>
					</div>
					{errors.name && (
						<p className="text-xs text-red-400">{errors.name[0]}</p>
					)}
				</div>

				{/* Email */}
				<div className="space-y-1.5">
					<label htmlFor="signup-email" className="text-sm text-light-100">
						Email
					</label>
					<div className="relative">
						<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-light-200" />
						<input
							id="signup-email"
							type="email"
							value={formData.email}
							onChange={(e) => handleChange("email", e.target.value)}
							placeholder="you@example.com"
							required
							className="w-full rounded-lg border border-dark-200 bg-dark-200 py-2.5 pl-10 pr-4 text-white placeholder:text-light-200/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
						/>
					</div>
					{errors.email && (
						<p className="text-xs text-red-400">{errors.email[0]}</p>
					)}
				</div>

				{/* Password */}
				<div className="space-y-1.5">
					<label htmlFor="signup-password" className="text-sm text-light-100">
						Password
					</label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-light-200" />
						<input
							id="signup-password"
							type={showPassword ? "text" : "password"}
							value={formData.password}
							onChange={(e) => handleChange("password", e.target.value)}
							placeholder="Create a strong password"
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

					{/* Password strength */}
					{formData.password && (
						<div className="mt-2 grid grid-cols-2 gap-1">
							{passwordChecks.map((check) => (
								<div
									key={check.label}
									className={`flex items-center gap-1.5 text-xs ${
										check.test ? "text-primary" : "text-light-200/60"
									}`}
								>
									<div
										className={`h-1 w-1 rounded-full ${
											check.test ? "bg-primary" : "bg-light-200/30"
										}`}
									/>
									{check.label}
								</div>
							))}
						</div>
					)}
				</div>

				{/* Confirm Password */}
				<div className="space-y-1.5">
					<label
						htmlFor="signup-confirm-password"
						className="text-sm text-light-100"
					>
						Confirm Password
					</label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-light-200" />
						<input
							id="signup-confirm-password"
							type="password"
							value={formData.confirmPassword}
							onChange={(e) =>
								handleChange("confirmPassword", e.target.value)
							}
							placeholder="Confirm your password"
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
						<div className="w-full border-t border-dark-200" />
					</div>
					<div className="relative flex justify-center text-xs">
						<span className="bg-dark-100 px-3 text-light-200">
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
					className="w-full rounded-lg border border-dark-200 bg-dark-200/50 py-2.5 font-medium text-white transition-all hover:bg-dark-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
				>
					{googleLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
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

			<p className="mt-6 text-center text-sm text-light-200">
				Already have an account?{" "}
				<Link
					href="/login"
					className="text-primary hover:text-primary/80 font-medium transition-colors"
				>
					Sign in
				</Link>
			</p>
		</div>
	);
}
