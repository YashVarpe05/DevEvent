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
		<main className="mx-auto max-w-6xl p-6">
			<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-3xl font-bold text-white">Event Orders</h1>
				<select
					id="order-status-filter"
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
					className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
				>
					<option value="all">All statuses</option>
					<option value="paid">Paid</option>
					<option value="payment_failed">Payment failed</option>
					<option value="refunded_full">Refunded full</option>
					<option value="refunded_partial">Refunded partial</option>
					<option value="chargeback">Chargeback</option>
				</select>
			</div>

			<div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
				<span className="mr-4">Orders: {totals.count}</span>
				<span>Gross: ${(totals.gross / 100).toFixed(2)}</span>
			</div>

			{loading ? (
				<p className="text-zinc-400">Loading orders...</p>
			) : orders.length === 0 ? (
				<p className="rounded-xl border border-dashed border-zinc-700 p-8 text-zinc-500">
					No orders found.
				</p>
			) : (
				<div className="overflow-x-auto rounded-xl border border-zinc-800">
					<table className="min-w-full divide-y divide-zinc-800 text-sm">
						<thead className="bg-zinc-950 text-zinc-400">
							<tr>
								<th className="px-4 py-3 text-left">Order</th>
								<th className="px-4 py-3 text-left">Status</th>
								<th className="px-4 py-3 text-left">Tickets</th>
								<th className="px-4 py-3 text-left">Gross</th>
								<th className="px-4 py-3 text-left">Platform fee</th>
								<th className="px-4 py-3 text-left">Created</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-900 bg-zinc-950/40 text-zinc-200">
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
									<tr key={order._id}>
										<td className="px-4 py-3 font-mono text-xs">
											{order._id.slice(-10)}
										</td>
										<td className="px-4 py-3">{order.status}</td>
										<td className="px-4 py-3">{ticketCount}</td>
										<td className="px-4 py-3">${(gross / 100).toFixed(2)}</td>
										<td className="px-4 py-3">
											$
											{(
												(order.pricingSnapshot?.platformFeeAmount || 0) / 100
											).toFixed(2)}
										</td>
										<td className="px-4 py-3">
											{new Date(order.createdAt).toLocaleString()}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</main>
	);
}
