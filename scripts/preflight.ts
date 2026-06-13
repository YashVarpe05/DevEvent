/**
 * Preflight check — verifies the environment is wired correctly before deploy.
 * Run: npx tsx scripts/preflight.ts
 *
 * Never prints secret values. Reports presence (set/missing/placeholder) and
 * actually connects to MongoDB + Redis so you know the credentials work.
 */
import { readFileSync } from "fs";
import mongoose from "mongoose";

function loadEnv(file: string) {
	try {
		for (const line of readFileSync(file, "utf8").split("\n")) {
			const t = line.trim();
			if (!t || t.startsWith("#")) continue;
			const i = t.indexOf("=");
			if (i === -1) continue;
			const k = t.slice(0, i).trim();
			// Strip surrounding quotes the way dotenv/Next.js does
			const v = t.slice(i + 1).trim().replace(/^['"]|['"]$/g, "");
			if (!process.env[k]) process.env[k] = v;
		}
	} catch {
		/* file may not exist */
	}
}
loadEnv(".env.local");
loadEnv(".env");

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

// Values from .env.example that mean "not configured yet"
const PLACEHOLDER_HINTS = [
	"your-",
	"your_",
	"_here",
	"user:password",
	"sk_test_your",
	"pk_test_your",
	"re_your",
	"rzp_test_your",
	"phc_your",
	"minimum-32-chars",
	"yourdomain.com",
];

function classify(value: string | undefined): "set" | "missing" | "placeholder" {
	if (!value || value.trim() === "") return "missing";
	const lower = value.toLowerCase();
	if (PLACEHOLDER_HINTS.some((h) => lower.includes(h))) return "placeholder";
	return "set";
}

type VarSpec = { name: string; tier: "critical" | "recommended" | "optional"; note?: string };

const VARS: VarSpec[] = [
	{ name: "MONGODB_URI", tier: "critical" },
	{ name: "NEXTAUTH_SECRET", tier: "critical" },
	{ name: "NEXTAUTH_URL", tier: "critical" },
	{ name: "NEXT_PUBLIC_BASE_URL", tier: "critical" },
	{ name: "CRON_SECRET", tier: "critical" },
	{ name: "UPSTASH_REDIS_REST_URL", tier: "recommended", note: "rate limits + cache (in-memory fallback)" },
	{ name: "UPSTASH_REDIS_REST_TOKEN", tier: "recommended", note: "paired with the URL above" },
	{ name: "RESEND_API_KEY", tier: "recommended", note: "emails log to console without it" },
	{ name: "RESEND_FROM_EMAIL", tier: "recommended" },
	{ name: "RAZORPAY_KEY_ID", tier: "recommended", note: "paid events" },
	{ name: "RAZORPAY_KEY_SECRET", tier: "recommended", note: "paid events" },
	{ name: "GOOGLE_CLIENT_ID", tier: "recommended", note: "Google sign-in" },
	{ name: "GOOGLE_CLIENT_SECRET", tier: "recommended", note: "Google sign-in" },
	{ name: "CLOUDINARY_URL", tier: "recommended", note: "image uploads" },
	{ name: "NEXT_PUBLIC_POSTHOG_KEY", tier: "optional", note: "analytics" },
	{ name: "SENTRY_DSN", tier: "optional", note: "error monitoring" },
	{ name: "STRIPE_SECRET_KEY", tier: "optional", note: "global payments" },
];

let hardFail = false;

function report() {
	console.log(`\n${DIM}── Environment variables ──────────────────────────${RESET}`);
	for (const spec of VARS) {
		const state = classify(process.env[spec.name]);
		let icon = "";
		if (state === "set") icon = `${GREEN}✓ set        ${RESET}`;
		else if (state === "placeholder") icon = `${YELLOW}● placeholder${RESET}`;
		else icon = `${RED}✗ missing    ${RESET}`;

		const noteStr = spec.note ? `${DIM} — ${spec.note}${RESET}` : "";
		console.log(`  ${icon} ${spec.name}${noteStr}`);

		if (state !== "set" && spec.tier === "critical") hardFail = true;
	}
}

async function checkMongo(): Promise<void> {
	const uri = process.env.MONGODB_URI;
	if (classify(uri) !== "set") {
		console.log(`  ${RED}✗${RESET} MongoDB — no real URI configured`);
		hardFail = true;
		return;
	}
	try {
		await mongoose.connect(uri as string, { serverSelectionTimeoutMS: 8000 });
		const dbName = mongoose.connection.db?.databaseName || "(default)";
		console.log(`  ${GREEN}✓${RESET} MongoDB — connected ${DIM}(db: ${dbName})${RESET}`);
		await mongoose.disconnect();
	} catch (err) {
		console.log(`  ${RED}✗${RESET} MongoDB — connection failed: ${(err as Error).message.split("\n")[0]}`);
		hardFail = true;
	}
}

async function checkRedis(): Promise<void> {
	const url = process.env.UPSTASH_REDIS_REST_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN;
	if (classify(url) !== "set" || classify(token) !== "set") {
		console.log(`  ${YELLOW}●${RESET} Upstash Redis — not set (using in-memory fallback)`);
		return;
	}
	try {
		const res = await fetch(`${url}/ping`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (res.ok) {
			const data = (await res.json()) as { result?: string };
			console.log(`  ${GREEN}✓${RESET} Upstash Redis — ${data.result === "PONG" ? "reachable (PONG)" : "reachable"}`);
		} else {
			console.log(`  ${RED}✗${RESET} Upstash Redis — token rejected (HTTP ${res.status})`);
			hardFail = true;
		}
	} catch (err) {
		console.log(`  ${YELLOW}●${RESET} Upstash Redis — could not reach REST API ${DIM}(${(err as Error).message.split("\n")[0]})${RESET}`);
	}
}

async function checkResend(): Promise<void> {
	const key = process.env.RESEND_API_KEY;
	if (classify(key) !== "set") {
		console.log(`  ${YELLOW}●${RESET} Resend — not set (emails log to console)`);
		return;
	}
	try {
		const res = await fetch("https://api.resend.com/domains", {
			headers: { Authorization: `Bearer ${key}` },
		});
		if (res.ok) {
			const data = (await res.json()) as { data?: Array<{ name: string; status: string }> };
			const domains = data.data || [];
			const verified = domains.filter((d) => d.status === "verified").map((d) => d.name);
			if (verified.length > 0) {
				console.log(`  ${GREEN}✓${RESET} Resend — key valid, verified domains: ${verified.join(", ")}`);
			} else {
				console.log(`  ${YELLOW}●${RESET} Resend — key valid but NO verified sending domain (emails may hit spam)`);
			}
		} else {
			console.log(`  ${RED}✗${RESET} Resend — key rejected (HTTP ${res.status})`);
		}
	} catch (err) {
		console.log(`  ${YELLOW}●${RESET} Resend — could not reach API: ${(err as Error).message.split("\n")[0]}`);
	}
}

async function main() {
	console.log(`\n${DIM}Preflight — values are never printed, only their status.${RESET}`);
	report();

	console.log(`\n${DIM}── Live connections ───────────────────────────────${RESET}`);
	await checkMongo();
	await checkRedis();
	await checkResend();

	console.log("");
	if (hardFail) {
		console.log(`${RED}✗ Preflight failed — fix the critical items above before deploying.${RESET}\n`);
	} else {
		console.log(`${GREEN}✓ Preflight passed — critical config is in place.${RESET}\n`);
	}
	// Set the code and let the event loop drain so open handles close cleanly,
	// rather than force-exiting mid-teardown.
	process.exitCode = hardFail ? 1 : 0;
}

main();
