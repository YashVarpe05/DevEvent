import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/lib/auth";
import Order from "@/database/order.model";
import { POST as refundRoute } from "@/app/api/organizer/orders/[id]/refund/route";

type MockAuth = () => Promise<{
	user: { id: string; roles: string[] };
} | null>;

vi.mock("@/lib/stripe", () => ({
	stripe: {
		refunds: {
			create: vi.fn(),
		},
	},
}));

describe("Organizer refund authorization", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("blocks unauthorized organizer from refunding another organizer order", async () => {
		const mockedAuth = vi.mocked(auth as unknown as MockAuth);
		mockedAuth.mockResolvedValue({
			user: { id: "507f1f77bcf86cd799439021", roles: ["organizer"] },
		});

		const order = await Order.create({
			eventId: new Types.ObjectId("507f1f77bcf86cd799439031"),
			buyerUserId: new Types.ObjectId("507f1f77bcf86cd799439041"),
			organizerId: new Types.ObjectId("507f1f77bcf86cd799439051"),
			status: "paid",
			currency: "usd",
			lineItems: [
				{
					ticketTypeId: new Types.ObjectId("507f1f77bcf86cd799439061"),
					ticketNameSnapshot: "General",
					quantity: 1,
					unitPrice: 1000,
					subtotal: 1000,
					amountSubtotal: 1000,
					amountDiscount: 0,
					amountTax: 0,
					amountTotal: 1000,
				},
			],
			pricingSnapshot: {
				platformFeeRate: 0.05,
				platformFeeFixed: 50,
				platformFeeAmount: 100,
				processorFeeEstimate: 59,
				organizerNetEstimate: 941,
			},
			stripePaymentIntentId: "pi_test_1",
			refunds: [],
		});

		const req = new NextRequest(
			`http://localhost/api/organizer/orders/${order._id}/refund`,
			{
				method: "POST",
				body: JSON.stringify({ reason: "Customer request" }),
			},
		);

		const res = await refundRoute(req, {
			// [FIXED]: Match Next.js route handler params, which are promised.
			params: Promise.resolve({ id: order._id.toString() }),
		});
		expect(res.status).toBe(404);
	});
});
