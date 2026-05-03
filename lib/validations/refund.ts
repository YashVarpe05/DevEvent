import { z } from "zod";

export const organizerRefundSchema = z.object({
	reason: z.string().min(3, "Refund reason is required").max(500),
	amount: z.number().int().positive().optional(),
});
