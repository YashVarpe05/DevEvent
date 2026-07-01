export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { DISCOVERY_CONFIG } from "@/lib/discovery/config";
import {
	buildFiltersHash,
	endOfDayUtc,
	startOfDayUtc,
	toNumber,
} from "@/lib/discovery/normalization";
import { rankEvents } from "@/lib/discovery/ranking";
import UserInterestProfile from "@/database/user-interest-profile.model";
import { cacheGet, cacheSet } from "@/lib/cache/redis";
import { trackServerEvent } from "@/lib/analytics";
import { isRateLimited, getClientIp } from "@/lib/auth.utils";

export async function GET(request: Request) {
	try {
		// Throttle this public endpoint to deter scraping / abuse. Generous for
		// real browsing; rejected cheaply before auth() or any DB work.
		const ip = getClientIp(request);
		if (await isRateLimited(`public-search:${ip}`, 60, 60 * 1000)) {
			return NextResponse.json(
				{ error: "Too many requests. Please slow down." },
				{ status: 429, headers: { "Retry-After": "60" } },
			);
		}

		const url = new URL(request.url);
		const session = await auth();
		const page = Math.max(
			toNumber(
				url.searchParams.get("page"),
				DISCOVERY_CONFIG.pagination.defaultPage,
			),
			1,
		);
		const requestedLimit = toNumber(
			url.searchParams.get("limit"),
			DISCOVERY_CONFIG.pagination.defaultLimit,
		);
		const limit = Math.min(
			Math.max(requestedLimit, 1),
			DISCOVERY_CONFIG.pagination.maxLimit,
		);
		const sort = url.searchParams.get("sort") || "relevance";
		const q = url.searchParams.get("q") || "";
		const includeEnded = url.searchParams.get("includeEnded") === "true";
		const city = url.searchParams.get("city") || "";
		const country = url.searchParams.get("country") || "";
		const category = url.searchParams.get("category") || "";
		const eventType = url.searchParams.get("eventType") || "";
		const priceType = url.searchParams.get("priceType") || "";
		const minPrice = url.searchParams.get("minPrice");
		const maxPrice = url.searchParams.get("maxPrice");
		const startDate = url.searchParams.get("startDate");
		const endDate = url.searchParams.get("endDate");
		const tags = url.searchParams.getAll("tags").filter(Boolean);
		const lat = url.searchParams.get("lat");
		const lng = url.searchParams.get("lng");

		const filtersInput = {
			q,
			category,
			tags,
			city,
			country,
			startDate,
			endDate,
			eventType,
			priceType,
			minPrice,
			maxPrice,
			sort,
			page,
			limit,
			includeEnded,
			lat,
			lng,
		};

		const cacheKey = `discovery:search:${buildFiltersHash(filtersInput)}:${session?.user?.id || "anon"}`;
		const cached = await cacheGet(cacheKey);
		if (cached) {
			return NextResponse.json(cached);
		}

		await connectDB();

		const baseQuery: Record<string, unknown> = {
			status: "published",
			visibility: "public",
			deletedAt: null,
		};

		const now = new Date();
		if (!includeEnded) {
			baseQuery.endAt = { $gte: now };
		}
		if (category) baseQuery.category = category;
		if (city) baseQuery["location.city"] = city;
		if (country) baseQuery["location.country"] = country;
		if (eventType) baseQuery.eventType = eventType;
		if (priceType === "free") baseQuery.isPaid = false;
		if (priceType === "paid") baseQuery.isPaid = true;
		if (tags.length > 0) baseQuery.tags = { $in: tags };
		if (q) baseQuery.$text = { $search: q };
		if (startDate || endDate) {
			baseQuery.startAt = {};
			if (startDate)
				(baseQuery.startAt as Record<string, unknown>).$gte = startOfDayUtc(
					new Date(startDate),
				);
			if (endDate)
				(baseQuery.startAt as Record<string, unknown>).$lte = endOfDayUtc(
					new Date(endDate),
				);
		}
		if (minPrice || maxPrice) {
			baseQuery.basePrice = {};
			if (minPrice)
				(baseQuery.basePrice as Record<string, unknown>).$gte =
					Number(minPrice);
			if (maxPrice)
				(baseQuery.basePrice as Record<string, unknown>).$lte =
					Number(maxPrice);
		}

		const skip = (page - 1) * limit;
		const fetchLimit = Math.min(skip + limit * 6, 500);

		let query = Event.find(baseQuery).lean();
		if (sort === "date_asc") query = query.sort({ startAt: 1 });
		if (sort === "date_desc") query = query.sort({ startAt: -1 });
		if (sort === "popular")
			query = query.sort({ popularityScore: -1, startAt: 1 });
		if (sort === "trending")
			query = query.sort({ trendingScore: -1, startAt: 1 });
		if (sort === "relevance" && q)
			query = query.sort({
				score: { $meta: "textScore" },
				startAt: 1,
			} as never);

		const [events, total] = await Promise.all([
			query.limit(fetchLimit),
			Event.countDocuments(baseQuery),
		]);

		const profile = session?.user?.id
			? await UserInterestProfile.findOne({ userId: session.user.id }).lean()
			: null;

		let ranked = events.map((event) => ({
			...event,
			_id: event._id.toString(),
		}));
		if (sort === "relevance") {
			ranked = rankEvents(ranked, {
				query: q,
				city,
				coords: lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined,
				profile,
			});
		}

		const pageItems = ranked.slice(skip, skip + limit);
		const payload = {
			events: pageItems,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
			sort,
		};

		await cacheSet(cacheKey, payload, DISCOVERY_CONFIG.cache.searchTtlSeconds);

		trackServerEvent("search_performed", {
			query: q,
			filtersHash: buildFiltersHash(filtersInput),
			page,
			limit,
			userId: session?.user?.id || null,
		});

		return NextResponse.json(payload);
	} catch (error: unknown) {
		console.error("Public search error", error);
		const message = error instanceof Error ? error.message : "Search failed";
		return NextResponse.json(
			{ error: message },
			{ status: 500 },
		);
	}
}
