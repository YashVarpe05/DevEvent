"use client";

import { useEffect, useState } from "react";

export default function AdminPaymentsRiskPage() {
	const [orders, setOrders] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			const response = await fetch("/api/admin/payments/risk");
			const data = await response.json();
			setOrders(data.orders || []);
			setLoading(false);
		};
		load();
	}, []);

	return (
		<main className="mx-auto max-w-6xl p-6">
			<h1 className="mb-6 text-3xl font-bold text-white">Payment Risk Queue</h1>
			{loading ? (
				<p className="text-zinc-400">Loading risk signals...</p>
			) : orders.length === 0 ? (
				<p className="rounded-xl border border-dashed border-zinc-700 p-8 text-zinc-500">
					No risk events right now.
				</p>
			) : (
				<div className="overflow-x-auto rounded-xl border border-zinc-800">
					<table className="min-w-full divide-y divide-zinc-800 text-sm">
						<thead className="bg-zinc-950 text-zinc-400">
							<tr>
								<th className="px-4 py-3 text-left">Order</th>
								<th className="px-4 py-3 text-left">Status</th>
								<th className="px-4 py-3 text-left">Payment intent</th>
								<th className="px-4 py-3 text-left">Charge</th>
								<th className="px-4 py-3 text-left">Updated</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-900 bg-zinc-950/40 text-zinc-200">
							{orders.map((order) => (
								<tr key={order._id}>
									<td className="px-4 py-3 font-mono text-xs">
										{order._id.slice(-10)}
									</td>
									<td className="px-4 py-3">{order.status}</td>
									<td className="px-4 py-3 font-mono text-xs">
										{order.stripePaymentIntentId || "-"}
									</td>
									<td className="px-4 py-3 font-mono text-xs">
										{order.stripeChargeId || "-"}
									</td>
									<td className="px-4 py-3">
										{new Date(order.updatedAt).toLocaleString()}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</main>
	);
}
