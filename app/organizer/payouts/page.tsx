"use client";

import { useEffect, useState } from "react";
import {
	DollarSign,
	ExternalLink as ExternalLinkIcon,
	TrendingUp,
	CreditCard,
	Clock,
	Activity,
	Building,
	ArrowDownRight,
} from "lucide-react";

interface EarningsStat {
	grossSales: number;
	platformFees: number;
	estimatedNet: number;
	refunds: number;
	availableBalance: number;
	chargesEnabled: boolean;
	payoutsEnabled: boolean;
	stripeOnboardingComplete: boolean;
}

export default function PayoutsDashboard() {
	const [stats, setStats] = useState<EarningsStat | null>(null);
	const [loading, setLoading] = useState(true);
	const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const res = await fetch("/api/organizer/stripe/earnings");
				const data = await res.json();
				if (data.stats) setStats(data.stats);

				// Also fetch Connect link in case they haven't finished
				const connectRes = await fetch("/api/organizer/stripe/connect", {
					method: "POST",
				});
				const connectData = await connectRes.json();
				if (connectData.url) setOnboardingUrl(connectData.url);
			} catch (err) {
				console.error("Fetch earnings error:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, []);

	if (loading)
		return (
			<div style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>
				Loading payout details...
			</div>
		);

	return (
		<main style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "48px" }}>
			<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "24px" }}>
				<div>
					<h1 style={{ fontSize: "36px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: "16px", margin: 0 }}>
						<div style={{ width: "48px", height: "48px", background: "var(--bg-elevated)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", border: "1px solid var(--border-dim)" }}>
							<DollarSign size={24} />
						</div>
						Earnings
					</h1>
					<p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "400px", margin: "8px 0 0 0" }}>
						Track your event revenue and manage payouts through Stripe Connect.
					</p>
				</div>

				{onboardingUrl && (
					<a
						href={onboardingUrl}
						style={{
							background: "var(--gold)",
							color: "#000",
							padding: "12px 24px",
							borderRadius: "var(--radius-lg)",
							fontWeight: 600,
							display: "flex",
							alignItems: "center",
							gap: "12px",
							textDecoration: "none",
							boxShadow: "0 0 16px var(--gold-dim)",
							transition: "all 0.2s"
						}}
						onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 24px rgba(255,107,53, 0.4)"; e.currentTarget.style.transform = "scale(0.98)"; }}
						onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 16px var(--gold-dim)"; e.currentTarget.style.transform = "scale(1)"; }}
					>
						Go to Stripe Dashboard{" "}
						<ExternalLinkIcon size={20} />
					</a>
				)}
			</div>

			{/* Stats Grid */}
			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
				{[
					{
						label: "Total Sales",
						value: `$${((stats?.grossSales || 0) / 100).toFixed(2)}`,
						icon: <TrendingUp style={{ color: "var(--green)" }} size={24} />,
						sub: "Gross across all events",
					},
					{
						label: "Platform Fees",
						value: `$${((stats?.platformFees || 0) / 100).toFixed(2)}`,
						icon: <Building style={{ color: "var(--text-secondary)" }} size={24} />,
						sub: "Paid to DevEvent",
					},
					{
						label: "Net Earnings",
						value: `$${((stats?.estimatedNet || 0) / 100).toFixed(2)}`,
						icon: <Activity style={{ color: "var(--gold)" }} size={24} />,
						sub: "Your total revenue",
					},
					{
						label: "Available",
						value:
							stats?.availableBalance === -1
								? "Login to Stripe"
								: `$${((stats?.availableBalance || 0) / 100).toFixed(2)}`,
						icon: <Clock style={{ color: "var(--text-primary)" }} size={24} />,
						sub: "Ready for payout",
					},
				].map((card, i) => (
					<div
						key={i}
						style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-xl)", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}
					>
						<div style={{ display: "flex", justifyContent: "center", alignItems: "center", background: "var(--bg-elevated)", width: "48px", height: "48px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-dim)" }}>
							{card.icon}
						</div>
						<div>
							<p style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
								{card.label}
							</p>
							<h4 style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "0 0 8px 0" }}>
								{card.value}
							</h4>
							<p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: 0 }}>{card.sub}</p>
						</div>
					</div>
				))}
			</div>

			<div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-xl)", padding: "48px 32px", textAlign: "center" }}>
				<CreditCard size={40} style={{ color: "var(--text-muted)", margin: "0 auto 16px auto" }} />
				<h3 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>Payout History</h3>
				<p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
					Detailed payout logs and bank transfer status are available directly
					in your Stripe Express dashboard. Payment processing can take 2-5
					business days depending on your bank.
				</p>
			</div>
		</main>
	);
}
