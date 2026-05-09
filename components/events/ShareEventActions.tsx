"use client";

import { useMemo, useState } from "react";

export function ShareEventActions({
	eventId,
	title,
	canonicalUrl,
}: {
	eventId: string;
	title: string;
	canonicalUrl: string;
}) {
	const [copied, setCopied] = useState(false);
	const shareUrl = useMemo(() => {
		const url = new URL(canonicalUrl);
		url.searchParams.set("utm_source", "share");
		url.searchParams.set("utm_medium", "event_page");
		url.searchParams.set("utm_campaign", "feature6_growth");
		return url.toString();
	}, [canonicalUrl]);

	const trackShare = async () => {
		await fetch("/api/events/interactions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ eventId, type: "share", weight: 1 }),
		});
	};

	const handleNativeShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({ title, url: shareUrl });
				await trackShare();
				return;
			} catch {
				// Fallback to copy.
			}
		}

		await navigator.clipboard.writeText(shareUrl);
		setCopied(true);
		await trackShare();
		setTimeout(() => setCopied(false), 1500);
	};

	const handleCopy = async () => {
		await navigator.clipboard.writeText(shareUrl);
		setCopied(true);
		await trackShare();
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<div className="flex gap-2">
			<button
				type="button"
				onClick={handleNativeShare}
				id="event-share-button"
				className="hover:opacity-80 transition-opacity"
				style={{
					backgroundColor: "transparent",
					color: "var(--text-secondary)",
					fontFamily: "var(--font-mono)",
					fontSize: "11px",
					fontWeight: 600,
					textTransform: "uppercase",
					letterSpacing: "0.05em",
					padding: "6px 12px",
					borderRadius: "var(--radius-sm, 6px)",
					border: "1px solid var(--border-dim)",
					transition: "all 0.2s ease",
				}}
			>
				Share
			</button>
			<button
				type="button"
				onClick={handleCopy}
				id="event-copy-link-button"
				className="hover:opacity-80 transition-opacity"
				style={{
					backgroundColor: "transparent",
					color: "var(--text-secondary)",
					fontFamily: "var(--font-mono)",
					fontSize: "11px",
					fontWeight: 600,
					textTransform: "uppercase",
					letterSpacing: "0.05em",
					padding: "6px 12px",
					borderRadius: "var(--radius-sm, 6px)",
					border: "1px solid var(--border-dim)",
					transition: "all 0.2s ease",
				}}
			>
				{copied ? "Copied" : "Copy link"}
			</button>
		</div>
	);
}
