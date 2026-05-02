import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
	throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	// [FIXED]: Match the Stripe API version literal supported by the installed SDK.
	apiVersion: "2026-03-25.dahlia",
	typescript: true,
	appInfo: {
		name: "DevEvent",
		version: "0.1.0",
	},
});
