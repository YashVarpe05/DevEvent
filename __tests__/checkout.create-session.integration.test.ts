import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import Event from "@/database/event.model";
import TicketType from "@/database/ticket-type.model";
import OrganizerProfile from "@/database/organizer-profile.model";
import { POST as createSession } from "@/app/api/checkout/create-session/route";

vi.mock("@/lib/stripe", () => ({
	stripe: {
		checkout: {
			sessions: {
				create: vi.fn().mockResolvedValue({
					id: "cs_test_1",
					url: "https://checkout.stripe.com/test",
				}),
				retrieve: vi.fn(),
			},
		},
	},
}));

describe("Checkout create-session", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(auth as any).mockResolvedValue({
			user: { id: "507f1f77bcf86cd799439011", roles: ["attendee"] },
		});
		process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
	});

	it("blocks checkout when organizer payout setup is incomplete", async () => {
		const organizerId = "507f1f77bcf86cd799439012";
		await OrganizerProfile.create({
			userId: organizerId,
			displayName: "Org",
			slug: "org-checkout",
			contactEmail: "org@example.com",
			location: { city: "NY", country: "US" },
			organizationType: "individual",
			stripeConnectedAccountId: "acct_test",
			chargesEnabled: false,
			payoutsEnabled: false,
		} as any);

		const event = await Event.create({
			title: "Paid Event",
			shortDescription: "Paid event description",
			organizerId,
			organizerProfileId: "507f1f77bcf86cd799439099",
			eventType: "online",
			visibility: "public",
			status: "published",
			timezone: "UTC",
			startAt: new Date(Date.now() + 3600_000),
			endAt: new Date(Date.now() + 7200_000),
			isPaid: true,
			currency: "usd",
			basePrice: 1000,
		} as any);

		const ticket = await TicketType.create({
			eventId: event._id,
			name: "General",
			price: 1000,
			currency: "usd",
			quantityTotal: 10,
			quantitySold: 0,
			minPerOrder: 1,
			maxPerOrder: 5,
			status: "active",
		} as any);

		const req = new NextRequest(
			"http://localhost/api/checkout/create-session",
			{
				method: "POST",
				body: JSON.stringify({
					eventId: event._id.toString(),
					idempotencyKey: "idem-001",
					items: [{ ticketTypeId: ticket._id.toString(), quantity: 1 }],
				}),
			},
		);

		const res = await createSession(req);
		expect(res.status).toBe(400);
	});
});
