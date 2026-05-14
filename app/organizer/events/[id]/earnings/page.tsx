"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function OrganizerEventEarningsPage() {
	const params = useParams();
	const eventId = params.id as string;
	const [summary, setSummary] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			const response = await fetch(
				`/api/organizer/events/${eventId}/earnings-summary`,
			);
			const data = await response.json();
			setSummary(data.summary || null);
			setLoading(false);
		};
		load();
	}, [eventId]);

	if (loading) {
		return (
			<main className="mx-auto max-w-5xl p-6 text-zinc-400">
				Loading earnings...
			</main>
		);
	}

	if (!summary) {
		return (
			<main className="mx-auto max-w-5xl p-6 text-zinc-500">
				No earnings data available yet.
			</main>
		);
	}

	return (
		<div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: "32px" }}>
			<div>
				<h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: "12px", margin: "0 0 8px 0" }}>
					Event Earnings
				</h1>
				<p style={{ color: "var(--text-secondary)", margin: 0 }}>View a summary of your sales, refunds, and net earnings.</p>
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
				<div style={{ padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-dim)", background: "var(--bg-surface)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
					<p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px 0" }}>Gross sales</p>
					<p style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: 0 }}>
						${(summary.grossSales / 100).toFixed(2)}
					</p>
				</div>
				<div style={{ padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-dim)", background: "var(--bg-surface)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
					<p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px 0" }}>Refunds</p>
					<p style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: 0 }}>
						${(summary.refunds / 100).toFixed(2)}
					</p>
				</div>
				<div style={{ padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-dim)", background: "var(--bg-surface)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
					<p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px 0" }}>Platform fees</p>
					<p style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: 0 }}>
						${(summary.platformFees / 100).toFixed(2)}
					</p>
				</div>
				<div style={{ padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--gold-dim)", background: "var(--bg-surface)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
					<p style={{ fontSize: "13px", fontWeight: 600, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px 0" }}>Estimated net</p>
					<p style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: 0 }}>
						${(summary.estimatedNet / 100).toFixed(2)}
					</p>
				</div>
			</div>
		</div>
	);
}
