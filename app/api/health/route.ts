export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { getUpstash } from "@/lib/cache/redis";

/**
 * GET /api/health
 *
 * Production health-check endpoint.  Returns the connectivity status of
 * critical backing services (MongoDB, Redis) so uptime monitors and load
 * balancers can determine whether the instance is healthy.
 *
 * • 200 — all critical services reachable
 * • 503 — at least one critical service is unreachable
 */
export async function GET() {
	const checks: Record<string, { status: string; latencyMs?: number }> = {};
	let healthy = true;

	// ── MongoDB ──────────────────────────────────────────────────────────
	try {
		const start = Date.now();
		// Ensure a connection on cold serverless instances (readyState would be
		// 0 until the first query, which would falsely report unhealthy).
		await connectDB();
		const state = mongoose.connection.readyState;
		// 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
		if (state === 1) {
			// Connection pool is live — run a lightweight admin ping to confirm
			// the cluster is actually responding.
			await mongoose.connection.db!.admin().ping();
			checks.mongodb = { status: "ok", latencyMs: Date.now() - start };
		} else {
			// Mongoose hasn't connected yet (cold start).  Attempt a quick
			// connection via the existing connectDB helper's cached promise
			// isn't worth the side-effects here — just report the state.
			checks.mongodb = { status: `not_connected (readyState=${state})` };
			healthy = false;
		}
	} catch (err) {
		checks.mongodb = {
			status: `error: ${err instanceof Error ? err.message : "unknown"}`,
		};
		healthy = false;
	}

	// ── Redis (Upstash) ──────────────────────────────────────────────────
	try {
		const client = getUpstash();
		if (client) {
			const start = Date.now();
			const pong = await client.ping();
			checks.redis = {
				status: pong === "PONG" ? "ok" : `unexpected: ${pong}`,
				latencyMs: Date.now() - start,
			};
		} else {
			// Upstash isn't configured — not a hard failure (in-memory fallback
			// is used), but flag it so operators know.
			checks.redis = { status: "not_configured (using in-memory fallback)" };
		}
	} catch (err) {
		checks.redis = {
			status: `error: ${err instanceof Error ? err.message : "unknown"}`,
		};
		// Redis is non-critical (in-memory fallback exists), so we don't set
		// healthy = false here.  Adjust if Redis becomes mandatory.
	}

	return NextResponse.json(
		{
			status: healthy ? "healthy" : "degraded",
			timestamp: new Date().toISOString(),
			version: process.env.npm_package_version || "1.0.0",
			services: checks,
		},
		{ status: healthy ? 200 : 503 },
	);
}
