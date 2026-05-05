import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
	if (!_stripe) {
		if (!process.env.STRIPE_SECRET_KEY) {
			throw new Error("Missing STRIPE_SECRET_KEY environment variable");
		}
		_stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
			// [FIXED]: Match the Stripe API version literal supported by the installed SDK.
			apiVersion: "2026-03-25.dahlia",
			typescript: true,
			appInfo: {
				name: "DevEvent",
				version: "0.1.0",
			},
		});
	}
	return _stripe;
}

// Backwards-compatible default export for existing imports
// Will throw at runtime if STRIPE_SECRET_KEY is not set, but not at build time
export const stripe = new Proxy({} as Stripe, {
	get(_, prop) {
		return (getStripe() as any)[prop];
	},
});
