export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import OrganizerProfile from "@/database/organizer-profile.model";
import Event from "@/database/event.model";
import { MapPin, CalendarDays, Users2 } from "lucide-react";

export const metadata: Metadata = {
	title: "Organizers | DevEvent",
	description:
		"Discover event organizers on DevEvent — communities, companies, and individuals hosting developer events across India.",
};

type OrganizerCard = {
	slug: string;
	displayName: string;
	bio: string;
	avatarUrl?: string;
	location: { city: string; country: string };
	organizationType: string;
	eventCount: number;
};

async function loadOrganizers(): Promise<OrganizerCard[]> {
	await connectDB();

	const organizers = await OrganizerProfile.find({ isPublic: true })
		.sort({ createdAt: -1 })
		.limit(60)
		.lean();

	// Count published events for each organizer in parallel
	const results = await Promise.all(
		organizers.map(async (org) => {
			const eventCount = await Event.countDocuments({
				organizerId: org.userId,
				status: "published",
				deletedAt: null,
			});

			return {
				slug: org.slug,
				displayName: org.displayName,
				bio: org.bio || "",
				avatarUrl: org.avatarUrl,
				location: org.location,
				organizationType: org.organizationType,
				eventCount,
			};
		}),
	);

	return results;
}

const typeLabels: Record<string, string> = {
	individual: "Individual",
	company: "Company",
	community: "Community",
	university: "University",
	nonprofit: "Nonprofit",
	other: "Organization",
};

export default async function OrganizersPage() {
	const organizers = await loadOrganizers();

	return (
		<main style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px 80px" }}>
			{/* Header */}
			<div style={{ marginBottom: "40px" }}>
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
					Community
				</span>
				<h1
					style={{
						fontFamily: "var(--font-serif, inherit)",
						fontSize: "36px",
						fontWeight: 600,
						color: "var(--text-primary, #E8E6E3)",
						lineHeight: 1.2,
					}}
				>
					Event Organizers
				</h1>
				<p
					style={{
						color: "var(--text-muted, #4E4E58)",
						fontSize: "15px",
						marginTop: "8px",
						maxWidth: "520px",
						lineHeight: 1.6,
					}}
				>
					Communities, companies, and individuals hosting developer events on
					DevEvent.
				</p>
			</div>

			{/* Grid */}
			{organizers.length === 0 ? (
				<div
					style={{
						background: "var(--bg-surface, #12131a)",
						border: "1px solid var(--border-dim, #1A1A1D)",
						borderRadius: "var(--radius-lg, 10px)",
						padding: "64px 24px",
						textAlign: "center",
					}}
				>
					<Users2
						size={40}
						style={{ color: "var(--text-muted, #4E4E58)", margin: "0 auto 16px" }}
					/>
					<h3
						style={{
							fontFamily: "var(--font-serif, inherit)",
							fontSize: "20px",
							fontWeight: 600,
							color: "var(--text-primary, #E8E6E3)",
							marginBottom: "8px",
						}}
					>
						No organizers yet
					</h3>
					<p
						style={{
							color: "var(--text-muted, #4E4E58)",
							fontSize: "14px",
							marginBottom: "24px",
						}}
					>
						Be the first to host a developer event on DevEvent.
					</p>
					<Link
						href="/become-organizer"
						style={{
							display: "inline-flex",
							alignItems: "center",
							padding: "10px 20px",
							background: "var(--gold, #FF6B35)",
							color: "#08080A",
							borderRadius: "var(--radius-md, 6px)",
							fontWeight: 600,
							fontSize: "14px",
							textDecoration: "none",
							transition: "background 160ms ease",
						}}
					>
						Become an Organizer →
					</Link>
				</div>
			) : (
				<div
					className="organizers-grid"
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
						gap: "16px",
					}}
				>
					{organizers.map((org) => (
						<Link
							key={org.slug}
							href={`/organizers/${org.slug}`}
							className="org-card"
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
							{/* Top row: avatar + name */}
							<div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
								<div
									style={{
										width: "48px",
										height: "48px",
										borderRadius: "50%",
										background: org.avatarUrl
											? `url(${org.avatarUrl}) center/cover no-repeat`
											: "var(--gold-subtle, #1A0A05)",
										border: org.avatarUrl
											? "2px solid var(--border-dim, #1A1A1D)"
											: "1px solid rgba(255,107,53,0.15)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										flexShrink: 0,
										fontSize: "18px",
										fontWeight: 700,
										color: "var(--gold, #FF6B35)",
									}}
								>
									{!org.avatarUrl && (org.displayName || "?").charAt(0).toUpperCase()}
								</div>
								<div style={{ minWidth: 0 }}>
									<div
										style={{
											fontSize: "16px",
											fontWeight: 600,
											color: "var(--text-primary, #E8E6E3)",
											whiteSpace: "nowrap",
											overflow: "hidden",
											textOverflow: "ellipsis",
										}}
									>
										{org.displayName}
									</div>
									<span
										style={{
											fontSize: "10px",
											textTransform: "uppercase",
											letterSpacing: "0.1em",
											fontFamily: "var(--font-mono)",
											color: "var(--gold, #FF6B35)",
											fontWeight: 500,
										}}
									>
										{typeLabels[org.organizationType] || "Organization"}
									</span>
								</div>
							</div>

							{/* Bio */}
							{org.bio && (
								<p
									style={{
										fontSize: "13px",
										color: "var(--text-muted, #4E4E58)",
										lineHeight: 1.6,
										display: "-webkit-box",
										WebkitLineClamp: 2,
										WebkitBoxOrient: "vertical",
										overflow: "hidden",
									}}
								>
									{org.bio}
								</p>
							)}

							{/* Footer meta */}
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "16px",
									fontSize: "12px",
									color: "var(--text-muted, #4E4E58)",
									fontFamily: "var(--font-mono)",
									marginTop: "auto",
								}}
							>
								{org.location?.city && (
									<span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
										<MapPin size={12} />
										{org.location.city}
										{org.location.country ? `, ${org.location.country}` : ""}
									</span>
								)}
								<span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
									<CalendarDays size={12} />
									{org.eventCount} {org.eventCount === 1 ? "event" : "events"}
								</span>
							</div>
						</Link>
					))}
				</div>
			)}

			<style>{`
				.org-card:hover {
					border-color: var(--border-bright, #2A2A2E) !important;
					transform: translateY(-2px);
				}
				@media (max-width: 640px) {
					.organizers-grid {
						grid-template-columns: 1fr !important;
					}
				}
			`}</style>
		</main>
	);
}
