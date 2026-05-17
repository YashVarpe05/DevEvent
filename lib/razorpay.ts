import Razorpay from "razorpay";

let _razorpay: InstanceType<typeof Razorpay> | null = null;

export function getRazorpay(): InstanceType<typeof Razorpay> {
	if (!_razorpay) {
		if (!process.env.RAZORPAY_KEY_ID) {
			throw new Error("Missing RAZORPAY_KEY_ID environment variable");
		}
		if (!process.env.RAZORPAY_KEY_SECRET) {
			throw new Error("Missing RAZORPAY_KEY_SECRET environment variable");
		}
		_razorpay = new Razorpay({
			key_id: process.env.RAZORPAY_KEY_ID,
			key_secret: process.env.RAZORPAY_KEY_SECRET,
		});
	}
	return _razorpay;
}

// Backwards-compatible lazy proxy — same pattern as lib/stripe.ts
// Will throw at runtime if env vars are missing, but not at build time
export const razorpay = new Proxy({} as InstanceType<typeof Razorpay>, {
	get(_, prop) {
		return (getRazorpay() as any)[prop];
	},
});
