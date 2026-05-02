import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
	eventId: z.string().min(1, "eventId is required"),
	promoCode: z.string().max(64).optional(),
	referralCode: z.string().max(64).optional().nullable(),
	idempotencyKey: z
		.string()
		.min(8, "idempotencyKey is required")
		.max(128, "idempotencyKey is too long"),
	items: z
		.array(
			z.object({
				ticketTypeId: z.string().min(1, "ticketTypeId is required"),
				quantity: z
					.number()
					.int()
					.min(1, "quantity must be at least 1")
					.max(20),
			}),
		)
		.min(1, "At least one ticket selection is required"),
});

export const orderCancelSchema = z.object({
	reason: z.string().max(200).optional(),
});
