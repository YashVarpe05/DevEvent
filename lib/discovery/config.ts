export const DISCOVERY_CONFIG = {
	pagination: {
		defaultPage: 1,
		defaultLimit: 12,
		maxLimit: 50,
	},
	weights: {
		textRelevance: 0.35,
		freshness: 0.15,
		popularity: 0.15,
		quality: 0.1,
		geoProximity: 0.1,
		personalizationBoost: 0.15,
	},
	thresholds: {
		freshnessHorizonDays: 90,
		geoMaxDistanceKm: 300,
		relatedLimit: 8,
		recommendedLimit: 12,
		recentInteractionWindowDays: 30,
	},
	cache: {
		searchTtlSeconds: 120,
		recommendedTtlSeconds: 180,
		trendingTtlSeconds: 180,
	},
} as const;

export type DiscoveryWeights = typeof DISCOVERY_CONFIG.weights;
