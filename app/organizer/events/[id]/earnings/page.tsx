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
		<main className="mx-auto max-w-5xl p-6">
			<h1 className="mb-6 text-3xl font-bold text-white">Event Earnings</h1>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
					<p className="text-xs uppercase text-zinc-500">Gross sales</p>
					<p className="mt-2 text-2xl font-bold text-white">
						${(summary.grossSales / 100).toFixed(2)}
					</p>
				</div>
				<div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
					<p className="text-xs uppercase text-zinc-500">Refunds</p>
					<p className="mt-2 text-2xl font-bold text-white">
						${(summary.refunds / 100).toFixed(2)}
					</p>
				</div>
				<div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
					<p className="text-xs uppercase text-zinc-500">Platform fees</p>
					<p className="mt-2 text-2xl font-bold text-white">
						${(summary.platformFees / 100).toFixed(2)}
					</p>
				</div>
				<div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
					<p className="text-xs uppercase text-zinc-500">Estimated net</p>
					<p className="mt-2 text-2xl font-bold text-white">
						${(summary.estimatedNet / 100).toFixed(2)}
					</p>
				</div>
			</div>
		</main>
	);
}
