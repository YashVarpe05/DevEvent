export const dynamic = 'force-dynamic';
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";

export const metadata = {
	title: "Organizer Dashboard | DevEvent",
};

export default async function OrganizerDashboard() {
	const session = await auth();

	return (
		<div style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 600, color: "var(--text-primary)" }}>
						Organizer Dashboard
					</h1>
					<p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
						Welcome back, {session?.user?.name || "Organizer"}!
					</p>
				</div>
				<div className="flex gap-4">
					<Link
						href="/organizer/settings/profile"
						style={{
							padding: "8px 16px",
							background: "var(--bg-surface)",
							border: "1px solid var(--border-dim)",
							color: "var(--text-primary)",
							borderRadius: "var(--radius-md)",
							fontSize: "14px",
							fontWeight: 500,
							textDecoration: "none",
							transition: "all 0.2s"
						}}
						onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-elevated)"}
						onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg-surface)"}
					>
						Settings
					</Link>
					<Link
						href="/organizer/events/new"
						style={{
							padding: "8px 16px",
							background: "var(--gold)",
							color: "#000",
							border: "none",
							borderRadius: "var(--radius-md)",
							fontSize: "14px",
							fontWeight: 600,
							textDecoration: "none",
							boxShadow: "0 0 16px rgba(212, 175, 55, 0.3)",
							transition: "all 0.2s"
						}}
						onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 24px rgba(212, 175, 55, 0.5)"}
						onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 0 16px rgba(212, 175, 55, 0.3)"}
					>
						Create Event
					</Link>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<div style={{ padding: "24px", background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-lg)" }}>
					<h3 style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px" }}>Total Events</h3>
					<p style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>0</p>
				</div>
				<div style={{ padding: "24px", background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-lg)" }}>
					<h3 style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px" }}>Total Attendees</h3>
					<p style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>0</p>
				</div>
				<div style={{ padding: "24px", background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-lg)" }}>
					<h3 style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px" }}>Upcoming Events</h3>
					<p style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>0</p>
				</div>
			</div>

			<div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-lg)", padding: "48px", textAlign: "center" }}>
				<div style={{ width: "64px", height: "64px", background: "var(--bg-elevated)", color: "var(--gold)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
					<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
				</div>
				<h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>You don't have any events yet</h3>
				<p style={{ color: "var(--text-secondary)", maxWidth: "380px", margin: "0 auto 24px", fontSize: "14px" }}>
					Create your first tech event to start building your community.
				</p>
				<Link
					href="/organizer/events/new"
					style={{
						padding: "10px 20px",
						background: "var(--gold)",
						color: "#000",
						border: "none",
						borderRadius: "var(--radius-md)",
						fontSize: "14px",
						fontWeight: 600,
						textDecoration: "none",
						display: "inline-flex",
						boxShadow: "0 0 16px rgba(212, 175, 55, 0.3)",
						transition: "all 0.2s"
					}}
					onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 24px rgba(212, 175, 55, 0.5)"}
					onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 0 16px rgba(212, 175, 55, 0.3)"}
				>
					Create Your First Event
				</Link>
			</div>
		</div>
	);
}
