import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as webhookPost } from "@/app/api/webhooks/stripe/route";

vi.mock("next/headers", () => ({
	headers: vi.fn().mockResolvedValue({
		get: (key: string) => (key === "stripe-signature" ? "sig_test" : null),
	}),
}));

const constructEventMock = vi.fn();

vi.mock("@/lib/stripe", () => ({
	stripe: {
		webhooks: {
			constructEvent: (...args: any[]) => constructEventMock(...args),
		},
	},
}));

describe("Stripe webhook idempotency", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
		constructEventMock.mockReturnValue({
			id: "evt_test_001",
			type: "checkout.session.completed",
			data: {
				object: {
					id: "cs_test",
					client_reference_id: "507f1f77bcf86cd799439011",
				},
			},
		});
	});

	it("deduplicates replayed webhook events by event id", async () => {
		const request1 = new Request("http://localhost/api/webhooks/stripe", {
			method: "POST",
			body: JSON.stringify({ test: true }),
		});
		const first = await webhookPost(request1);
		expect(first.status).toBe(200);

		const request2 = new Request("http://localhost/api/webhooks/stripe", {
			method: "POST",
			body: JSON.stringify({ test: true }),
		});
		const second = await webhookPost(request2);
		const body = await second.json();
		expect(second.status).toBe(200);
		expect(body.deduplicated).toBe(true);
	});
});
