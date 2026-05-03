import { describe, expect, it, vi, beforeEach } from "vitest";
import { rankEvents } from "@/lib/discovery/ranking";
import {
	getRecommendedEvents,
	getRelatedEventsByEvent,
} from "@/lib/discovery/recommendations";

const { eventFindMock, profileFindOneMock } = vi.hoisted(() => ({
	eventFindMock: vi.fn(),
	profileFindOneMock: vi.fn(),
}));

const candidates = [
	{
		_id: "1",
		title: "React Summit",
		slug: "react-summit",
		category: "frontend",
		tags: ["react"],
		location: { city: "Berlin" },
		eventType: "offline" as const,
		isPaid: true,
		startAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
		endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
		popularityScore: 80,
		qualityScore: 75,
		trendingScore: 70,
	},
	{
		_id: "2",
		title: "Node Online Day",
		slug: "node-online-day",
		category: "backend",
		tags: ["node"],
		location: { city: "Remote" },
		eventType: "online" as const,
		isPaid: false,
		startAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
		endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
		popularityScore: 70,
		qualityScore: 70,
		trendingScore: 90,
	},
	{
		_id: "3",
		title: "Frontend Free Meetup",
		slug: "frontend-free-meetup",
		category: "frontend",
		tags: ["javascript", "react"],
		location: { city: "Berlin" },
		eventType: "offline" as const,
		isPaid: false,
		startAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
		endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
		popularityScore: 65,
		qualityScore: 80,
		trendingScore: 60,
	},
];

vi.mock("@/database/event.model", () => ({
	default: {
		find: eventFindMock,
	},
}));

vi.mock("@/database/user-interest-profile.model", () => ({
	default: {
		findOne: profileFindOneMock,
	},
}));

beforeEach(() => {
	eventFindMock.mockReset();
	profileFindOneMock.mockReset();
});

describe("discovery ranking", () => {
	it("prioritizes events with stronger query and city match", () => {
		const ranked = rankEvents(candidates, {
			query: "react",
			city: "Berlin",
			now: new Date(),
		});

		expect(ranked[0].slug).toBe("react-summit");
		expect(ranked[0].ranking.textRelevance).toBeGreaterThan(0);
	});
});

describe("recommendations", () => {
	it("falls back to trending order for anonymous users", async () => {
		eventFindMock.mockReturnValue({
			sort: () => ({
				limit: () => ({
					lean: async () => [candidates[1], candidates[0], candidates[2]],
				}),
			}),
		});

		const result = await getRecommendedEvents({ limit: 2 });
		expect(result).toHaveLength(2);
		expect(result[0].slug).toBe("node-online-day");
	});

	it("uses profile preferences to rerank recommendations", async () => {
		eventFindMock.mockReturnValue({
			sort: () => ({
				limit: () => ({
					lean: async () => [candidates[1], candidates[0], candidates[2]],
				}),
			}),
		});
		profileFindOneMock.mockReturnValue({
			lean: async () => ({
				preferredCategories: ["frontend"],
				preferredCities: ["Berlin"],
				preferredFormats: ["offline"],
				priceAffinity: "free",
				recentInteractions: [{ category: "frontend", weight: 4 }],
			}),
		});

		const result = await getRecommendedEvents({ userId: "u1", limit: 2 });
		expect(result[0].category).toBe("frontend");
	});

	it("excludes the current event from related results", async () => {
		eventFindMock.mockReturnValue({
			sort: () => ({
				limit: () => ({
					lean: async () => [
						{ ...candidates[0], _id: "1" },
						{ ...candidates[2], _id: "3" },
					],
				}),
			}),
		});

		const related = await getRelatedEventsByEvent(
			{
				_id: "1",
				category: "frontend",
				tags: ["react"],
				location: { city: "Berlin" },
				startAt: new Date(),
			},
			4,
		);

		expect(related.some((event) => event._id.toString() === "1")).toBe(false);
	});
});
