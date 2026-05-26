import type { Metadata } from "next";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import OrganizerProfile from "@/database/organizer-profile.model";
import Event from "@/database/event.model";

export const metadata: Metadata = {
	title: "Organizers | DevEvent",
	description: "Discover the best developer community organizers hosting events across India.",
};

export const dynamic = "force-dynamic";

export default async function OrganizersPage() {
	await connectDB();

	const organizers = await OrganizerProfile.find({ isPublic: true }).lean();

	// For each organizer get their event count:
	const organizersWithStats = await Promise.all(
		organizers.map(async (org: any) => {
			const eventCount = await Event.countDocuments({
				organizerProfileId: org._id,
				status: "published",
				deletedAt: null,
			});
			return { ...org, eventCount };
		})
	);

	return (
		<div style={{ background: "var(--bg-base)", minHeight: "100dvh" }}>
			<div
				style={{
					padding: "48px 24px",
					maxWidth: "1100px",
					marginLeft: "auto",
					marginRight: "auto",
				}}
			>
				{/* PAGE HEADER */}
				<div style={{ marginBottom: "40px" }}>
					<span
						style={{
							fontSize: "10px",
							color: "var(--gold)",
							textTransform: "uppercase",
							letterSpacing: "0.14em",
							fontWeight: 500,
							display: "block",
							marginBottom: "8px",
						}}
					>
						// ORGANIZERS
					</span>

					<h1
						style={{
							fontFamily: "var(--font-display)",
							fontSize: "clamp(28px, 4vw, 48px)",
							fontWeight: 600,
							color: "var(--text-primary)",
							letterSpacing: "-0.025em",
							lineHeight: 1.05,
							marginBottom: "12px",
						}}
					>
						Meet the{" "}
						<em style={{ color: "var(--gold)", fontStyle: "italic" }}>
							Community Builders
						</em>
					</h1>

					<p
						style={{
							fontSize: "15px",
							color: "var(--text-muted)",
							maxWidth: "480px",
							lineHeight: 1.65,
						}}
					>
						Discover the organizers building India&apos;s developer community — one
						event at a time.
					</p>
				</div>

				{/* CONTENT */}
				{organizersWithStats.length === 0 ? (
					<div
						style={{
							textAlign: "center",
							padding: "64px 24px",
							background: "var(--bg-surface)",
							border: "1px solid var(--border-dim)",
							borderRadius: "var(--radius-lg)",
						}}
					>
						<p
							style={{
								fontSize: "16px",
								fontFamily: "var(--font-display)",
								color: "var(--text-secondary)",
								marginBottom: "8px",
							}}
						>
							No organizers yet
						</p>
						<p
							style={{
								fontSize: "13px",
								color: "var(--text-muted)",
								marginBottom: "20px",
							}}
						>
							Be the first to host events on DevEvent.
						</p>
						<Link
							href="/become-organizer"
							style={{
								padding: "10px 20px",
								background: "var(--gold)",
								color: "var(--text-inverse, #08080A)",
								borderRadius: "var(--radius-md)",
								fontSize: "13px",
								fontWeight: 600,
								textDecoration: "none",
							}}
						>
							Become an Organizer
						</Link>
					</div>
				) : (
					<div className="organizers-grid">
						{organizersWithStats.map((org: any) => (
							<Link
								href={`/organizers/${org.slug}`}
								key={org._id.toString()}
								style={{
									background: "var(--bg-surface)",
									border: "1px solid var(--border-dim)",
									borderRadius: "var(--radius-lg)",
									padding: "24px",
									textDecoration: "none",
									display: "block",
									transition: "all 200ms ease",
								}}
								className="organizer-card"
							>
								{/* TOP ROW */}
								<div
									style={{
										display: "flex",
										gap: "14px",
										alignItems: "center",
										marginBottom: "16px",
									}}
								>
									{/* AVATAR */}
									{org.avatarUrl ? (
										<img
											src={org.avatarUrl}
											width={52}
											height={52}
											alt={`${org.displayName} logo`}
											style={{
												borderRadius: "50%",
												objectFit: "cover",
												border: "1px solid var(--border)",
												flexShrink: 0,
											}}
										/>
									) : (
										<div
											style={{
												width: "52px",
												height: "52px",
												borderRadius: "50%",
												background: "var(--gold-subtle,#1A0A05)",
												border: "1px solid rgba(255,107,53,0.2)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontFamily: "var(--font-mono)",
												fontSize: "18px",
												fontWeight: 500,
												color: "var(--gold)",
												flexShrink: 0,
											}}
										>
											{org.displayName?.[0] || "O"}
										</div>
									)}

									{/* RIGHT */}
									<div>
										<p
											style={{
												fontSize: "16px",
												fontWeight: 600,
												fontFamily: "var(--font-display)",
												color: "var(--text-primary)",
												marginBottom: "3px",
												lineHeight: 1.2,
											}}
										>
											{org.displayName || "Organizer"}
										</p>

										{org.location?.city && (
											<p
												style={{
													fontSize: "12px",
													color: "var(--text-muted)",
												}}
											>
												📍 {org.location.city}, {org.location.country}
											</p>
										)}
									</div>
								</div>

								{/* BIO */}
								{org.bio && (
									<p
										style={{
											fontSize: "13px",
											color: "var(--text-secondary)",
											lineHeight: 1.6,
											marginBottom: "16px",
											display: "-webkit-box",
											WebkitLineClamp: 2,
											WebkitBoxOrient: "vertical",
											overflow: "hidden",
										}}
									>
										{org.bio}
									</p>
								)}

								{/* FOOTER ROW */}
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										borderTop: "1px solid var(--border-dim)",
										paddingTop: "12px",
									}}
								>
									{/* LEFT — event count */}
									<span
										style={{
											fontSize: "11px",
											color: "var(--text-muted)",
											fontFamily: "var(--font-mono)",
										}}
									>
										{org.eventCount} event{org.eventCount !== 1 ? "s" : ""}
									</span>

									{/* RIGHT — view profile link */}
									<span
										style={{
											fontSize: "12px",
											color: "var(--gold)",
											fontWeight: 500,
										}}
									>
										View Profile →
									</span>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>

			<style>{`
				.organizers-grid {
					display: grid;
					grid-template-columns: 1fr;
					gap: 16px;
				}
				@media (min-width: 640px) {
					.organizers-grid {
						grid-template-columns: repeat(2, 1fr);
					}
				}
				@media (min-width: 1024px) {
					.organizers-grid {
						grid-template-columns: repeat(3, 1fr);
					}
				}
				.organizer-card:hover {
					border-color: var(--border-bright) !important;
					transform: translateY(-2px);
				}
			`}</style>
		</div>
	);
}
