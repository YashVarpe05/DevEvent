import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://devevents.dev";
	return {
		rules: [
			{
				userAgent: "*",
				allow: ["/", "/events", "/events/*", "/organizers/*"],
				disallow: ["/api/", "/admin", "/organizer", "/checkout", "/my"],
			},
		],
		sitemap: `${appUrl}/sitemap.xml`,
	};
}
