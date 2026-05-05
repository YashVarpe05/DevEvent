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
				className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
			>
				Share
			</button>
			<button
				type="button"
				onClick={handleCopy}
				id="event-copy-link-button"
				className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
			>
				{copied ? "Copied" : "Copy link"}
			</button>
		</div>
	);
}
