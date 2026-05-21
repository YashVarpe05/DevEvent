import type { Metadata } from "next";
import Link from "next/link";
import { Users, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
	title: "Admin Dashboard | DevEvent",
	description: "DevEvent admin dashboard",
};

const adminSections = [
	{
		href: "/admin/organizers/applications",
		Icon: Users,
		title: "Organizer Applications",
		description: "Review and manage organizer requests",
	},
	{
		href: "/admin/payments/risk",
		Icon: ShieldAlert,
		title: "Payment Risk",
		description: "Monitor flagged payments and disputes",
	},
];

export default function AdminDashboard() {
	return (
		<div style={{ padding: "32px 32px 48px", maxWidth: "900px", margin: "0 auto" }}>
			{/* Header */}
			<div style={{ marginBottom: "32px" }}>
				<span
					style={{
						fontSize: "10px",
						color: "var(--gold, #FF6B35)",
						textTransform: "uppercase",
						letterSpacing: "0.14em",
						fontFamily: "var(--font-mono)",
						display: "block",
						marginBottom: "6px",
					}}
				>
					Admin
				</span>
				<h1
					style={{
						fontFamily: "var(--font-serif, inherit)",
						fontSize: "32px",
						fontWeight: 600,
						color: "var(--text-primary, #E8E6E3)",
						lineHeight: 1.2,
					}}
				>
					Admin Dashboard
				</h1>
				<p
					style={{
						color: "var(--text-muted, #4E4E58)",
						fontSize: "14px",
						marginTop: "6px",
					}}
				>
					Manage platform operations
				</p>
			</div>

			{/* Section Cards */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
					gap: "16px",
				}}
			>
				{adminSections.map((section) => (
					<Link
						key={section.href}
						href={section.href}
						className="admin-card"
						style={{
							background: "var(--bg-surface, #12131a)",
							border: "1px solid var(--border-dim, #1A1A1D)",
							borderRadius: "var(--radius-lg, 10px)",
							padding: "24px",
							textDecoration: "none",
							display: "flex",
							flexDirection: "column",
							gap: "16px",
							transition: "all 160ms ease",
							cursor: "pointer",
						}}
					>
						<div
							style={{
								width: "40px",
								height: "40px",
								background: "var(--gold-subtle, #1A0A05)",
								border: "1px solid rgba(255,107,53,0.15)",
								borderRadius: "6px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flexShrink: 0,
							}}
						>
							<section.Icon size={20} style={{ color: "var(--gold, #FF6B35)" }} />
						</div>
						<div>
							<div
								style={{
									fontSize: "15px",
									fontWeight: 600,
									color: "var(--text-primary, #E8E6E3)",
									marginBottom: "4px",
								}}
							>
								{section.title}
							</div>
							<div
								style={{
									fontSize: "13px",
									color: "var(--text-muted, #4E4E58)",
									lineHeight: 1.5,
								}}
							>
								{section.description}
							</div>
						</div>
					</Link>
				))}
			</div>

			<style>{`
				.admin-card:hover {
					border-color: var(--border-bright, #2A2A2E) !important;
					transform: translateY(-2px);
				}
			`}</style>
		</div>
	);
}
