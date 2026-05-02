import Event from "@/database/event.model";
import UserInterestProfile from "@/database/user-interest-profile.model";
import { rankEvents } from "@/lib/discovery/ranking";

export async function getUserProfileForRecommendations(userId: string) {
	if (!userId) return null;
	return UserInterestProfile.findOne({ userId }).lean();
}

export async function getRelatedEventsByEvent(
	currentEvent: {
		_id: string;
		category?: string;
		tags?: string[];
		location?: { city?: string };
		startAt: Date | string;
	},
	limit = 8,
) {
	const start = new Date(currentEvent.startAt);
	const startBucketEnd = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 45);

	const query: Record<string, unknown> = {
		_id: { $ne: currentEvent._id },
		status: "published",
		visibility: "public",
		endAt: { $gte: new Date() },
		$or: [
			{ category: currentEvent.category || undefined },
			{ tags: { $in: currentEvent.tags || [] } },
			{ "location.city": currentEvent.location?.city || undefined },
			{ startAt: { $gte: start, $lte: startBucketEnd } },
		],
	};

	const related = await Event.find(query)
		.sort({ popularityScore: -1, startAt: 1 })
		.limit(limit * 3)
		.lean();

	return related
		.filter((event) => event._id.toString() !== currentEvent._id)
		.slice(0, limit);
}

export async function getRecommendedEvents(params: {
	userId?: string;
	city?: string;
	category?: string;
	limit?: number;
}) {
	const limit = params.limit || 12;
	const baseQuery: Record<string, unknown> = {
		status: "published",
		visibility: "public",
		endAt: { $gte: new Date() },
	};

	if (params.category) {
		baseQuery.category = params.category;
	}
	if (params.city) {
		baseQuery["location.city"] = params.city;
	}

	const candidates = await Event.find(baseQuery)
		.sort({ trendingScore: -1, popularityScore: -1, startAt: 1 })
		.limit(limit * 4)
		.lean();

	if (!params.userId) {
		return candidates.slice(0, limit);
	}

	const profile = await getUserProfileForRecommendations(params.userId);
	if (!profile) {
		return candidates.slice(0, limit);
	}

	const ranked = rankEvents(
		candidates.map((event) => ({ ...event, _id: event._id.toString() })),
		{ profile },
	);

	return ranked.slice(0, limit);
}
