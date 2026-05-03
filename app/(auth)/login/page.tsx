"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

function LoginForm() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const callbackUrl = searchParams.get("callbackUrl") || "/";

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const result = await signIn("credentials", {
				email: email.trim().toLowerCase(),
				password,
				redirect: false,
			});

			if (result?.error) {
				setError("Invalid email or password. Please try again.");
			} else {
				router.push(callbackUrl);
				router.refresh();
			}
		} catch {
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setGoogleLoading(true);
		await signIn("google", { callbackUrl });
	};

	return (
		<div>
			<h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
			<p className="text-light-200 text-sm mb-6">
				Sign in to your DevEvent account
			</p>

			{error && (
				<div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-1.5">
					<label htmlFor="login-email" className="text-sm text-light-100">
						Email
					</label>
					<div className="relative">
						<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-light-200" />
						<input
							id="login-email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							required
							className="w-full rounded-lg border border-dark-200 bg-dark-200 py-2.5 pl-10 pr-4 text-white placeholder:text-light-200/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
						/>
					</div>
				</div>

				<div className="space-y-1.5">
					<div className="flex items-center justify-between">
						<label htmlFor="login-password" className="text-sm text-light-100">
							Password
						</label>
						<Link
							href="/forgot-password"
							className="text-xs text-primary hover:text-primary/80 transition-colors"
						>
							Forgot password?
						</Link>
					</div>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-light-200" />
						<input
							id="login-password"
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
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
				</div>

				<button
					type="submit"
					disabled={loading}
					className="w-full rounded-lg bg-primary py-2.5 font-semibold text-black transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
				>
					{loading ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Signing in...
						</>
					) : (
						"Sign In"
					)}
				</button>
			</form>

			{/* Google OAuth */}
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
					onClick={handleGoogleSignIn}
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
				Don&apos;t have an account?{" "}
				<Link
					href="/signup"
					className="text-primary hover:text-primary/80 font-medium transition-colors"
				>
					Sign up
				</Link>
			</p>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense fallback={<div className="text-center text-light-200">Loading...</div>}>
			<LoginForm />
		</Suspense>
	);
}
