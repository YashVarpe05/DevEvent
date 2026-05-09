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
			<span
				style={{
					display: "inline-flex",
					alignItems: "center",
					gap: "6px",
					background: "rgba(42,157,111,0.08)",
					border: "1px solid rgba(42,157,111,0.25)",
					color: "var(--green)",
					fontFamily: "var(--font-mono)",
					fontSize: "12px",
					fontWeight: 600,
					padding: "8px 16px",
					borderRadius: "var(--radius-md)",
				}}
			>
				<Send style={{ width: "14px", height: "14px" }} />
				Verification email sent!
			</span>
		);
	}

	return (
		<div>
			<button
				onClick={handleResend}
				disabled={loading}
				style={{
					display: "inline-flex",
					alignItems: "center",
					gap: "6px",
					background: "var(--gold)",
					color: "var(--text-inverse)",
					fontSize: "13px",
					fontWeight: 600,
					padding: "8px 16px",
					borderRadius: "var(--radius-md)",
					border: "none",
					cursor: loading ? "not-allowed" : "pointer",
					opacity: loading ? 0.5 : 1,
					transition: "all 160ms ease",
				}}
			>
				{loading ? (
					<>
						<Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />
						Sending...
					</>
				) : (
					<>
						<Send style={{ width: "14px", height: "14px" }} />
						Verify Email
					</>
				)}
			</button>
			{error && (
				<p style={{ fontSize: "12px", color: "var(--red)", marginTop: "4px" }}>
					{error}
				</p>
			)}
		</div>
	);
}
