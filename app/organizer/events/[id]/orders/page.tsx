"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

export default function OrganizerEventOrdersPage() {
	const params = useParams();
	const eventId = params.id as string;
	const [orders, setOrders] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState("all");

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			const query = statusFilter === "all" ? "" : `?status=${statusFilter}`;
			const response = await fetch(
				`/api/organizer/events/${eventId}/orders${query}`,
			);
			const data = await response.json();
			setOrders(data.orders || []);
			setLoading(false);
		};
		load();
	}, [eventId, statusFilter]);

	const totals = useMemo(() => {
		return orders.reduce(
			(acc, order) => {
				const gross = order.lineItems.reduce(
					(sum: number, item: any) => sum + item.amountTotal,
					0,
				);
				acc.gross += gross;
				acc.count += 1;
				return acc;
			},
			{ gross: 0, count: 0 },
		);
	}, [orders]);

	return (
		<div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: "32px" }}>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
				<div>
					<h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: "12px", margin: "0 0 8px 0" }}>
						Event Orders
					</h1>
					<p style={{ color: "var(--text-secondary)", margin: 0 }}>View and manage ticket orders for this event.</p>
				</div>
				<select
					id="order-status-filter"
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
					style={{ padding: "10px 16px", background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none", cursor: "pointer", fontSize: "14px" }}
					onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
					onBlur={(e) => e.target.style.borderColor = "var(--border-dim)"}
				>
					<option value="all">All statuses</option>
					<option value="paid">Paid</option>
					<option value="payment_failed">Payment failed</option>
					<option value="refunded_full">Refunded full</option>
					<option value="refunded_partial">Refunded partial</option>
					<option value="chargeback">Chargeback</option>
				</select>
			</div>

			<div style={{ padding: "16px 24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--gold-dim)", background: "rgba(212, 175, 55, 0.05)", display: "flex", alignItems: "center", gap: "24px", fontSize: "15px", color: "var(--gold)" }}>
				<span style={{ fontWeight: 600 }}>Total Orders: {totals.count}</span>
				<span style={{ fontWeight: 600 }}>Gross Revenue: ${(totals.gross / 100).toFixed(2)}</span>
			</div>

			{loading ? (
				<div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-dim)", background: "var(--bg-surface)" }}>
					Loading orders...
				</div>
			) : orders.length === 0 ? (
				<div style={{ padding: "48px", textAlign: "center", borderRadius: "var(--radius-xl)", border: "1px dashed var(--border-dim)", color: "var(--text-muted)" }}>
					No orders found for the selected status.
				</div>
			) : (
				<div style={{ overflowX: "auto", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-dim)", background: "var(--bg-surface)" }}>
					<table style={{ minWidth: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
						<thead>
							<tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-dim)" }}>
								<th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "12px" }}>Order ID</th>
								<th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "12px" }}>Status</th>
								<th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "12px" }}>Tickets</th>
								<th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "12px" }}>Gross</th>
								<th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "12px" }}>Platform Fee</th>
								<th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "12px" }}>Created At</th>
							</tr>
						</thead>
						<tbody>
							{orders.map((order) => {
								const gross = order.lineItems.reduce(
									(sum: number, item: any) => sum + item.amountTotal,
									0,
								);
								const ticketCount = order.lineItems.reduce(
									(sum: number, item: any) => sum + item.quantity,
									0,
								);
								return (
									<tr key={order._id} style={{ borderBottom: "1px solid var(--border-dim)", transition: "background-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-elevated)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
										<td style={{ padding: "16px", color: "var(--gold)", fontFamily: "monospace", fontSize: "13px" }}>
											{order._id.slice(-10)}
										</td>
										<td style={{ padding: "16px" }}>
											<span style={{ padding: "4px 8px", borderRadius: "9999px", fontSize: "12px", fontWeight: 500, background: order.status === 'paid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: order.status === 'paid' ? 'var(--green)' : 'var(--red)' }}>
												{order.status}
											</span>
										</td>
										<td style={{ padding: "16px", color: "var(--text-primary)" }}>{ticketCount}</td>
										<td style={{ padding: "16px", color: "var(--text-primary)" }}>${(gross / 100).toFixed(2)}</td>
										<td style={{ padding: "16px", color: "var(--text-secondary)" }}>
											$
											{(
												(order.pricingSnapshot?.platformFeeAmount || 0) / 100
											).toFixed(2)}
										</td>
										<td style={{ padding: "16px", color: "var(--text-secondary)" }}>
											{new Date(order.createdAt).toLocaleString()}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
