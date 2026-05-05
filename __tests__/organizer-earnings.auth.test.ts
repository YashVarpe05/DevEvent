import { describe, expect, it, vi } from "vitest";
import { auth } from "@/lib/auth";

vi.mock("@/lib/stripe", () => ({
	stripe: {
		balance: {
			retrieve: vi.fn(),
		},
	},
}));

import { GET as earningsRoute } from "@/app/api/organizer/stripe/earnings/route";

describe("Organizer earnings authorization", () => {
	it("returns unauthorized when no session", async () => {
		(auth as any).mockResolvedValue(null);
		const res = await earningsRoute();
		expect(res.status).toBe(401);
	});
});
