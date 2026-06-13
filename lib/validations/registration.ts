import * as z from "zod";

export const registerEventSchema = z.object({
	quantity: z.number().int().min(1).max(10).default(1),
	source: z.enum(["web", "api", "admin"]).default("web"),
	// optional phone number
	phone: z.string().optional(),
	// Answers to the event's custom registration questions, keyed by question id.
	// Required-ness and option validity are checked against the event in the route.
	answers: z
		.record(z.string(), z.union([z.string().max(500), z.boolean()]))
		.optional(),
});

export type RegisterEventValues = z.infer<typeof registerEventSchema>;
