import * as z from "zod";

export const registerEventSchema = z.object({
	// For free tickets, attendees don't strictly need to pass body fields,
	// but keeping this for future extensions (like quantity, answers to custom questions).
	quantity: z.number().int().min(1).max(10).default(1),
	source: z.enum(["web", "api", "admin"]).default("web"),
	// optional phone number
	phone: z.string().optional(),
});

export type RegisterEventValues = z.infer<typeof registerEventSchema>;
