export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { getRecommendedEvents } from "@/lib/discovery/recommendations";
import { DISCOVERY_CONFIG } from "@/lib/discovery/config";
import { cacheGet, cacheSet } from "@/lib/cache/redis";
import { buildFiltersHash } from "@/lib/discovery/normalization";
import { isRateLimited, getClientIp } from "@/lib/auth.utils";

export async function GET(request: Request) {
	try {
		// Throttle this public endpoint to deter scraping / abuse.
		const ip = getClientIp(request);
		if (await isRateLimited(`public-recommended:${ip}`, 60, 60 * 1000)) {
			return NextResponse.json(
				{ error: "Too many requests. Please slow down." },
				{ status: 429, headers: { "Retry-After": "60" } },
			);
		}

		const session = await auth();
		const url = new URL(request.url);
		const city = url.searchParams.get("city") || "";
		const category = url.searchParams.get("category") || "";
		const limit = Math.min(
			Number(
				url.searchParams.get("limit") ||
					DISCOVERY_CONFIG.thresholds.recommendedLimit,
			),
			24,
		);

		const key = `discovery:recommended:${buildFiltersHash({ city, category, limit, userId: session?.user?.id || null })}`;
		const cached = await cacheGet(key);
		if (cached) {
			return NextResponse.json(cached);
		}

		await connectDB();
		const events = await getRecommendedEvents({
			userId: session?.user?.id,
			city,
			category,
			limit,
		});

		const payload = { events };
		await cacheSet(key, payload, DISCOVERY_CONFIG.cache.recommendedTtlSeconds);
		return NextResponse.json(payload);
	} catch (error: any) {
		console.error("Recommended events error", error);
		return NextResponse.json(
			{ error: error.message || "Failed to load recommendations" },
			{ status: 500 },
		);
	}
}
