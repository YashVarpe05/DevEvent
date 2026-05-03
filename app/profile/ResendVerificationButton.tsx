"use client";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";

export function ResendVerificationButton() {
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState("");

	const handleResend = async () => {
		setLoading(true);
		setError("");

		try {
			const res = await fetch("/api/auth/verify-email/request", {
				method: "POST",
			});

			if (res.ok) {
				setSent(true);
			} else {
				const data = await res.json();
				setError(data.message || "Failed to send.");
			}
		} catch {
			setError("Something went wrong.");
		} finally {
			setLoading(false);
		}
	};

	if (sent) {
		return (
			<span className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary">
				<Send className="h-4 w-4" />
				Verification email sent!
			</span>
		);
	}

	return (
		<div>
			<button
				onClick={handleResend}
				disabled={loading}
				className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
			>
				{loading ? (
					<>
						<Loader2 className="h-4 w-4 animate-spin" />
						Sending...
					</>
				) : (
					<>
						<Send className="h-4 w-4" />
						Verify Email
					</>
				)}
			</button>
			{error && <p className="text-xs text-red-400 mt-1">{error}</p>}
		</div>
	);
}
