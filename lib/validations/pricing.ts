import { z } from "zod";

export const pricingSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name is too long"),
	price: z.number().min(0, "Price must be non-negative"),
	quantityTotal: z.number().int().min(1, "Quantity must be at least 1"),
	currency: z.string().min(3, "Currency code is required").max(3, "Must be a 3-letter code"),
});
