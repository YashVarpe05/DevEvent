export const dynamic = 'force-dynamic';
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Event, { IEvent } from "@/database/event.model";
import { redirect } from "next/navigation";
import { Calendar, MapPin, MoreVertical, Plus, Edit2, CheckCircle, Clock } from "lucide-react";

export const metadata = {
	title: "My Events | DevEvent",
};

export default async function OrganizerEventsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ status?: string }> 
}) {
	const session = await auth();
	
	if (!session?.user?.id) {
		redirect("/login");
	}

	const params = await searchParams;
	const currentStatus = params.status || "all";

	await connectDB();

	const query: any = { organizerId: session.user.id, deletedAt: null };
	if (currentStatus !== "all") {
		query.status = currentStatus;
	}

	const events = await Event.find(query).sort({ createdAt: -1 }).lean() as IEvent[];

	return (
		<div style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
			<div className="flex justify-between items-center flex-wrap gap-4 mb-8">
				<div>
					<h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 600, color: "var(--text-primary)" }}>My Events</h1>
					<p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
						Manage your drafts and published events
					</p>
				</div>
				<div className="flex gap-4">
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
							display: "flex",
							alignItems: "center",
							gap: "8px",
							boxShadow: "0 0 16px rgba(212, 175, 55, 0.3)",
							transition: "all 0.2s"
						}}
						onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 24px rgba(212, 175, 55, 0.5)"}
						onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 0 16px rgba(212, 175, 55, 0.3)"}
					>
						<Plus className="w-4 h-4" />
						Create Event
					</Link>
				</div>
			</div>

			<div className="mb-6" style={{ borderBottom: "1px solid var(--border-dim)" }}>
				<nav className="flex space-x-8">
					<Link
						href="/organizer/events"
						style={{
							paddingBottom: "16px",
							fontSize: "14px",
							fontWeight: 500,
							color: currentStatus === "all" ? "var(--gold)" : "var(--text-muted)",
							borderBottom: currentStatus === "all" ? "2px solid var(--gold)" : "2px solid transparent",
							textDecoration: "none",
							transition: "all 0.2s"
						}}
						onMouseEnter={(e) => { if (currentStatus !== "all") e.currentTarget.style.color = "var(--text-primary)"; }}
						onMouseLeave={(e) => { if (currentStatus !== "all") e.currentTarget.style.color = "var(--text-muted)"; }}
					>
						All Events
					</Link>
					<Link
						href="/organizer/events?status=draft"
						style={{
							paddingBottom: "16px",
							fontSize: "14px",
							fontWeight: 500,
							color: currentStatus === "draft" ? "var(--gold)" : "var(--text-muted)",
							borderBottom: currentStatus === "draft" ? "2px solid var(--gold)" : "2px solid transparent",
							textDecoration: "none",
							transition: "all 0.2s"
						}}
						onMouseEnter={(e) => { if (currentStatus !== "draft") e.currentTarget.style.color = "var(--text-primary)"; }}
						onMouseLeave={(e) => { if (currentStatus !== "draft") e.currentTarget.style.color = "var(--text-muted)"; }}
					>
						Drafts
					</Link>
					<Link
						href="/organizer/events?status=published"
						style={{
							paddingBottom: "16px",
							fontSize: "14px",
							fontWeight: 500,
							color: currentStatus === "published" ? "var(--gold)" : "var(--text-muted)",
							borderBottom: currentStatus === "published" ? "2px solid var(--gold)" : "2px solid transparent",
							textDecoration: "none",
							transition: "all 0.2s"
						}}
						onMouseEnter={(e) => { if (currentStatus !== "published") e.currentTarget.style.color = "var(--text-primary)"; }}
						onMouseLeave={(e) => { if (currentStatus !== "published") e.currentTarget.style.color = "var(--text-muted)"; }}
					>
						Published
					</Link>
				</nav>
			</div>

			{events.length === 0 ? (
				<div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-lg)", padding: "48px", textAlign: "center" }}>
					<div style={{ width: "64px", height: "64px", background: "var(--bg-elevated)", color: "var(--gold)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
						<Calendar className="w-8 h-8" />
					</div>
					<h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>No events found</h3>
					<p style={{ color: "var(--text-secondary)", maxWidth: "380px", margin: "0 auto 24px", fontSize: "14px" }}>
						{currentStatus === "all" 
							? "You haven't created any events yet." 
							: `You don't have any events with status '${currentStatus}'.`}
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
					>
						Create Event
					</Link>
				</div>
			) : (
				<div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
					<ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
						{events.map((event, i) => (
							<li key={event._id?.toString()} style={{ borderTop: i > 0 ? "1px solid var(--border-dim)" : "none", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-elevated)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
								<div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
									<div style={{ flex: 1, minWidth: 0, paddingRight: "16px" }}>
										<div className="flex items-center gap-3 mb-1">
											<h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
												{event.title}
											</h3>
											<span style={{ 
												padding: "2px 10px", 
												borderRadius: "9999px", 
												fontSize: "11px", 
												fontWeight: 600, 
												textTransform: "uppercase",
												letterSpacing: "0.05em",
												background: event.status === 'published' ? "rgba(16, 185, 129, 0.1)" : "var(--bg-elevated)", 
												color: event.status === 'published' ? "var(--green)" : "var(--text-secondary)", 
												border: `1px solid ${event.status === 'published' ? "rgba(16, 185, 129, 0.2)" : "var(--border-dim)"}`
											}}>
												{event.status}
											</span>
											<span style={{ 
												padding: "2px 10px", 
												borderRadius: "9999px", 
												fontSize: "11px", 
												fontWeight: 600, 
												textTransform: "uppercase",
												letterSpacing: "0.05em",
												background: "var(--bg-elevated)", 
												color: "var(--text-secondary)", 
												border: "1px solid var(--border-dim)"
											}}>
												{event.eventType}
											</span>
										</div>
										
										<div className="flex items-center gap-4 mt-2" style={{ color: "var(--text-muted)", fontSize: "13px" }}>
											{event.startAt && (
												<div className="flex items-center gap-1.5">
													<Clock className="w-4 h-4" />
													{new Date(event.startAt).toLocaleDateString()}
												</div>
											)}
											
											{(event.eventType === 'offline' || event.eventType === 'hybrid') && (
												<div className="flex items-center gap-1.5">
													<MapPin className="w-4 h-4" />
													<span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>
														{event.location?.city ? `${event.location.city}, ${event.location.country}` : 'Location TBD'}
													</span>
												</div>
											)}

											<div className="flex items-center gap-1.5">
												<div style={{ width: "18px", height: "18px", borderRadius: "4px", background: "var(--bg-elevated)", border: "1px solid var(--border-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "var(--gold)" }}>
													{event.currency === 'USD' ? '$' : event.currency}
												</div>
												<span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
													{event.isPaid ? (event.basePrice || 0) : 'Free'}
												</span>
											</div>
										</div>
									</div>
									
									<div className="flex items-center gap-3">
										{event.status === 'published' && (
											<Link 
												href={`/events/${event.slug}`} 
												target="_blank"
												style={{ padding: "8px", color: "var(--text-muted)", transition: "color 0.2s" }}
												title="View Public Page"
												onMouseEnter={(e) => e.currentTarget.style.color = "var(--green)"}
												onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
											>
												<CheckCircle className="w-5 h-5" />
											</Link>
										)}
										<Link 
											href={`/organizer/events/${event._id}/edit`}
											style={{
												display: "flex",
												alignItems: "center",
												gap: "8px",
												padding: "6px 14px",
												background: "var(--bg-elevated)",
												border: "1px solid var(--border-dim)",
												color: "var(--text-primary)",
												borderRadius: "var(--radius-md)",
												fontSize: "13px",
												fontWeight: 500,
												textDecoration: "none",
												transition: "all 0.2s"
											}}
											onMouseEnter={(e) => { e.currentTarget.style.background = "var(--border-dim)"; }}
											onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
										>
											<Edit2 className="w-4 h-4" />
											Edit
										</Link>
										<Link href={`/organizer/events/${event._id}/attendees`} style={{ background: "none", border: "none", color: "var(--text-muted)", padding: "8px", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
											<MoreVertical className="w-5 h-5" />
										</Link>
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
