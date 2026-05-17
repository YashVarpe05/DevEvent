export const dynamic = 'force-dynamic';
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { CalendarDays, Users, CalendarCheck, IndianRupee, User } from "lucide-react";

export const metadata = {
	title: "Organizer Dashboard | DevEvent",
};

export default async function OrganizerDashboard() {
	const session = await auth();
	const firstName = session?.user?.name?.split(" ")[0] || "Organizer";

	const statCards = [
		{ label: "TOTAL EVENTS", value: "0", Icon: CalendarDays },
		{ label: "TOTAL ATTENDEES", value: "0", Icon: Users },
		{ label: "UPCOMING EVENTS", value: "0", Icon: CalendarCheck },
	];

	const quickActions = [
		{
			href: "/organizer/events",
			Icon: CalendarDays,
			title: "My Events",
			subtitle: "Manage your events",
		},
		{
			href: "/organizer/payouts",
			Icon: IndianRupee,
			title: "Payouts",
			subtitle: "Track earnings",
		},
		{
			href: "/organizer/settings/profile",
			Icon: User,
			title: "Profile",
			subtitle: "Edit your details",
		},
	];

	return (
		<div style={{ padding: "32px 32px 48px", maxWidth: "1100px" }}>
			{/* SECTION 1 — Header */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "32px",
					flexWrap: "wrap" as const,
					gap: "16px",
				}}
			>
				<div>
					<span
						style={{
							fontSize: "10px",
							color: "var(--gold)",
							textTransform: "uppercase",
							letterSpacing: "0.14em",
							fontFamily: "var(--font-mono)",
							display: "block",
							marginBottom: "6px",
						}}
					>
						Organizer
					</span>
					<h1
						style={{
							fontFamily: "var(--font-serif)",
							fontSize: "32px",
							fontWeight: 600,
							color: "var(--text-primary)",
							lineHeight: 1.2,
						}}
					>
						Welcome back,{" "}
						<em style={{ color: "var(--gold)", fontStyle: "italic" }}>
							{firstName}
						</em>
					</h1>
					<p
						style={{
							color: "var(--text-muted)",
							fontSize: "14px",
							marginTop: "6px",
						}}
					>
						Here&apos;s what&apos;s happening with your events
					</p>
				</div>

				<div style={{ display: "flex", gap: "10px" }}>
					<Link
						href="/organizer/settings/profile"
						className="dash-btn-secondary"
						style={{
							padding: "10px 18px",
							background: "var(--bg-surface)",
							border: "1px solid var(--border-dim)",
							color: "var(--text-primary)",
							borderRadius: "var(--radius-md)",
							fontSize: "13px",
							fontWeight: 500,
							textDecoration: "none",
							transition: "all 160ms ease",
							display: "inline-flex",
							alignItems: "center",
						}}
					>
						Settings
					</Link>
					<Link
						href="/organizer/events/new"
						className="dash-btn-gold"
						style={{
							padding: "10px 18px",
							background: "var(--gold)",
							color: "#08080A",
							border: "none",
							borderRadius: "var(--radius-md)",
							fontSize: "13px",
							fontWeight: 600,
							textDecoration: "none",
							transition: "all 160ms ease",
							display: "inline-flex",
							alignItems: "center",
						}}
					>
						Create Event +
					</Link>
				</div>
			</div>

			{/* SECTION 2 — Quick Actions */}
			<div
				style={{
					display: "flex",
					gap: "12px",
					marginBottom: "32px",
					flexWrap: "wrap" as const,
				}}
			>
				{quickActions.map((action) => (
					<Link
						key={action.href}
						href={action.href}
						className="quick-action-card"
						style={{
							background: "var(--bg-surface)",
							border: "1px solid var(--border-dim)",
							borderRadius: "var(--radius-lg)",
							padding: "16px 20px",
							textDecoration: "none",
							display: "flex",
							alignItems: "center",
							gap: "12px",
							flex: 1,
							minWidth: "180px",
							transition: "all 160ms ease",
							cursor: "pointer",
						}}
					>
						<div
							style={{
								width: "32px",
								height: "32px",
								background: "var(--gold-subtle)",
								border: "1px solid rgba(255,107,53,0.15)",
								borderRadius: "4px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flexShrink: 0,
							}}
						>
							<action.Icon size={16} style={{ color: "var(--gold)" }} />
						</div>
						<div>
							<div
								style={{
									fontSize: "13px",
									fontWeight: 500,
									color: "var(--text-primary)",
								}}
							>
								{action.title}
							</div>
							<div
								style={{
									fontSize: "11px",
									color: "var(--text-muted)",
									marginTop: "1px",
								}}
							>
								{action.subtitle}
							</div>
						</div>
					</Link>
				))}
			</div>

			{/* SECTION 3 — Stats Grid */}
			<div
				className="stats-grid"
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(3, 1fr)",
					gap: "12px",
					marginBottom: "32px",
				}}
			>
				{statCards.map((stat) => (
					<div
						key={stat.label}
						className="stat-card"
						style={{
							background: "var(--bg-surface)",
							border: "1px solid var(--border-dim)",
							borderRadius: "var(--radius-lg)",
							padding: "20px 24px",
							transition: "all 200ms ease",
						}}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
							}}
						>
							<span
								style={{
									fontSize: "10px",
									textTransform: "uppercase",
									color: "var(--gold)",
									letterSpacing: "0.14em",
									fontFamily: "var(--font-mono)",
									fontWeight: 500,
								}}
							>
								{stat.label}
							</span>
							<div
								style={{
									width: "32px",
									height: "32px",
									background: "var(--gold-subtle)",
									border: "1px solid rgba(255,107,53,0.15)",
									borderRadius: "4px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<stat.Icon size={16} style={{ color: "var(--gold)" }} />
							</div>
						</div>
						<div
							style={{
								fontFamily: "var(--font-mono)",
								fontSize: "36px",
								fontWeight: 600,
								color: "var(--text-primary)",
								marginTop: "12px",
								lineHeight: 1,
							}}
						>
							{stat.value}
						</div>
					</div>
				))}
			</div>

			{/* SECTION 4 — Empty State */}
			<div
				style={{
					background: "var(--bg-surface)",
					border: "1px solid var(--border-dim)",
					borderRadius: "var(--radius-lg)",
					padding: "56px 24px",
					textAlign: "center",
				}}
			>
				<div
					style={{
						width: "56px",
						height: "56px",
						background: "var(--gold-subtle)",
						border: "1px solid rgba(255,107,53,0.15)",
						borderRadius: "var(--radius-md)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						margin: "0 auto 16px",
					}}
				>
					<CalendarDays size={24} style={{ color: "var(--gold)" }} />
				</div>

				<h3
					style={{
						fontFamily: "var(--font-serif)",
						fontSize: "20px",
						fontWeight: 600,
						color: "var(--text-primary)",
						marginBottom: "8px",
					}}
				>
					No events yet
				</h3>
				<p
					style={{
						color: "var(--text-muted)",
						fontSize: "14px",
						marginBottom: "24px",
						maxWidth: "340px",
						margin: "0 auto 24px",
						lineHeight: 1.6,
					}}
				>
					Create your first tech event and start building your developer
					community.
				</p>

				<Link
					href="/organizer/events/new"
					className="dash-btn-gold"
					style={{
						height: "44px",
						padding: "0 20px",
						background: "var(--gold)",
						color: "#08080A",
						border: "none",
						borderRadius: "var(--radius-md)",
						fontSize: "14px",
						fontWeight: 600,
						textDecoration: "none",
						display: "inline-flex",
						alignItems: "center",
						transition: "background 160ms ease",
					}}
				>
					Create Your First Event →
				</Link>
			</div>

			<style>{`
				.dash-btn-secondary:hover {
					background: var(--bg-elevated) !important;
					border-color: var(--border) !important;
				}
				.dash-btn-gold:hover {
					background: #FF8555 !important;
				}
				.quick-action-card:hover {
					border-color: var(--border-bright) !important;
					transform: translateY(-1px);
				}
				.stat-card:hover {
					border-color: var(--border-bright) !important;
					transform: translateY(-1px);
				}
				@media (max-width: 768px) {
					.stats-grid {
						grid-template-columns: 1fr !important;
					}
				}
			`}</style>
		</div>
	);
}
