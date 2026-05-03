import { describe, expect, it } from "vitest";
import { calculatePricing } from "@/lib/pricing";

describe("Pricing Engine", () => {
	it("calculates free-plan pricing with deterministic rounding", () => {
		const pricing = calculatePricing({
			lineItems: [
				{ ticketTypeId: "t1", quantity: 2, unitPrice: 2500 },
				{ ticketTypeId: "t2", quantity: 1, unitPrice: 999 },
			],
			currency: "usd",
			organizerPlan: "free",
		});

		expect(pricing.subtotal).toBe(5999);
		expect(pricing.platformFeeAmount).toBe(Math.round(5999 * 0.05) + 50);
		expect(pricing.totalBuyerPayable).toBe(
			pricing.subtotal + pricing.platformFeeAmount,
		);
	});

	it("uses pro pricing rule when organizerPlan is pro", () => {
		const pricing = calculatePricing({
			lineItems: [{ ticketTypeId: "t1", quantity: 1, unitPrice: 10000 }],
			currency: "usd",
			organizerPlan: "pro",
		});

		expect(pricing.platformFeeAmount).toBe(Math.round(10000 * 0.02));
		expect(pricing.totalBuyerPayable).toBe(10200);
	});
});
