"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
	Search,
	MapPin,
	ArrowLeft,
	ArrowRight,
	Bookmark,
	Check,
	SearchX,
	RefreshCw,
} from "lucide-react";
import EventCard from "@/components/EventCard";

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

const SORT_OPTIONS = [
	{ value: "relevance", label: "Relevance" },
	{ value: "date_asc", label: "Soonest" },
	{ value: "date_desc", label: "Latest" },
	{ value: "popular", label: "Popular" },
	{ value: "trending", label: "Trending" },
];

function useDebounced<T>(value: T, delay = 350): T {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const t = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(t);
	}, [value, delay]);
	return debounced;
}

const selectClasses =
	"input-industrial w-full appearance-none cursor-pointer bg-bg-elevated pr-8 bg-no-repeat bg-[right_12px_center] [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236B6B74%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')]";

// useSearchParams requires a Suspense boundary at the route level
export default function DiscoveryPageRoute() {
	return (
		<Suspense fallback={null}>
			<DiscoveryPage />
		</Suspense>
	);
}

function DiscoveryPage() {
	// Initialize from the URL so /events?city=Pune&q=react links are shareable
	const urlParams = useSearchParams();
	const [query, setQuery] = useState(urlParams.get("q") || "");
	const [city, setCity] = useState(urlParams.get("city") || "");
	const [eventType, setEventType] = useState(urlParams.get("eventType") || "");
	const [priceType, setPriceType] = useState(urlParams.get("priceType") || "");
	const [sort, setSort] = useState("relevance");
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [events, setEvents] = useState<DiscoveryEvent[]>([]);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: PAGE_LIMIT,
		total: 0,
		totalPages: 1,
	});
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [reloadKey, setReloadKey] = useState(0);
	const resultsRef = useRef<HTMLDivElement>(null);

	const debouncedQuery = useDebounced(query);
	const debouncedCity = useDebounced(city);

	const searchParams = useMemo(() => {
		const params = new URLSearchParams();
		if (debouncedQuery) params.set("q", debouncedQuery);
		if (debouncedCity) params.set("city", debouncedCity);
		if (eventType) params.set("eventType", eventType);
		if (priceType) params.set("priceType", priceType);
		if (sort) params.set("sort", sort);
		params.set("page", `${page}`);
		params.set("limit", `${PAGE_LIMIT}`);
		return params.toString();
	}, [debouncedCity, eventType, page, priceType, debouncedQuery, sort]);

	useEffect(() => {
		const controller = new AbortController();
		const load = async () => {
			setLoading(true);
			setError(false);
			try {
				const response = await fetch(
					`/api/public/events/search?${searchParams}`,
					{ signal: controller.signal },
				);
				if (!response.ok) throw new Error("Search failed");
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
			} catch (err) {
				if ((err as Error).name === "AbortError") return;
				setError(true);
				setLoading(false);
			}
		};
		load();
		return () => controller.abort();
	}, [searchParams, reloadKey]);

	const handleSaveSearch = async () => {
		setSaving(true);
		try {
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
			setSaved(true);
			setTimeout(() => setSaved(false), 2500);
		} finally {
			setSaving(false);
		}
	};

	const goToPage = (next: number) => {
		setPage(next);
		resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	const hasActiveFilters =
		Boolean(query || city || eventType || priceType) || sort !== "relevance";

	return (
		<main className="bg-bg-base min-h-screen pt-28 pb-24">
			<div className="max-w-[1440px] mx-auto px-6">
				{/* HEADER */}
				<div className="mb-12">
					<span className="section-label mb-4 block">
						{"// EVENT DISCOVERY"}
					</span>
					<h1 className="editorial-headline text-[40px] md:text-[56px] mb-4">
						Find Your <em className="not-italic">Next Event</em>
					</h1>
					<p className="text-text-secondary text-base max-w-xl leading-relaxed">
						Hackathons, meetups, conferences and workshops — across India and
						online.
					</p>
				</div>

				{/* SEARCH & FILTERS */}
				<section className="bg-bg-elevated border border-border-subtle p-4 sm:p-5 mb-10">
					<div className="grid gap-3 md:grid-cols-6">
						<div className="relative md:col-span-2">
							<Search
								size={14}
								className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
								aria-hidden="true"
							/>
							<input
								id="discovery-query"
								value={query}
								onChange={(e) => {
									setPage(1);
									setQuery(e.target.value);
								}}
								placeholder="Search by title, topic..."
								className="input-industrial w-full pl-10"
								aria-label="Search events"
							/>
						</div>
						<div className="relative">
							<MapPin
								size={14}
								className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
								aria-hidden="true"
							/>
							<input
								id="discovery-city"
								value={city}
								onChange={(e) => {
									setPage(1);
									setCity(e.target.value);
								}}
								placeholder="City"
								className="input-industrial w-full pl-10"
								aria-label="Filter by city"
							/>
						</div>
						<select
							id="discovery-type"
							value={eventType}
							onChange={(e) => {
								setPage(1);
								setEventType(e.target.value);
							}}
							className={selectClasses}
							aria-label="Event format"
						>
							<option value="">Any format</option>
							<option value="online">Online</option>
							<option value="offline">In-person</option>
							<option value="hybrid">Hybrid</option>
						</select>
						<select
							id="discovery-price"
							value={priceType}
							onChange={(e) => {
								setPage(1);
								setPriceType(e.target.value);
							}}
							className={selectClasses}
							aria-label="Price"
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
							className={selectClasses}
							aria-label="Sort results"
						>
							{SORT_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>

					<div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
						<p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary flex items-center gap-2">
							<span
								className="w-1.5 h-1.5 bg-teal inline-block"
								aria-hidden="true"
							/>
							Smart ranking enabled
						</p>
						<div className="flex items-center gap-2">
							{hasActiveFilters && (
								<button
									type="button"
									onClick={() => {
										setQuery("");
										setCity("");
										setEventType("");
										setPriceType("");
										setSort("relevance");
										setPage(1);
									}}
									className="font-mono text-[11px] uppercase tracking-widest text-text-secondary hover:text-accent px-3 py-2 transition-colors"
								>
									Clear
								</button>
							)}
							<button
								type="button"
								onClick={handleSaveSearch}
								disabled={saving || saved}
								id="save-search-button"
								className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest font-bold px-4 py-2 border transition-colors ${
									saved
										? "border-teal text-teal"
										: "border-border-subtle text-text-primary hover:border-accent hover:text-accent"
								} disabled:opacity-60 disabled:cursor-not-allowed`}
							>
								{saved ? (
									<>
										<Check size={12} aria-hidden="true" /> Saved
									</>
								) : (
									<>
										<Bookmark size={12} aria-hidden="true" />
										{saving ? "Saving..." : "Save search"}
									</>
								)}
							</button>
						</div>
					</div>
				</section>

				{/* RESULTS */}
				<div ref={resultsRef} className="scroll-mt-24">
					{loading ? (
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{Array.from({ length: 8 }).map((_, idx) => (
								<div
									key={idx}
									className="border border-border-subtle"
									aria-hidden="true"
								>
									<div className="h-[180px] animate-shimmer" />
									<div className="p-5 space-y-3">
										<div className="h-3 w-2/3 animate-shimmer" />
										<div className="h-5 w-full animate-shimmer" />
										<div className="h-3 w-1/2 animate-shimmer" />
										<div className="h-px bg-border-subtle mt-4" />
										<div className="h-4 w-1/3 animate-shimmer" />
									</div>
								</div>
							))}
						</div>
					) : error ? (
						<section className="border border-border-subtle bg-bg-elevated py-20 px-6 text-center">
							<RefreshCw
								size={28}
								className="mx-auto mb-4 text-text-secondary"
								aria-hidden="true"
							/>
							<h2 className="font-display font-bold text-xl text-text-primary mb-2">
								Couldn&apos;t load events
							</h2>
							<p className="text-text-secondary text-sm mb-6">
								Something went wrong while searching. Check your connection and
								try again.
							</p>
							<button
								type="button"
								onClick={() => setReloadKey((k) => k + 1)}
								className="btn-primary cursor-pointer"
							>
								Retry
							</button>
						</section>
					) : events.length === 0 ? (
						<section className="border border-dashed border-border-subtle bg-bg-elevated py-20 px-6 text-center">
							<SearchX
								size={28}
								className="mx-auto mb-4 text-text-secondary"
								aria-hidden="true"
							/>
							<h2 className="font-display font-bold text-xl text-text-primary mb-2">
								No events found
							</h2>
							<p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">
								Try broader terms or remove some filters.
							</p>
							{hasActiveFilters && (
								<button
									type="button"
									onClick={() => {
										setQuery("");
										setCity("");
										setEventType("");
										setPriceType("");
										setSort("relevance");
										setPage(1);
									}}
									className="btn-secondary cursor-pointer"
								>
									Clear all filters
								</button>
							)}
						</section>
					) : (
						<section>
							<div className="mb-5 flex items-baseline justify-between">
								<span className="font-mono text-[11px] uppercase tracking-widest text-text-secondary">
									<span className="text-accent">{pagination.total}</span>{" "}
									{pagination.total === 1 ? "result" : "results"}
								</span>
								{pagination.totalPages > 1 && (
									<span className="font-mono text-[11px] uppercase tracking-widest text-text-secondary">
										Page {pagination.page} / {pagination.totalPages}
									</span>
								)}
							</div>

							<ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
								{events.map((event, index) => {
									const d = new Date(event.startAt);
									return (
										<li
											key={event._id}
											className="h-full"
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
												}).catch(() => {});
											}}
										>
											<EventCard
												title={event.title}
												image={event.coverImageUrl || ""}
												slug={event.slug}
												location={
													event.eventType === "online"
														? "Online"
														: event.location?.city || "TBA"
												}
												date={d.toLocaleDateString("en-IN", {
													weekday: "short",
													day: "numeric",
													month: "short",
												})}
												time={d.toLocaleTimeString("en-IN", {
													hour: "numeric",
													minute: "2-digit",
													hour12: true,
												})}
												category={event.category || "Event"}
												isPaid={event.isPaid}
												price={event.basePrice}
												currency={event.currency || "INR"}
												eventType={event.eventType}
											/>
										</li>
									);
								})}
							</ul>

							{/* PAGINATION */}
							{pagination.totalPages > 1 && (
								<div className="mt-14 flex items-center justify-center gap-4">
									<button
										type="button"
										disabled={pagination.page <= 1}
										onClick={() => goToPage(Math.max(1, page - 1))}
										className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-5 py-3 border border-border-subtle text-text-primary hover:border-accent hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border-subtle disabled:hover:text-text-primary cursor-pointer"
									>
										<ArrowLeft size={12} aria-hidden="true" /> Prev
									</button>
									<span className="font-mono text-[12px] text-text-secondary tracking-widest">
										{pagination.page} / {pagination.totalPages}
									</span>
									<button
										type="button"
										disabled={pagination.page >= pagination.totalPages}
										onClick={() => goToPage(page + 1)}
										className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-5 py-3 border border-border-subtle text-text-primary hover:border-accent hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border-subtle disabled:hover:text-text-primary cursor-pointer"
									>
										Next <ArrowRight size={12} aria-hidden="true" />
									</button>
								</div>
							)}
						</section>
					)}
				</div>
			</div>
		</main>
	);
}
