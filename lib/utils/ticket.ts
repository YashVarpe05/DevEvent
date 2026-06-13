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

function qrSecret(): string {
	return process.env.NEXTAUTH_SECRET || "fallback_secret";
}

/**
 * Generates an HMAC-signed payload for the QR code.
 * Format: registrationId:eventId:timestamp:signature
 * The signature prevents forgery — a scanned QR can be trusted without a DB
 * lookup matching, because only the server holds the secret.
 */
export function generateQrPayload(registrationId: string, eventId: string): string {
	const data = `${registrationId}:${eventId}:${Date.now()}`;
	const hmac = crypto.createHmac("sha256", qrSecret());
	hmac.update(data);
	const signature = hmac.digest("hex").substring(0, 16);
	return `${data}:${signature}`;
}

export type VerifiedQrPayload = {
	registrationId: string;
	eventId: string;
	issuedAt: number;
};

/**
 * Verifies a scanned QR payload's HMAC signature in constant time.
 * Returns the decoded fields when valid, or null when the payload is
 * malformed or the signature doesn't match (forged / tampered).
 */
export function verifyQrPayload(payload: string): VerifiedQrPayload | null {
	if (typeof payload !== "string") return null;
	const parts = payload.split(":");
	if (parts.length !== 4) return null;

	const [registrationId, eventId, timestamp, signature] = parts;
	if (!registrationId || !eventId || !timestamp || !signature) return null;

	const data = `${registrationId}:${eventId}:${timestamp}`;
	const expected = crypto
		.createHmac("sha256", qrSecret())
		.update(data)
		.digest("hex")
		.substring(0, 16);

	// Constant-time comparison to avoid timing attacks
	if (
		signature.length !== expected.length ||
		!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
	) {
		return null;
	}

	const issuedAt = Number(timestamp);
	if (!Number.isFinite(issuedAt)) return null;

	return { registrationId, eventId, issuedAt };
}
