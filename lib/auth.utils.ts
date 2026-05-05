import { randomBytes, createHash } from "crypto";
import { NextResponse } from "next/server";
import { getRedisClient } from "@/lib/cache/redis";

// ─── Token Utilities ─────────────────────────────────────────────────────────

/**
 * Generate a cryptographically secure random token (URL-safe base64).
 */
export function generateToken(): string {
	return randomBytes(32).toString("hex");
}

/**
 * Hash a token with SHA-256 for safe storage.
 * We never store raw tokens in the database.
 */
export function hashToken(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}

// ─── API Response Helpers ────────────────────────────────────────────────────

export interface ApiErrorResponse {
	code: string;
	message: string;
	fieldErrors?: Record<string, string[]>;
}

export function createErrorResponse(
	code: string,
	message: string,
	status: number,
	fieldErrors?: Record<string, string[]>,
) {
	return NextResponse.json(
		{ code, message, fieldErrors } satisfies ApiErrorResponse,
		{ status },
	);
}

export function createSuccessResponse(data: Record<string, unknown>, status = 200) {
	return NextResponse.json(data, { status });
}

// ─── Rate Limiting (In-Memory) ───────────────────────────────────────────────

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
	const now = Date.now();
	for (const [key, entry] of rateLimitStore) {
		if (entry.resetAt < now) {
			rateLimitStore.delete(key);
		}
	}
}, 5 * 60 * 1000);

/**
 * Simple in-memory rate limiter.
 * @param key - Unique identifier (e.g., IP + endpoint)
 * @param maxAttempts - Max attempts in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limited, false if allowed
 */
function isMemoryRateLimited(
	key: string,
	maxAttempts: number,
	windowMs: number,
): boolean {
	const now = Date.now();
	const entry = rateLimitStore.get(key);

	if (!entry || entry.resetAt < now) {
		rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
		return false;
	}

	entry.count++;
	if (entry.count > maxAttempts) {
		return true;
	}

	return false;
}

async function ensureRedisReady(
	client: NonNullable<ReturnType<typeof getRedisClient>>,
) {
	if (client.status === "ready") return;
	try {
		await client.connect();
	} catch (error) {
		const message = error instanceof Error ? error.message : "";
		if (!message.includes("already connecting") && !message.includes("connected")) {
			throw error;
		}
	}
}

/**
 * Redis-backed rate limiter with an in-memory fallback for local development.
 * @param key - Unique identifier (e.g., IP + endpoint)
 * @param maxAttempts - Max attempts in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limited, false if allowed
 */
export async function isRateLimited(
	key: string,
	maxAttempts: number = 5,
	windowMs: number = 15 * 60 * 1000, // 15 minutes
): Promise<boolean> {
	const redis = getRedisClient();
	const redisKey = `rate-limit:${key}`;

	if (redis) {
		try {
			await ensureRedisReady(redis);
			const attempts = await redis.incr(redisKey);
			if (attempts === 1) {
				await redis.pexpire(redisKey, windowMs);
			}
			return attempts > maxAttempts;
		} catch {
			// WARNING: in-memory fallback, not safe for multi-instance deployment.
		}
	}

	// [FIXED]: Disable rate limiting locally for easier debugging
	if (process.env.NODE_ENV === "development") {
		return false;
	}

	// [FIXED]: Auth rate limiting uses Redis when REDIS_URL is configured.
	// WARNING: in-memory fallback, not safe for multi-instance deployment.
	return isMemoryRateLimited(key, maxAttempts, windowMs);
}

/**
 * Extract client IP from request headers (works behind proxies).
 */
export function getClientIp(request: Request): string {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) {
		return forwarded.split(",")[0].trim();
	}
	return "unknown";
}
