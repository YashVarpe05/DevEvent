// Validates environment configuration when the server starts and boots
// Sentry error monitoring (inert unless SENTRY_DSN is set).
// Critical variables abort a production boot; recommended ones only warn,
// since the app has graceful fallbacks for them (emails log instead of send,
// caching/rate limiting fall back to in-memory, payments stay disabled).
import * as Sentry from "@sentry/nextjs";

// Reports errors from nested React Server Components to Sentry
export const onRequestError = Sentry.captureRequestError;

export async function register() {
	if (process.env.SENTRY_DSN) {
		Sentry.init({
			dsn: process.env.SENTRY_DSN,
			environment: process.env.NODE_ENV,
			tracesSampleRate: 0.1,
		});
	}

	if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== "nodejs") return;

	const critical = ["MONGODB_URI"] as const;
	const criticalProd = ["NEXTAUTH_SECRET", "NEXTAUTH_URL", "NEXT_PUBLIC_BASE_URL", "CRON_SECRET"] as const;
	const recommended = [
		"UPSTASH_REDIS_REST_URL",
		"UPSTASH_REDIS_REST_TOKEN",
		"RESEND_API_KEY",
		"STRIPE_SECRET_KEY",
		"STRIPE_WEBHOOK_SECRET",
		"GOOGLE_CLIENT_ID",
		"GOOGLE_CLIENT_SECRET",
	] as const;

	const isProduction = process.env.NODE_ENV === "production";
	const missingCritical = [
		...critical.filter((key) => !process.env[key]),
		...(isProduction ? criticalProd.filter((key) => !process.env[key] && !process.env[key.replace("NEXTAUTH_", "AUTH_")]) : []),
	];
	const missingRecommended = recommended.filter((key) => !process.env[key]);

	if (missingRecommended.length > 0) {
		console.warn(
			`[env] Missing recommended environment variables (features degrade gracefully): ${missingRecommended.join(", ")}`,
		);
	}

	if (missingCritical.length > 0) {
		const message = `[env] Missing critical environment variables: ${missingCritical.join(", ")}`;
		if (isProduction) {
			throw new Error(message);
		}
		console.warn(`${message} — continuing because NODE_ENV is not production`);
	}
}
