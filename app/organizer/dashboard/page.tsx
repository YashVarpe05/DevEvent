export const dynamic = 'force-dynamic';
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { CalendarDays, Users, CalendarCheck, IndianRupee, User } from "lucide-react";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Registration from "@/database/registration.model";

export const metadata = {
	title: "Organizer Dashboard | DevEvent",
};

export default async function OrganizerDashboard() {
	const session = await auth();
	const firstName = session?.user?.name?.split(" ")[0] || "Organizer";

	let totalEvents = 0;
	let upcomingEvents = 0;
	let totalAttendees = 0;
	let recentEvents: any[] = [];

	const organizerId = session?.user?.id;
	if (organizerId) {
		await connectDB();

		// Total events this organizer has created
		totalEvents = await Event.countDocuments({
			organizerId,
			deletedAt: null,
		});

		// Upcoming events (published, startAt in future)
		upcomingEvents = await Event.countDocuments({
			organizerId,
			deletedAt: null,
			status: "published",
			startAt: { $gte: new Date() },
		});

		// Get all event IDs for this organizer
		const organizerEventIds = await Event.find(
			{ organizerId, deletedAt: null },
			{ _id: 1 }
		).lean();

		const eventIds = organizerEventIds.map((e: any) => e._id);

		// Total confirmed attendees across all events
		totalAttendees = eventIds.length > 0
			? await Registration.countDocuments({
					eventId: { $in: eventIds },
					status: "confirmed",
			  })
			: 0;

		// Fetch last 3 events
		recentEvents = await Event.find(
			{ organizerId, deletedAt: null },
			{
				title: 1,
				status: 1,
				startAt: 1,
				slug: 1,
				eventType: 1,
				isPaid: 1,
				basePrice: 1,
				currency: 1,
			}
		)
			.sort({ createdAt: -1 })
			.limit(3)
			.lean();
	}

	const statCards = [
		{ label: "TOTAL EVENTS", value: String(totalEvents), Icon: CalendarDays },
		{ label: "TOTAL ATTENDEES", value: String(totalAttendees), Icon: Users },
		{ label: "UPCOMING EVENTS", value: String(upcomingEvents), Icon: CalendarCheck },
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

			{/* SECTION 4 — Recent Events */}
			{recentEvents.length > 0 && (
				<div style={{
					background: 'var(--bg-surface)',
					border: '1px solid var(--border-dim)',
					borderRadius: 'var(--radius-lg)',
					overflow: 'hidden',
					marginBottom: '24px',
				}}>
					<div style={{
						padding: '16px 20px',
						borderBottom: '1px solid var(--border-dim)',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}>
						<span style={{
							fontSize: '12px',
							fontWeight: 500,
							color: 'var(--text-secondary)',
							textTransform: 'uppercase',
							letterSpacing: '0.08em',
						}}>
							Recent Events
						</span>
						<Link href="/organizer/events" 
							style={{
								fontSize: '12px',
								color: 'var(--gold)',
								textDecoration: 'none',
							}}>
							View all →
						</Link>
					</div>
					
					{recentEvents.map((event: any, i: number) => (
						<div key={event._id.toString()} style={{
							padding: '14px 20px',
							borderBottom: i < recentEvents.length - 1 
								? '1px solid var(--border-dim)' 
								: 'none',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							gap: '12px',
						}}>
							<div style={{ flex: 1, minWidth: 0 }}>
								<p style={{
									fontSize: '14px',
									fontWeight: 500,
									color: 'var(--text-primary)',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
								}}>
									{event.title}
								</p>
								<p style={{
									fontSize: '11px',
									color: 'var(--text-muted)',
									fontFamily: 'var(--font-mono)',
									marginTop: '2px',
								}}>
									{event.startAt 
										? new Date(event.startAt)
												.toLocaleDateString('en-IN', {
													day: 'numeric',
													month: 'short',
													year: 'numeric',
												})
										: 'No date set'}
								</p>
							</div>
							
							<div style={{
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								flexShrink: 0,
							}}>
								<span style={{
									fontSize: '10px',
									fontWeight: 500,
									letterSpacing: '0.06em',
									textTransform: 'uppercase',
									padding: '2px 7px',
									borderRadius: '2px',
									border: '1px solid',
									borderColor: event.status === 'published'
										? 'rgba(42,157,111,0.3)'
										: 'var(--border)',
									color: event.status === 'published'
										? 'var(--green)'
										: 'var(--text-muted)',
									background: event.status === 'published'
										? 'rgba(42,157,111,0.08)'
										: 'transparent',
								}}>
									{event.status}
								</span>
								
								<Link 
									href={`/organizer/events/${
										event._id.toString()
									}/edit`}
									style={{
										fontSize: '12px',
										color: 'var(--text-muted)',
										textDecoration: 'none',
										padding: '4px 8px',
										border: '1px solid var(--border-dim)',
										borderRadius: 'var(--radius-sm)',
									}}>
									Edit
								</Link>
							</div>
						</div>
					))}
				</div>
			)}

			{/* SECTION 5 — Empty State / Footer */}
			{totalEvents === 0 ? (
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
			) : (
				<div>
					<p style={{
						color: 'var(--text-muted)',
						fontSize: '14px',
						textAlign: 'center'
					}}>
						You have {totalEvents} event{totalEvents !== 1 ? 's' : ''}.{' '}
						<Link href="/organizer/events" 
							style={{color: 'var(--gold)', textDecoration: 'none'}}>
							View all events →
						</Link>
					</p>
				</div>
			)}

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
