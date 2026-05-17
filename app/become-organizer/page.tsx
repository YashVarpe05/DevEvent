import BecomeOrganizerForm from "@/components/BecomeOrganizerForm";

export const metadata = {
	title: "Become an Organizer | DevEvent",
	description: "Apply to become an event organizer on DevEvent.",
};

const benefits = [
	"Host unlimited free events",
	"Access community-building tools",
	"Analytics and attendee insights",
	"Paid ticketing (coming soon)",
];

export default function BecomeOrganizerPage() {
	return (
		<main
			style={{
				minHeight: "100dvh",
				background: "var(--bg-base)",
				padding: "48px 24px",
			}}
		>
			<div
				style={{
					maxWidth: "960px",
					margin: "0 auto",
					display: "grid",
					gridTemplateColumns: "1fr 1.6fr",
					gap: "48px",
					alignItems: "start",
				}}
				className="become-org-grid"
			>
				{/* LEFT COLUMN */}
				<div>
					{/* Page label */}
					<span
						style={{
							fontSize: "10px",
							color: "var(--gold)",
							textTransform: "uppercase",
							letterSpacing: "0.14em",
							marginBottom: "8px",
							display: "block",
							fontFamily: "var(--font-mono)",
						}}
					>
						{"// BECOME AN ORGANIZER"}
					</span>

					{/* Heading */}
					<h1
						style={{
							fontFamily: "var(--font-serif)",
							fontSize: "clamp(28px, 4vw, 42px)",
							fontWeight: 600,
							color: "var(--text-primary)",
							letterSpacing: "-0.025em",
							lineHeight: 1.1,
							marginBottom: "12px",
						}}
					>
						Build Your
						<br />
						<em style={{ color: "var(--gold)", fontStyle: "italic" }}>
							Community
						</em>
					</h1>

					{/* Subtext */}
					<p
						style={{
							fontSize: "14px",
							color: "var(--text-muted)",
							lineHeight: 1.7,
							marginBottom: "28px",
							maxWidth: "320px",
						}}
					>
						Join thousands of organizers hosting high-quality tech events around
						the world.
					</p>

					{/* INFO CARD */}
					<div
						style={{
							background: "var(--bg-surface)",
							border: "1px solid var(--border-dim)",
							borderLeft: "2px solid var(--gold)",
							borderRadius: "var(--radius-md)",
							padding: "16px 18px",
							marginBottom: "28px",
						}}
					>
						<h3
							style={{
								fontSize: "13px",
								fontWeight: 600,
								color: "var(--text-primary)",
								marginBottom: "6px",
							}}
						>
							Why we verify organizers
						</h3>
						<p
							style={{
								fontSize: "13px",
								color: "var(--text-muted)",
								lineHeight: 1.6,
							}}
						>
							To maintain a high-quality experience for attendees, we review all
							new organizer applications. Applications are typically reviewed
							within{" "}
							<span style={{ color: "var(--gold)", fontWeight: 500 }}>
								48 hours
							</span>
							.
						</p>
					</div>

					{/* BENEFITS LIST */}
					<ul
						style={{
							borderTop: "1px solid var(--border-dim)",
							paddingTop: "20px",
							display: "flex",
							flexDirection: "column",
							gap: "10px",
							listStyle: "none",
							margin: 0,
							padding: "20px 0 0 0",
						}}
					>
						{benefits.map((benefit) => (
							<li
								key={benefit}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "10px",
									fontSize: "13px",
									color: "var(--text-secondary)",
								}}
							>
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="var(--green)"
									strokeWidth={2.5}
									strokeLinecap="round"
									strokeLinejoin="round"
									style={{ flexShrink: 0 }}
								>
									<path d="M5 13l4 4L19 7" />
								</svg>
								{benefit}
							</li>
						))}
					</ul>
				</div>

				{/* RIGHT COLUMN */}
				<div>
					<BecomeOrganizerForm />
				</div>
			</div>

			<style>{`
				@media (max-width: 768px) {
					.become-org-grid {
						grid-template-columns: 1fr !important;
					}
				}
			`}</style>
		</main>
	);
}
