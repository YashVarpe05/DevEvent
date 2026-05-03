"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

function VerifyEmailForm() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading",
	);
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (!token) {
			setStatus("error");
			setMessage("Invalid verification link. No token found.");
			return;
		}

		const verify = async () => {
			try {
				const res = await fetch("/api/auth/verify-email/confirm", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token }),
				});

				const data = await res.json();

				if (res.ok) {
					setStatus("success");
					setMessage(data.message || "Email verified successfully!");
				} else {
					setStatus("error");
					setMessage(
						data.message ||
							"Verification failed. The link may be expired or invalid.",
					);
				}
			} catch {
				setStatus("error");
				setMessage("An unexpected error occurred. Please try again.");
			}
		};

		verify();
	}, [token]);

	return (
		<div className="text-center py-4">
			{status === "loading" && (
				<>
					<Loader2 className="mx-auto h-10 w-10 animate-spin text-primary mb-4" />
					<h2 className="text-2xl font-bold text-white mb-2">
						Verifying your email...
					</h2>
					<p className="text-light-200 text-sm">
						Please wait while we verify your email address.
					</p>
				</>
			)}

			{status === "success" && (
				<>
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
						<CheckCircle className="h-8 w-8 text-primary" />
					</div>
					<h2 className="text-2xl font-bold text-white mb-2">
						Email verified!
					</h2>
					<p className="text-light-200 text-sm mb-6">{message}</p>
					<Link
						href="/login"
						className="inline-block rounded-lg bg-primary px-8 py-2.5 font-semibold text-black transition-all hover:bg-primary/90"
					>
						Sign In
					</Link>
				</>
			)}

			{status === "error" && (
				<>
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
						<AlertCircle className="h-8 w-8 text-red-400" />
					</div>
					<h2 className="text-2xl font-bold text-white mb-2">
						Verification failed
					</h2>
					<p className="text-light-200 text-sm mb-6">{message}</p>
					<Link
						href="/login"
						className="inline-block rounded-lg bg-primary px-8 py-2.5 font-semibold text-black transition-all hover:bg-primary/90"
					>
						Go to Login
					</Link>
				</>
			)}
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense fallback={<div className="text-center text-light-200">Verifying...</div>}>
			<VerifyEmailForm />
		</Suspense>
	);
}
