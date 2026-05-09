"use client";

import { useEffect, useState } from "react";

export function FollowOrganizerButton({
	organizerId,
}: {
	organizerId: string;
}) {
	const [loading, setLoading] = useState(false);
	const [following, setFollowing] = useState(false);
	const [followersCount, setFollowersCount] = useState(0);
	const [error, setError] = useState("");

	useEffect(() => {
		const load = async () => {
			try {
				const response = await fetch(`/api/organizers/${organizerId}/follow`);
				const data = await response.json();
				setFollowing(!!data.following);
				setFollowersCount(Number(data.followersCount || 0));
			} catch {
				setError("Could not load follow state");
			}
		};
		load();
	}, [organizerId]);

	const handleToggle = async () => {
		setLoading(true);
		setError("");
		try {
			const method = following ? "DELETE" : "PUT";
			const response = await fetch(`/api/organizers/${organizerId}/follow`, {
				method,
			});
			if (!response.ok) {
				const data = await response.json();
				setError(data.error || "Please sign in to follow organizers");
				return;
			}

			setFollowing((current) => !current);
			setFollowersCount((count) =>
				following ? Math.max(0, count - 1) : count + 1,
			);
		} catch {
			setError("Unable to update follow state");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
			<button
				type="button"
				onClick={handleToggle}
				disabled={loading}
				id="organizer-follow-button"
				className="hover:opacity-80 transition-opacity disabled:opacity-50"
				style={{
					backgroundColor: following ? "transparent" : "var(--gold-subtle)",
					color: following ? "var(--text-secondary)" : "var(--gold)",
					fontFamily: "var(--font-mono)",
					fontSize: "11px",
					fontWeight: 600,
					textTransform: "uppercase",
					letterSpacing: "0.05em",
					padding: "6px 12px",
					borderRadius: "var(--radius-sm, 6px)",
					border: following ? "1px solid var(--border-dim)" : "1px solid rgba(201,168,76,0.3)",
				}}
			>
				{loading ? "..." : following ? "Following" : "Follow"}
			</button>
			<span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
				{followersCount}
			</span>
			{error && <span style={{ fontSize: "11px", color: "#EF4444" }}>{error}</span>}
		</div>
	);
}
