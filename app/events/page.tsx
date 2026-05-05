"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type DiscoveryEvent = {
	_id: string;
	title: string;
	slug: string;
	shortDescription: string;
	startAt: string;
	eventType: "online" | "offline" | "hybrid";
	category?: string;
	isPaid: boolean;
	basePrice?: number;
	currency?: string;
	location?: { city?: string; country?: string };
	coverImageUrl?: string;
	popularityScore?: number;
	trendingScore?: number;
};

const PAGE_LIMIT = 12;

export default function DiscoveryPage() {
	const [query, setQuery] = useState("");
	const [city, setCity] = useState("");
	const [eventType, setEventType] = useState("");
	const [priceType, setPriceType] = useState("");
	const [sort, setSort] = useState("relevance");
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(true);
	const [events, setEvents] = useState<DiscoveryEvent[]>([]);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: PAGE_LIMIT,
		total: 0,
		totalPages: 1,
	});
	const [saving, setSaving] = useState(false);

	const searchParams = useMemo(() => {
		const params = new URLSearchParams();
		if (query) params.set("q", query);
		if (city) params.set("city", city);
		if (eventType) params.set("eventType", eventType);
		if (priceType) params.set("priceType", priceType);
		if (sort) params.set("sort", sort);
		params.set("page", `${page}`);
		params.set("limit", `${PAGE_LIMIT}`);
		return params.toString();
	}, [city, eventType, page, priceType, query, sort]);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			const response = await fetch(`/api/public/events/search?${searchParams}`);
			const data = await response.json();
			setEvents(data.events || []);
			setPagination(
				data.pagination || {
					page: 1,
					limit: PAGE_LIMIT,
					total: 0,
					totalPages: 1,
				},
			);
			setLoading(false);
		};
		load();
	}, [searchParams]);

	const handleSaveSearch = async () => {
		setSaving(true);
		await fetch("/api/saved-searches", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: query ? `Search: ${query}` : "Saved Discovery Search",
				query,
				filters: { city, eventType, priceType, sort },
				notificationFrequency: "daily",
			}),
		});
		setSaving(false);
	};

	return (
		<main className="mx-auto max-w-7xl px-4 py-8">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-white">Discover Events</h1>
				<p className="mt-2 text-sm text-zinc-400">
					Find relevant events with smart ranking and filters.
				</p>
			</div>

			<section className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
				<div className="grid gap-3 md:grid-cols-6">
					<input
						id="discovery-query"
						value={query}
						onChange={(e) => {
							setPage(1);
							setQuery(e.target.value);
						}}
						placeholder="Search events"
						className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white md:col-span-2"
					/>
					<input
						id="discovery-city"
						value={city}
						onChange={(e) => {
							setPage(1);
							setCity(e.target.value);
						}}
						placeholder="City"
						className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
					/>
					<select
						id="discovery-type"
						value={eventType}
						onChange={(e) => {
							setPage(1);
							setEventType(e.target.value);
						}}
						className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
					>
						<option value="">Any format</option>
						<option value="online">Online</option>
						<option value="offline">Offline</option>
						<option value="hybrid">Hybrid</option>
					</select>
					<select
						id="discovery-price"
						value={priceType}
						onChange={(e) => {
							setPage(1);
							setPriceType(e.target.value);
						}}
						className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
					>
						<option value="">Any price</option>
						<option value="free">Free</option>
						<option value="paid">Paid</option>
					</select>
					<select
						id="discovery-sort"
						value={sort}
						onChange={(e) => {
							setPage(1);
							setSort(e.target.value);
						}}
						className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
					>
						<option value="relevance">Relevance</option>
						<option value="date_asc">Date: soonest</option>
						<option value="date_desc">Date: latest</option>
						<option value="popular">Popular</option>
						<option value="trending">Trending</option>
					</select>
				</div>
				<div className="mt-3 flex items-center justify-between gap-2">
					<p className="text-xs text-zinc-500">
						Sort transparency: relevance balances text, freshness, popularity,
						quality, geo, and personalization.
					</p>
					<button
						type="button"
						onClick={handleSaveSearch}
						disabled={saving}
						id="save-search-button"
						className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-black hover:bg-primary/90"
					>
						{saving ? "Saving..." : "Save search"}
					</button>
				</div>
			</section>

			{loading ? (
				<div className="grid gap-4 md:grid-cols-3">
					{Array.from({ length: 6 }).map((_, idx) => (
						<div
							key={idx}
							className="h-44 animate-pulse rounded-xl border border-zinc-800 bg-zinc-950"
						/>
					))}
				</div>
			) : events.length === 0 ? (
				<section className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950/40 p-8 text-center">
					<h2 className="text-lg font-semibold text-zinc-100">
						No events found
					</h2>
					<p className="mt-2 text-sm text-zinc-400">
						Try broader terms, remove some filters, or switch to trending
						events.
					</p>
				</section>
			) : (
				<section>
					<div className="mb-3 text-sm text-zinc-400">
						{pagination.total} results
					</div>
					<ul className="grid gap-4 md:grid-cols-3">
						{events.map((event, index) => (
							<li key={event._id}>
								<Link
									href={`/events/${event.slug}`}
									onClick={() => {
										fetch("/api/events/interactions", {
											method: "POST",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify({
												eventId: event._id,
												type: "view",
												weight: 1,
												query,
												position: index,
											}),
										});
									}}
									className="block rounded-xl border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600"
								>
									<p className="text-xs uppercase text-zinc-500">
										{event.category || "Event"}
									</p>
									<h3 className="mt-2 line-clamp-2 text-lg font-semibold text-white">
										{event.title}
									</h3>
									<p className="mt-2 line-clamp-2 text-sm text-zinc-400">
										{event.shortDescription}
									</p>
									<div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
										<span>{new Date(event.startAt).toLocaleDateString()}</span>
										<span>{event.eventType}</span>
										<span>{event.location?.city || "Online"}</span>
										<span>
											{event.isPaid ? `Paid ${event.basePrice || ""}` : "Free"}
										</span>
									</div>
								</Link>
							</li>
						))}
					</ul>
					<div className="mt-6 flex items-center justify-center gap-2">
						<button
							type="button"
							disabled={pagination.page <= 1}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 disabled:opacity-50"
						>
							Previous
						</button>
						<span className="text-sm text-zinc-400">
							Page {pagination.page} of {pagination.totalPages}
						</span>
						<button
							type="button"
							disabled={pagination.page >= pagination.totalPages}
							onClick={() => setPage((p) => p + 1)}
							className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 disabled:opacity-50"
						>
							Next
						</button>
					</div>
				</section>
			)}
		</main>
	);
}
