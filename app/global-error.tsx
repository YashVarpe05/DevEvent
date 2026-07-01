"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// global-error replaces the root layout when an error is thrown in it, so it
// must render its own <html>/<body>. This is also where uncaught client errors
// are reported to Sentry (inert without a DSN).
export default function GlobalError({
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
		<html lang="en">
			<body
				style={{
					margin: 0,
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "#0A0A0B",
					color: "#E8E6E3",
					fontFamily: "system-ui, -apple-system, sans-serif",
					padding: "24px",
				}}
			>
				<div style={{ maxWidth: "440px", textAlign: "center" }}>
					<p
						style={{
							fontFamily: "ui-monospace, monospace",
							fontSize: "12px",
							letterSpacing: "0.1em",
							textTransform: "uppercase",
							color: "#FF6B35",
							marginBottom: "16px",
						}}
					>
						Something went wrong
					</p>
					<h1 style={{ fontSize: "26px", fontWeight: 700, margin: "0 0 12px" }}>
						An unexpected error occurred
					</h1>
					<p style={{ color: "#6B6B74", fontSize: "15px", lineHeight: 1.6, margin: "0 0 28px" }}>
						We&apos;ve been notified and are looking into it. You can try again, or
						head back to the homepage.
					</p>
					<button
						onClick={reset}
						style={{
							background: "#FF6B35",
							color: "#0A0A0B",
							border: "none",
							borderRadius: "6px",
							padding: "12px 28px",
							fontWeight: 600,
							fontSize: "15px",
							cursor: "pointer",
						}}
					>
						Try again
					</button>
				</div>
			</body>
		</html>
	);
}
