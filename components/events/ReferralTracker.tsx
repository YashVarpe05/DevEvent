"use client";

import { useEffect, useRef } from "react";

export function ReferralTracker({ eventId }: { eventId: string }) {
	const trackedRef = useRef<string | null>(null);
	const trackedUref = useRef<string | null>(null);

	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		const ref = searchParams.get("ref");
		const uref = searchParams.get("uref");

		if (ref && ref !== trackedRef.current) {
			trackedRef.current = ref;
			
			// Save locally for checkout
			localStorage.setItem(`event_ref_${eventId}`, ref);

			// Track click asynchronously
			fetch("/api/referrals/track", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ eventId, code: ref }),
			}).catch((err) => console.error("Failed to track referral:", err));
		}

		if (uref && uref !== trackedUref.current) {
			trackedUref.current = uref;

			// Track click and set cookie via API
			fetch("/api/user-referral/track-click", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ eventId, referrerId: uref }),
			}).catch((err) => console.error("Failed to track user referral:", err));
		}
	}, [eventId]);

	return null;
}
