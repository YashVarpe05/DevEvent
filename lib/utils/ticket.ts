import crypto from "crypto";

/**
 * Generates a human-readable unique ticket code.
 * Format: DEV-XXXX-YYYY (where X/Y are alphanumeric)
 */
export function generateTicketCode(): string {
	const randomSegment1 = crypto.randomBytes(2).toString("hex").toUpperCase();
	const randomSegment2 = crypto.randomBytes(2).toString("hex").toUpperCase();
	return `DEV-${randomSegment1}-${randomSegment2}`;
}

/**
 * Generates a signed payload string for the QR code.
 * In a real application, this should be signed with a secret key (e.g., JWT or HMAC)
 * to prevent forgery.
 */
export function generateQrPayload(registrationId: string, eventId: string): string {
    const secret = process.env.NEXTAUTH_SECRET || "fallback_secret";
	const data = `${registrationId}:${eventId}:${new Date().getTime()}`;
	
	const hmac = crypto.createHmac("sha256", secret);
	hmac.update(data);
	const signature = hmac.digest("hex").substring(0, 16);

	return `${data}:${signature}`;
}
