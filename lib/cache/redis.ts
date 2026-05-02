import { Redis } from "ioredis";

type CacheValue = {
	expiresAt: number;
	payload: string;
};

const inMemoryCache = new Map<string, CacheValue>();

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
	const url = process.env.REDIS_URL;
	if (!url) return null;
	if (redisClient) return redisClient;

	redisClient = new Redis(url, {
		maxRetriesPerRequest: 1,
		enableOfflineQueue: false,
		lazyConnect: true,
	});
	return redisClient;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
	const client = getRedisClient();
	if (client) {
		try {
			await client.connect();
			const data = await client.get(key);
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
	const client = getRedisClient();
	if (client) {
		try {
			await client.connect();
			await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
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
	const client = getRedisClient();
	if (client) {
		try {
			await client.connect();
			const stream = client.scanStream({ match: `${prefix}*`, count: 100 });
			stream.on("data", async (keys: string[]) => {
				if (keys.length > 0) {
					await client.del(keys);
				}
			});
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
