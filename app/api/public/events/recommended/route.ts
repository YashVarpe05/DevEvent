import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { getRecommendedEvents } from "@/lib/discovery/recommendations";
import { DISCOVERY_CONFIG } from "@/lib/discovery/config";
import { cacheGet, cacheSet } from "@/lib/cache/redis";
import { buildFiltersHash } from "@/lib/discovery/normalization";

export async function GET(request: Request) {
	try {
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
