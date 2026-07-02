import type { MetadataRoute } from "next";

// PWA / web app manifest — improves SEO, share metadata, and installability.
export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "DevEvent — India's Developer Event Platform",
		short_name: "DevEvent",
		description:
			"Discover, host, and manage hackathons, meetups, and workshops. Book your spot in seconds.",
		start_url: "/",
		display: "standalone",
		background_color: "#0A0A0B",
		theme_color: "#0A0A0B",
		categories: ["events", "productivity", "social"],
		icons: [
			{
				src: "/favicon.ico",
				sizes: "any",
				type: "image/x-icon",
			},
		],
	};
}
