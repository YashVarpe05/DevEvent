import Razorpay from "razorpay";

let _razorpay: Razorpay | null = null;

export function getRazorpay(): Razorpay {
	if (!_razorpay) {
		if (!process.env.RAZORPAY_KEY_ID) {
			throw new Error(
				"Missing RAZORPAY_KEY_ID environment variable"
			);
		}
		if (!process.env.RAZORPAY_KEY_SECRET) {
			throw new Error(
				"Missing RAZORPAY_KEY_SECRET environment variable"
			);
		}
		_razorpay = new Razorpay({
			key_id: process.env.RAZORPAY_KEY_ID,
			key_secret: process.env.RAZORPAY_KEY_SECRET,
		});
	}
	return _razorpay;
}

// Backwards-compatible default export for existing imports
// Will throw at runtime if RAZORPAY_KEY_ID is not set, but not at build time
export const razorpay = new Proxy({} as Razorpay, {
	get(_, prop) {
		return (getRazorpay() as any)[prop];
	},
});
