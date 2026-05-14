import type { MetadataRoute } from "next";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import OrganizerProfile from "@/database/organizer-profile.model";

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://devevents.dev";

	const staticEntries: MetadataRoute.Sitemap = [
		{ url: `${appUrl}/`, changeFrequency: "daily", priority: 1 },
		{ url: `${appUrl}/events`, changeFrequency: "hourly", priority: 0.9 },
	];

	try {
		await connectDB();

		const [events, organizers] = await Promise.all([
			Event.find({ status: "published", visibility: "public", deletedAt: null })
				.select("slug updatedAt")
				.lean(),
			OrganizerProfile.find({ isPublic: true }).select("slug updatedAt").lean(),
		]);

		const eventEntries: MetadataRoute.Sitemap = events.map((event) => ({
			url: `${appUrl}/events/${event.slug}`,
			lastModified: event.updatedAt,
			changeFrequency: "daily",
			priority: 0.8,
		}));

		const organizerEntries: MetadataRoute.Sitemap = organizers.map(
			(organizer) => ({
				url: `${appUrl}/organizers/${organizer.slug}`,
				lastModified: organizer.updatedAt,
				changeFrequency: "weekly",
				priority: 0.7,
			}),
		);

		return [...staticEntries, ...eventEntries, ...organizerEntries];
	} catch (error) {
		console.warn("[Sitemap] DB connection failed, returning static entries only:", error);
		return staticEntries;
	}
}
