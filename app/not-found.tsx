import Link from "next/link";

export const metadata = {
	title: "Page Not Found | DevEvent",
};

// Branded 404 — shown for unmatched routes and any notFound() call.
export default function NotFound() {
	return (
		<main
			style={{
				minHeight: "80vh",
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
						fontSize: "64px",
						fontWeight: 700,
						color: "var(--accent)",
						margin: "0 0 8px",
						lineHeight: 1,
					}}
				>
					404
				</p>
				<h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px" }}>
					This page doesn&apos;t exist
				</h1>
				<p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.6, margin: "0 0 28px" }}>
					The event or page you&apos;re looking for may have been moved, unpublished, or never existed.
				</p>
				<div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
					<Link
						href="/events"
						style={{
							background: "var(--accent)",
							color: "var(--bg-base)",
							borderRadius: "var(--radius-md)",
							padding: "12px 28px",
							fontWeight: 600,
							fontSize: "15px",
							textDecoration: "none",
						}}
					>
						Browse events
					</Link>
					<Link
						href="/"
						style={{
							border: "1px solid var(--border-subtle)",
							color: "var(--text-primary)",
							borderRadius: "var(--radius-md)",
							padding: "12px 28px",
							fontWeight: 500,
							fontSize: "15px",
							textDecoration: "none",
						}}
					>
						Go home
					</Link>
				</div>
			</div>
		</main>
	);
}
