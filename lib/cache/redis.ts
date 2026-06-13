import { Redis as UpstashRedis } from "@upstash/redis";

// Caching + rate-limit backing store.
//
// Primary: Upstash Redis over its REST API (@upstash/redis). REST is the
// recommended client for serverless/edge (Vercel) — it's stateless HTTP, so
// there are no TCP connections to pool or leak across short-lived functions.
// Configure with UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
//
// Fallback: an in-process Map, used for local dev or if Upstash isn't
// configured. Not shared across instances — fine for a single dev server,
// NOT safe as the sole store in multi-instance production.

type CacheValue = {
	expiresAt: number;
	payload: string;
};

const inMemoryCache = new Map<string, CacheValue>();

let upstash: UpstashRedis | null = null;
let upstashResolved = false;

// Returns the Upstash REST client, or null when it isn't configured.
export function getUpstash(): UpstashRedis | null {
	if (upstashResolved) return upstash;
	upstashResolved = true;

	const url = process.env.UPSTASH_REDIS_REST_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN;
	if (url && token) {
		// Disable auto-(de)serialization so we control JSON ourselves and store
		// plain strings — avoids double-encoding surprises.
		upstash = new UpstashRedis({ url, token, automaticDeserialization: false });
	}
	return upstash;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
	const client = getUpstash();
	if (client) {
		try {
			const data = await client.get<string>(key);
			if (!data) return null;
			return JSON.parse(data) as T;
		} catch {
			// Fall through to in-memory cache.
		}
	}

	const cached = inMemoryCache.get(key);
	if (!cached) return null;
	if (cached.expiresAt < Date.now()) {
		inMemoryCache.delete(key);
		return null;
	}
	return JSON.parse(cached.payload) as T;
}

export async function cacheSet<T>(
	key: string,
	value: T,
	ttlSeconds: number,
): Promise<void> {
	const client = getUpstash();
	if (client) {
		try {
			await client.set(key, JSON.stringify(value), { ex: ttlSeconds });
			return;
		} catch {
			// Fall through to in-memory cache.
		}
	}

	inMemoryCache.set(key, {
		expiresAt: Date.now() + ttlSeconds * 1000,
		payload: JSON.stringify(value),
	});
}

export async function cacheDelByPrefix(prefix: string): Promise<void> {
	const client = getUpstash();
	if (client) {
		try {
			// SCAN in batches and delete matches. Upstash REST has no streaming
			// interface, so we loop the cursor manually.
			let cursor = "0";
			do {
				const [next, keys] = await client.scan(cursor, {
					match: `${prefix}*`,
					count: 100,
				});
				cursor = next;
				if (keys.length > 0) {
					await client.del(...keys);
				}
			} while (cursor !== "0");
			return;
		} catch {
			// Fall through to in-memory cache.
		}
	}

	for (const key of [...inMemoryCache.keys()]) {
		if (key.startsWith(prefix)) {
			inMemoryCache.delete(key);
		}
	}
}
