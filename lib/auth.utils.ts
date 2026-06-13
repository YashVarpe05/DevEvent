import { randomBytes, createHash } from "crypto";
import { NextResponse } from "next/server";
import { getUpstash } from "@/lib/cache/redis";

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

/**
 * Distributed rate limiter backed by Upstash Redis (REST), with an in-memory
 * fallback for local development. Uses a fixed window: INCR the counter and set
 * its expiry on first hit.
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
	const redis = getUpstash();
	const redisKey = `rate-limit:${key}`;

	if (redis) {
		try {
			const attempts = await redis.incr(redisKey);
			if (attempts === 1) {
				await redis.pexpire(redisKey, windowMs);
			}
			return attempts > maxAttempts;
		} catch {
			// Fall through to the in-memory limiter on transient REST errors.
		}
	}

	// Disable rate limiting locally for easier debugging.
	if (process.env.NODE_ENV === "development") {
		return false;
	}

	// WARNING: in-memory fallback is per-instance, not safe as the sole limiter
	// in multi-instance production. Configure Upstash in production.
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
