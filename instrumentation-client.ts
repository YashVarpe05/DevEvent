// Client-side Sentry initialization (Next.js instrumentation-client convention).
// Inert unless NEXT_PUBLIC_SENTRY_DSN is configured.
import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
	Sentry.init({
		dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
		environment: process.env.NODE_ENV,
		tracesSampleRate: 0.1,
		replaysOnErrorSampleRate: 0,
		replaysSessionSampleRate: 0,
	});
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
