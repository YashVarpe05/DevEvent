"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

// Route-level error boundary (renders inside the root layout). Reports to
// Sentry and offers recovery without a full reload.
export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<main
			style={{
				minHeight: "70vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "24px",
				background: "var(--bg-base)",
			}}
		>
			<div style={{ maxWidth: "440px", textAlign: "center" }}>
				<p
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: "12px",
						letterSpacing: "0.1em",
						textTransform: "uppercase",
						color: "var(--accent)",
						marginBottom: "16px",
					}}
				>
					Something went wrong
				</p>
				<h1 style={{ fontSize: "26px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px" }}>
					This page hit an error
				</h1>
				<p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.6, margin: "0 0 28px" }}>
					We&apos;ve been notified. Try again, or return to browsing events.
				</p>
				<div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
					<button
						onClick={reset}
						style={{
							background: "var(--accent)",
							color: "var(--bg-base)",
							border: "none",
							borderRadius: "var(--radius-md)",
							padding: "12px 28px",
							fontWeight: 600,
							fontSize: "15px",
							cursor: "pointer",
						}}
					>
						Try again
					</button>
					<Link
						href="/events"
						style={{
							display: "inline-flex",
							alignItems: "center",
							border: "1px solid var(--border-subtle)",
							color: "var(--text-primary)",
							borderRadius: "var(--radius-md)",
							padding: "12px 28px",
							fontWeight: 500,
							fontSize: "15px",
							textDecoration: "none",
						}}
					>
						Browse events
					</Link>
				</div>
			</div>
		</main>
	);
}
