export const dynamic = 'force-dynamic';
import { connection } from "next/server";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
	User,
	Mail,
	Shield,
	Calendar,
	LogOut,
	CheckCircle,
	AlertCircle,
	Ticket,
	ShoppingBag,
} from "lucide-react";
import { ResendVerificationButton } from "./ResendVerificationButton";

export default async function ProfilePage() {
	await connection();
	const session = await auth();

	if (!session?.user) {
		redirect("/login?callbackUrl=/profile");
	}

	const { user } = session;

	return (
		<main style={{ background: "var(--bg-base)", minHeight: "100dvh", padding: "40px 24px" }}>
			<div style={{ maxWidth: "560px", margin: "0 auto" }}>

				{/* Header */}
				<div>
					<span className="text-label">Account</span>
					<h1
						style={{
							fontFamily: "var(--font-display)",
							fontSize: "clamp(24px, 3vw, 36px)",
							fontWeight: 600,
							color: "var(--text-primary)",
							marginTop: "6px",
							marginBottom: "4px",
						}}
					>
						Your{" "}
						<em style={{ color: "var(--gold)", fontStyle: "italic" }}>Profile</em>
					</h1>
				</div>

				{/* Profile Card */}
				<div
					style={{
						background: "var(--bg-surface)",
						border: "1px solid var(--border-dim)",
						borderRadius: "var(--radius-lg)",
						padding: "24px",
						marginTop: "24px",
					}}
				>
					{/* Avatar + Name */}
					<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
						<div
							style={{
								width: "56px",
								height: "56px",
								borderRadius: "50%",
								background: "var(--gold-subtle)",
								border: "1px solid var(--border-gold)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								overflow: "hidden",
								flexShrink: 0,
							}}
						>
							{user.image ? (
								<img
									src={user.image}
									alt={user.name || "User"}
									style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
								/>
							) : (
								<User style={{ width: "24px", height: "24px", color: "var(--gold)" }} />
							)}
						</div>
						<div>
							<h2
								style={{
									fontFamily: "var(--font-display)",
									fontSize: "18px",
									fontWeight: 600,
									color: "var(--text-primary)",
								}}
							>
								{user.name || "DevEvent User"}
							</h2>
							<p style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
								{user.email}
							</p>
						</div>
					</div>

					{/* Divider */}
					<div style={{ borderTop: "1px solid var(--border-dim)", margin: "20px 0" }} />

					{/* Detail Rows */}
					<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
						{/* Email row */}
						<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
							<Mail style={{ width: "16px", height: "16px", color: "var(--text-muted)", flexShrink: 0 }} />
							<div style={{ flex: 1, minWidth: 0 }}>
								<p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>
									Email
								</p>
								<p style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-primary)", marginTop: "2px" }}>
									{user.email}
								</p>
							</div>
							{user.isEmailVerified ? (
								<span
									style={{
										display: "inline-flex",
										alignItems: "center",
										gap: "4px",
										background: "rgba(42,157,111,0.08)",
										border: "1px solid rgba(42,157,111,0.25)",
										color: "var(--green)",
										fontFamily: "var(--font-mono)",
										fontSize: "10px",
										fontWeight: 600,
										textTransform: "uppercase",
										letterSpacing: "0.06em",
										padding: "2px 10px",
										borderRadius: "var(--radius-sm)",
									}}
								>
									<CheckCircle style={{ width: "10px", height: "10px" }} />
									Verified
								</span>
							) : (
								<span
									style={{
										display: "inline-flex",
										alignItems: "center",
										gap: "4px",
										background: "rgba(255,107,53,0.08)",
										border: "1px solid rgba(255,107,53,0.25)",
										color: "var(--gold)",
										fontFamily: "var(--font-mono)",
										fontSize: "10px",
										fontWeight: 600,
										textTransform: "uppercase",
										letterSpacing: "0.06em",
										padding: "2px 10px",
										borderRadius: "var(--radius-sm)",
									}}
								>
									<AlertCircle style={{ width: "10px", height: "10px" }} />
									Unverified
								</span>
							)}
						</div>

						{/* Roles row */}
						<div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
							<Shield style={{ width: "16px", height: "16px", color: "var(--text-muted)", flexShrink: 0, marginTop: "2px" }} />
							<div>
								<p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>
									Roles
								</p>
								<div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
									{user.roles.map((role) => (
										<span
											key={role}
											style={{
												fontFamily: "var(--font-mono)",
												fontSize: "10px",
												fontWeight: 600,
												textTransform: "uppercase",
												letterSpacing: "0.06em",
												color: "var(--gold)",
												background: "var(--gold-subtle)",
												border: "1px solid var(--border-gold)",
												padding: "2px 10px",
												borderRadius: "var(--radius-sm)",
											}}
										>
											{role}
										</span>
									))}
								</div>
							</div>
						</div>

						{/* Member since row */}
						<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
							<Calendar style={{ width: "16px", height: "16px", color: "var(--text-muted)", flexShrink: 0 }} />
							<div>
								<p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>
									Member since
								</p>
								<p style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-primary)", marginTop: "2px" }}>
									Active member
								</p>
							</div>
						</div>
					</div>

					{/* Divider */}
					<div style={{ borderTop: "1px solid var(--border-dim)", margin: "20px 0" }} />

					{/* Actions */}
					<div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
						{!user.isEmailVerified && <ResendVerificationButton />}

						<form
							action={async () => {
								"use server";
								await signOut({ redirectTo: "/" });
							}}
						>
							<button
								type="submit"
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: "6px",
									border: "1px solid var(--border)",
									background: "transparent",
									color: "var(--text-secondary)",
									fontSize: "13px",
									fontWeight: 500,
									padding: "8px 16px",
									borderRadius: "var(--radius-md)",
									cursor: "pointer",
									transition: "all 160ms ease",
								}}
							>
								<LogOut style={{ width: "14px", height: "14px" }} />
								Sign Out
							</button>
						</form>
					</div>
				</div>

				{/* Quick Access Grid */}
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
					<Link
						href="/my/registrations"
						style={{
							background: "var(--bg-surface)",
							border: "1px solid var(--border-dim)",
							borderRadius: "var(--radius-lg)",
							padding: "20px",
							textDecoration: "none",
							transition: "all 200ms ease",
						}}
						className="group hover:translate-y-[-1px]"
					>
						<Ticket style={{ width: "18px", height: "18px", color: "var(--gold)", marginBottom: "8px" }} />
						<p style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
							My Tickets
						</p>
						<p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
							View registrations
						</p>
					</Link>
					<Link
						href="/my/orders"
						style={{
							background: "var(--bg-surface)",
							border: "1px solid var(--border-dim)",
							borderRadius: "var(--radius-lg)",
							padding: "20px",
							textDecoration: "none",
							transition: "all 200ms ease",
						}}
						className="group hover:translate-y-[-1px]"
					>
						<ShoppingBag style={{ width: "18px", height: "18px", color: "var(--gold)", marginBottom: "8px" }} />
						<p style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
							Orders
						</p>
						<p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
							Purchase history
						</p>
					</Link>
				</div>

				{/* Back link */}
				<p style={{ textAlign: "center", marginTop: "24px" }}>
					<Link
						href="/"
						style={{ fontSize: "13px", color: "var(--text-muted)", textDecoration: "none", transition: "color 160ms ease" }}
					>
						← Back to home
					</Link>
				</p>
			</div>
		</main>
	);
}
