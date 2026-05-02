"use client";
import { SessionProvider } from "next-auth/react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

function PostHogProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
			api_host: "/ingest",
			ui_host: "https://us.posthog.com",
			capture_pageview: false, // Disable automatic pageview capture, as we capture manually
			capture_pageleave: true,
		});
	}, []);

	return <PHProvider client={posthog}>{children}</PHProvider>;
}

// [FIXED]: Session and analytics providers now live in one app-level wrapper.
export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			<PostHogProvider>{children}</PostHogProvider>
		</SessionProvider>
	);
}
