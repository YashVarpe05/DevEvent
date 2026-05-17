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

function getCurrencySymbol(currency: string): string {
	const symbols: Record<string, string> = {
		INR: "₹",
		USD: "$",
		EUR: "€",
		GBP: "£",
	};
	return symbols[currency?.toUpperCase()] ?? currency?.toUpperCase() ?? "$";
}

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
		<main
			style={{
				backgroundColor: "var(--bg-void)",
				minHeight: "100vh",
				paddingTop: "60px",
				paddingBottom: "100px",
			}}
		>
			<div
				style={{
					maxWidth: "1200px",
					margin: "0 auto",
					padding: "0 24px",
				}}
			>
				{/* HEADER */}
				<div style={{ marginBottom: "40px" }}>
					<h1
						style={{
							fontFamily: "var(--font-display)",
							fontSize: "clamp(32px, 5vw, 48px)",
							fontWeight: 600,
							letterSpacing: "-0.02em",
							color: "var(--text-primary)",
							lineHeight: 1.1,
						}}
					>
						Discover <span style={{ color: "var(--gold)" }}>Events</span>
					</h1>
					<p
						style={{
							marginTop: "12px",
							fontSize: "16px",
							color: "var(--text-secondary)",
							maxWidth: "600px",
							lineHeight: 1.6,
						}}
					>
						Explore curated experiences, workshops, and gatherings tailored for builders.
					</p>
				</div>

				{/* SEARCH & FILTERS SECTION */}
				<section
					style={{
						backgroundColor: "var(--bg-surface)",
						border: "1px solid var(--border-dim)",
						borderRadius: "var(--radius-lg, 12px)",
						padding: "24px",
						marginBottom: "40px",
						position: "relative",
						overflow: "hidden",
					}}
				>
					<div
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							height: "1px",
							background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
							opacity: 0.2,
						}}
					/>
					
					<div
						className="grid gap-4 md:grid-cols-6"
						style={{ position: "relative", zIndex: 1 }}
					>
						<input
							id="discovery-query"
							value={query}
							onChange={(e) => {
								setPage(1);
								setQuery(e.target.value);
							}}
							placeholder="Search by title, topic..."
							style={{
								backgroundColor: "var(--bg-overlay)",
								border: "1px solid var(--border-dim)",
								borderRadius: "var(--radius-sm, 6px)",
								padding: "12px 16px",
								color: "var(--text-primary)",
								fontSize: "14px",
								fontFamily: "var(--font-body)",
								outline: "none",
								width: "100%",
							}}
							className="md:col-span-2 focus:border-[var(--gold)] transition-colors"
						/>
						<input
							id="discovery-city"
							value={city}
							onChange={(e) => {
								setPage(1);
								setCity(e.target.value);
							}}
							placeholder="City"
							style={{
								backgroundColor: "var(--bg-overlay)",
								border: "1px solid var(--border-dim)",
								borderRadius: "var(--radius-sm, 6px)",
								padding: "12px 16px",
								color: "var(--text-primary)",
								fontSize: "14px",
								fontFamily: "var(--font-body)",
								outline: "none",
								width: "100%",
							}}
							className="focus:border-[var(--gold)] transition-colors"
						/>
						<select
							id="discovery-type"
							value={eventType}
							onChange={(e) => {
								setPage(1);
								setEventType(e.target.value);
							}}
							style={{
								backgroundColor: "var(--bg-overlay)",
								border: "1px solid var(--border-dim)",
								borderRadius: "var(--radius-sm, 6px)",
								padding: "12px 16px",
								color: "var(--text-primary)",
								fontSize: "14px",
								fontFamily: "var(--font-body)",
								outline: "none",
								width: "100%",
							}}
							className="focus:border-[var(--gold)] transition-colors"
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
							style={{
								backgroundColor: "var(--bg-overlay)",
								border: "1px solid var(--border-dim)",
								borderRadius: "var(--radius-sm, 6px)",
								padding: "12px 16px",
								color: "var(--text-primary)",
								fontSize: "14px",
								fontFamily: "var(--font-body)",
								outline: "none",
								width: "100%",
							}}
							className="focus:border-[var(--gold)] transition-colors"
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
							style={{
								backgroundColor: "var(--bg-overlay)",
								border: "1px solid var(--border-dim)",
								borderRadius: "var(--radius-sm, 6px)",
								padding: "12px 16px",
								color: "var(--text-primary)",
								fontSize: "14px",
								fontFamily: "var(--font-body)",
								outline: "none",
								width: "100%",
							}}
							className="focus:border-[var(--gold)] transition-colors"
						>
							<option value="relevance">Relevance</option>
							<option value="date_asc">Soonest</option>
							<option value="date_desc">Latest</option>
							<option value="popular">Popular</option>
							<option value="trending">Trending</option>
						</select>
					</div>
					<div
						style={{
							marginTop: "16px",
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: "12px",
						}}
					>
						<p
							style={{
								fontSize: "12px",
								color: "var(--text-muted)",
								fontFamily: "var(--font-mono)",
							}}
						>
							Smart ranking enabled
						</p>
						<button
							type="button"
							onClick={handleSaveSearch}
							disabled={saving}
							id="save-search-button"
							style={{
								backgroundColor: "transparent",
								border: "1px solid var(--border-gold)",
								color: "var(--gold)",
								padding: "8px 16px",
								borderRadius: "var(--radius-sm, 6px)",
								fontSize: "12px",
								fontFamily: "var(--font-mono)",
								fontWeight: 600,
								textTransform: "uppercase",
								letterSpacing: "0.05em",
								cursor: saving ? "not-allowed" : "pointer",
								opacity: saving ? 0.5 : 1,
								transition: "all 0.2s ease",
							}}
							className="hover:bg-[var(--gold-subtle)]"
						>
							{saving ? "Saving..." : "Save search"}
						</button>
					</div>
				</section>

				{/* RESULTS SECTION */}
				{loading ? (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, idx) => (
							<div
								key={idx}
								style={{
									height: "360px",
									backgroundColor: "var(--bg-surface)",
									border: "1px solid var(--border-dim)",
									borderRadius: "var(--radius-lg, 12px)",
								}}
								className="animate-pulse"
							/>
						))}
					</div>
				) : events.length === 0 ? (
					<section
						style={{
							border: "1px dashed var(--border-dim)",
							backgroundColor: "var(--bg-overlay)",
							borderRadius: "var(--radius-lg, 12px)",
							padding: "60px 20px",
							textAlign: "center",
						}}
					>
						<h2
							style={{
								fontSize: "18px",
								fontFamily: "var(--font-display)",
								color: "var(--text-primary)",
								fontWeight: 600,
							}}
						>
							No events found
						</h2>
						<p
							style={{
								marginTop: "8px",
								fontSize: "14px",
								color: "var(--text-muted)",
							}}
						>
							Try broader terms, remove filters, or check out trending events.
						</p>
					</section>
				) : (
					<section>
						<div
							style={{
								marginBottom: "16px",
								fontSize: "12px",
								color: "var(--text-muted)",
								fontFamily: "var(--font-mono)",
								letterSpacing: "0.05em",
							}}
						>
							{pagination.total} RESULTS
						</div>
						<ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{events.map((event, index) => {
								const d = new Date(event.startAt);
								const dayNum = d.getDate();
								const month = d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();

								return (
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
											style={{
												display: "flex",
												flexDirection: "column",
												height: "100%",
												backgroundColor: "var(--bg-surface)",
												border: "1px solid var(--border-dim)",
												borderRadius: "var(--radius-lg, 12px)",
												overflow: "hidden",
												transition: "all 0.3s ease",
											}}
											className="group hover:border-[var(--gold)] hover:shadow-[0_4px_20px_rgba(255,107,53,0.1)] hover:-translate-y-1"
										>
											{event.coverImageUrl ? (
												<div
													style={{
														width: "100%",
														height: "180px",
														backgroundImage: `url(${event.coverImageUrl})`,
														backgroundSize: "cover",
														backgroundPosition: "center",
														borderBottom: "1px solid var(--border-dim)",
													}}
												/>
											) : (
												<div
													style={{
														width: "100%",
														height: "180px",
														backgroundColor: "var(--bg-overlay)",
														borderBottom: "1px solid var(--border-dim)",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
													}}
												>
													<span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.05em" }}>
														NO COVER IMAGE
													</span>
												</div>
											)}
											<div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														justifyContent: "space-between",
														marginBottom: "12px",
													}}
												>
													<span
														style={{
															fontSize: "10px",
															fontFamily: "var(--font-mono)",
															color: "var(--gold)",
															textTransform: "uppercase",
															letterSpacing: "0.05em",
															backgroundColor: "var(--gold-subtle)",
															padding: "4px 8px",
															borderRadius: "4px",
														}}
													>
														{event.category || "Event"}
													</span>
													<span
														style={{
															fontSize: "12px",
															fontFamily: "var(--font-mono)",
															color: "var(--text-muted)",
															letterSpacing: "0.05em",
														}}
													>
														{dayNum} {month}
													</span>
												</div>
												<h3
													style={{
														fontFamily: "var(--font-display)",
														fontSize: "22px",
														fontWeight: 600,
														color: "var(--text-primary)",
														lineHeight: 1.3,
														marginBottom: "12px",
													}}
													className="line-clamp-2 group-hover:text-[var(--gold)] transition-colors"
												>
													{event.title}
												</h3>
												<p
													style={{
														fontSize: "14px",
														color: "var(--text-secondary)",
														lineHeight: 1.6,
														marginBottom: "24px",
														flexGrow: 1,
													}}
													className="line-clamp-2"
												>
													{event.shortDescription}
												</p>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														justifyContent: "space-between",
														borderTop: "1px solid var(--border-dim)",
														paddingTop: "16px",
														marginTop: "auto",
													}}
												>
													<span
														style={{
															fontSize: "12px",
															color: "var(--text-muted)",
															display: "flex",
															alignItems: "center",
															gap: "6px",
														}}
													>
														<span
															style={{
																width: "6px",
																height: "6px",
																borderRadius: "50%",
																backgroundColor:
																	event.eventType === "online"
																		? "#10B981"
																		: event.eventType === "offline"
																			? "#F59E0B"
																			: "#3B82F6",
															}}
														/>
														{event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
													</span>
													<span
														style={{
															fontFamily: "var(--font-mono)",
															fontSize: "14px",
															fontWeight: 600,
															color: event.isPaid ? "var(--text-primary)" : "var(--gold)",
															letterSpacing: "0.05em",
														}}
													>
														{event.isPaid
															? `${getCurrencySymbol(event.currency || "USD")}${event.basePrice}`
															: "FREE"}
													</span>
												</div>
											</div>
										</Link>
									</li>
								);
							})}
						</ul>
						
						{/* PAGINATION */}
						{pagination.totalPages > 1 && (
							<div
								style={{
									marginTop: "48px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									gap: "16px",
								}}
							>
								<button
									type="button"
									disabled={pagination.page <= 1}
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									style={{
										backgroundColor: "var(--bg-surface)",
										border: "1px solid var(--border-dim)",
										color: "var(--text-primary)",
										padding: "10px 20px",
										borderRadius: "var(--radius-sm, 6px)",
										fontSize: "13px",
										fontFamily: "var(--font-mono)",
										cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
										opacity: pagination.page <= 1 ? 0.5 : 1,
										letterSpacing: "0.05em",
									}}
									className="hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
								>
									← PREV
								</button>
								<span
									style={{
										fontSize: "13px",
										color: "var(--text-muted)",
										fontFamily: "var(--font-mono)",
										letterSpacing: "0.05em",
									}}
								>
									{pagination.page} / {pagination.totalPages}
								</span>
								<button
									type="button"
									disabled={pagination.page >= pagination.totalPages}
									onClick={() => setPage((p) => p + 1)}
									style={{
										backgroundColor: "var(--bg-surface)",
										border: "1px solid var(--border-dim)",
										color: "var(--text-primary)",
										padding: "10px 20px",
										borderRadius: "var(--radius-sm, 6px)",
										fontSize: "13px",
										fontFamily: "var(--font-mono)",
										cursor: pagination.page >= pagination.totalPages ? "not-allowed" : "pointer",
										opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
										letterSpacing: "0.05em",
									}}
									className="hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
								>
									NEXT →
								</button>
							</div>
						)}
					</section>
				)}
			</div>
		</main>
	);
}
