import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user.model";
import { EmailVerificationToken } from "@/database/token.model";
import {
	hashToken,
	createErrorResponse,
	createSuccessResponse,
	isRateLimited,
	getClientIp,
} from "@/lib/auth.utils";
import { verifyEmailSchema } from "@/lib/validations/auth.schemas";

export async function POST(request: NextRequest) {
	try {
		const clientIp = getClientIp(request);

		// Rate limit: 5 attempts per IP per 15 minutes
		if (
			await isRateLimited(`verify-confirm:${clientIp}`, 5, 15 * 60 * 1000)
		) {
			return createErrorResponse(
				"RATE_LIMITED",
				"Too many attempts. Please try again later.",
				429,
			);
		}

		const body = await request.json();
		const parsed = verifyEmailSchema.safeParse(body);

		if (!parsed.success) {
			return createErrorResponse(
				"VALIDATION_ERROR",
				"Invalid verification token.",
				400,
			);
		}

		const { token } = parsed.data;
		const tokenHash = hashToken(token);

		await connectDB();

		// Find valid (unused, not expired) token
		const tokenRecord = await EmailVerificationToken.findOne({
			tokenHash,
			usedAt: null,
			expiresAt: { $gt: new Date() },
		});

		if (!tokenRecord) {
			return createErrorResponse(
				"INVALID_TOKEN",
				"This verification link is invalid or has expired. Please request a new one.",
				400,
			);
		}

		// Mark user as verified
		const user = await User.findById(tokenRecord.userId);
		if (!user) {
			return createErrorResponse("NOT_FOUND", "User not found.", 404);
		}

		user.emailVerified = true;
		await user.save();

		// Mark token as used
		tokenRecord.usedAt = new Date();
		await tokenRecord.save();

		// Invalidate other verification tokens for this user
		await EmailVerificationToken.deleteMany({
			userId: user._id,
			_id: { $ne: tokenRecord._id },
		});

		// [FIXED]: Avoid logging user email addresses during verification.
		console.log("[Auth] email verification completed");

		return createSuccessResponse({
			message: "Email verified successfully! You can now log in.",
		});
	} catch (error) {
		console.error("❌ Verify-email confirm error:", error);
		return createErrorResponse(
			"INTERNAL_ERROR",
			"An unexpected error occurred.",
			500,
		);
	}
}
