import { z } from "zod";

export const searchEventsQuerySchema = z.object({
	q: z.string().optional(),
	category: z.string().optional(),
	tags: z.array(z.string()).optional(),
	city: z.string().optional(),
	country: z.string().optional(),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	eventType: z.enum(["online", "offline", "hybrid"]).optional(),
	priceType: z.enum(["free", "paid"]).optional(),
	minPrice: z.coerce.number().min(0).optional(),
	maxPrice: z.coerce.number().min(0).optional(),
	sort: z
		.enum(["relevance", "date_asc", "date_desc", "popular", "trending"])
		.optional(),
	page: z.coerce.number().int().min(1).optional(),
	limit: z.coerce.number().int().min(1).max(50).optional(),
	includeEnded: z.coerce.boolean().optional(),
	lat: z.coerce.number().min(-90).max(90).optional(),
	lng: z.coerce.number().min(-180).max(180).optional(),
});

export const saveSearchSchema = z.object({
	name: z.string().min(1).max(80).optional(),
	query: z.string().max(300).optional(),
	filters: z.record(z.string(), z.unknown()).default({}),
	notificationFrequency: z.enum(["daily", "weekly", "off"]).default("weekly"),
});

export const trackInteractionSchema = z.object({
	eventId: z.string().min(1),
	type: z.enum([
		"view",
		"bookmark",
		"share",
		"register_click",
		"register_complete",
	]),
	weight: z.number().min(0).default(1),
	query: z.string().max(200).optional(),
	filtersHash: z.string().max(100).optional(),
	position: z.number().int().min(0).optional(),
});
