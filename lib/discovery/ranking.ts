import { DISCOVERY_CONFIG } from "@/lib/discovery/config";
import { tokenizeQuery } from "@/lib/discovery/normalization";

type EventLike = {
	_id: string;
	title: string;
	shortDescription?: string;
	description?: string;
	category?: string;
	tags?: string[];
	searchableText?: string;
	startAt: Date | string;
	endAt: Date | string;
	eventType?: "online" | "offline" | "hybrid";
	isPaid?: boolean;
	location?: { city?: string };
	geo?: { coordinates: [number, number] };
	qualityScore?: number;
	popularityScore?: number;
	trendingScore?: number;
	stats?: {
		viewsCount?: number;
		registrationsCount?: number;
		bookmarksCount?: number;
	};
};

type ProfileLike = {
	preferredCategories?: string[];
	preferredCities?: string[];
	preferredFormats?: Array<"online" | "offline" | "hybrid">;
	priceAffinity?: "free" | "mixed" | "paid";
	recentInteractions?: Array<{
		eventId?: string | { toString(): string };
		category?: string;
		weight: number;
	}>;
};

type RankContext = {
	query?: string;
	city?: string;
	coords?: { lat: number; lng: number };
	profile?: ProfileLike | null;
	now?: Date;
};

export type RankedEvent<T> = T & {
	ranking: {
		textRelevance: number;
		freshness: number;
		popularity: number;
		quality: number;
		geoProximity: number;
		personalizationBoost: number;
		finalScore: number;
	};
};

function clamp01(value: number): number {
	if (value < 0) return 0;
	if (value > 1) return 1;
	return value;
}

function toDate(value: Date | string): Date {
	return value instanceof Date ? value : new Date(value);
}

function daysBetween(from: Date, to: Date): number {
	const diff = to.getTime() - from.getTime();
	return diff / (1000 * 60 * 60 * 24);
}

function textRelevanceScore(event: EventLike, query?: string): number {
	const tokens = tokenizeQuery(query);
	if (tokens.length === 0) return 0;

	const title = event.title.toLowerCase();
	const category = (event.category || "").toLowerCase();
	const tags = (event.tags || []).map((tag) => tag.toLowerCase());
	const searchable = (event.searchableText || "").toLowerCase();

	let score = 0;
	for (const token of tokens) {
		if (title.includes(token)) score += 0.4;
		if (tags.some((tag) => tag.includes(token))) score += 0.3;
		if (category.includes(token)) score += 0.2;
		if (searchable.includes(token)) score += 0.1;
	}

	return clamp01(score / tokens.length);
}

function freshnessScore(event: EventLike, now: Date): number {
	const startAt = toDate(event.startAt);
	const endAt = toDate(event.endAt);
	if (endAt < now) return 0;

	const daysUntilStart = daysBetween(now, startAt);
	const horizon = DISCOVERY_CONFIG.thresholds.freshnessHorizonDays;
	if (daysUntilStart <= 0) return 1;
	return clamp01(1 - daysUntilStart / horizon);
}

function popularityScore(event: EventLike): number {
	if (typeof event.popularityScore === "number") {
		return clamp01(event.popularityScore / 100);
	}

	const views = event.stats?.viewsCount || 0;
	const regs = event.stats?.registrationsCount || 0;
	const bookmarks = event.stats?.bookmarksCount || 0;
	const composite = views * 0.01 + regs * 0.08 + bookmarks * 0.04;
	return clamp01(composite / 10);
}

function qualityScore(event: EventLike): number {
	if (typeof event.qualityScore === "number") {
		return clamp01(event.qualityScore / 100);
	}

	let score = 0;
	if (event.title) score += 0.2;
	if (event.shortDescription) score += 0.15;
	if ((event.description || "").length > 120) score += 0.25;
	if ((event.tags || []).length >= 2) score += 0.1;
	if (event.category) score += 0.1;
	if (event.location?.city || event.eventType === "online") score += 0.1;
	if (event.geo?.coordinates) score += 0.1;
	return clamp01(score);
}

function haversineKm(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const earthRadiusKm = 6371;
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) *
			Math.cos(toRad(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return earthRadiusKm * c;
}

function geoProximityScore(
	event: EventLike,
	city?: string,
	coords?: { lat: number; lng: number },
): number {
	if (coords && event.geo?.coordinates?.length === 2) {
		const [eventLng, eventLat] = event.geo.coordinates;
		const distance = haversineKm(coords.lat, coords.lng, eventLat, eventLng);
		const maxDistance = DISCOVERY_CONFIG.thresholds.geoMaxDistanceKm;
		return clamp01(1 - distance / maxDistance);
	}

	if (city && event.location?.city) {
		return event.location.city.toLowerCase() === city.toLowerCase() ? 1 : 0;
	}

	return 0;
}

function personalizationScore(
	event: EventLike,
	profile?: ProfileLike | null,
): number {
	if (!profile) return 0;

	let score = 0;
	const preferredCategories = profile.preferredCategories || [];
	const preferredCities = profile.preferredCities || [];
	const preferredFormats = profile.preferredFormats || [];

	if (event.category && preferredCategories.includes(event.category))
		score += 0.35;
	if (event.location?.city && preferredCities.includes(event.location.city))
		score += 0.2;
	if (event.eventType && preferredFormats.includes(event.eventType))
		score += 0.2;

	const affinity = profile.priceAffinity || "mixed";
	if (affinity === "free" && !event.isPaid) score += 0.15;
	if (affinity === "paid" && event.isPaid) score += 0.15;
	if (affinity === "mixed") score += 0.05;

	const interactions = profile.recentInteractions || [];
	const interactionHit = interactions.find((entry) => {
		if (entry.eventId && entry.eventId.toString() === event._id) return true;
		if (entry.category && entry.category === event.category) return true;
		return false;
	});
	if (interactionHit) {
		score += Math.min(0.2, interactionHit.weight / 10);
	}

	return clamp01(score);
}

export function rankEvent<T extends EventLike>(
	event: T,
	context: RankContext,
): RankedEvent<T> {
	const now = context.now || new Date();
	const text = textRelevanceScore(event, context.query);
	const freshness = freshnessScore(event, now);
	const popularity = popularityScore(event);
	const quality = qualityScore(event);
	const geo = geoProximityScore(event, context.city, context.coords);
	const personalization = personalizationScore(event, context.profile);
	const w = DISCOVERY_CONFIG.weights;

	const finalScore =
		w.textRelevance * text +
		w.freshness * freshness +
		w.popularity * popularity +
		w.quality * quality +
		w.geoProximity * geo +
		w.personalizationBoost * personalization;

	return {
		...event,
		ranking: {
			textRelevance: text,
			freshness,
			popularity,
			quality,
			geoProximity: geo,
			personalizationBoost: personalization,
			finalScore,
		},
	};
}

export function rankEvents<T extends EventLike>(
	events: T[],
	context: RankContext,
): Array<RankedEvent<T>> {
	return events
		.map((event) => rankEvent(event, context))
		.sort((a, b) => {
			if (b.ranking.finalScore !== a.ranking.finalScore) {
				return b.ranking.finalScore - a.ranking.finalScore;
			}
			return toDate(a.startAt).getTime() - toDate(b.startAt).getTime();
		});
}
