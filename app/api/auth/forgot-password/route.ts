import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user.model";
import { PasswordResetToken } from "@/database/token.model";
import { forgotPasswordSchema } from "@/lib/validations/auth.schemas";
import {
	generateToken,
	hashToken,
	createErrorResponse,
	createSuccessResponse,
	isRateLimited,
	getClientIp,
} from "@/lib/auth.utils";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
	try {
		const clientIp = getClientIp(request);

		// Rate limit: 3 requests per IP per 15 minutes
		if (
			await isRateLimited(`forgot-password:${clientIp}`, 3, 15 * 60 * 1000)
		) {
			return createErrorResponse(
				"RATE_LIMITED",
				"Too many requests. Please try again later.",
				429,
			);
		}

		const body = await request.json();
		const parsed = forgotPasswordSchema.safeParse(body);

		if (!parsed.success) {
			return createErrorResponse(
				"VALIDATION_ERROR",
				"Please provide a valid email address.",
				400,
			);
		}

		const { email } = parsed.data;

		// SECURITY: Always return success to prevent email enumeration
		const successMessage =
			"If an account with that email exists, we've sent a password reset link.";

		await connectDB();

		const user = await User.findOne({
			email,
			isActive: true,
			deletedAt: null,
		});

		if (!user) {
			// Don't leak that the email doesn't exist
			return createSuccessResponse({ message: successMessage });
		}

		// Invalidate existing reset tokens
		await PasswordResetToken.deleteMany({ userId: user._id });

		// Generate reset token
		const rawToken = generateToken();
		const tokenHash = hashToken(rawToken);
		const userAgent = request.headers.get("user-agent") || "";

		await PasswordResetToken.create({
			userId: user._id,
			tokenHash,
			expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
			requestedIp: clientIp,
			userAgent,
		});

		await sendPasswordResetEmail(email, rawToken);

		// [FIXED]: Avoid logging account identifiers for password reset requests.
		console.log("[Auth] password reset request completed");

		return createSuccessResponse({ message: successMessage });
	} catch (error) {
		console.error("❌ Forgot-password error:", error);
		return createErrorResponse(
			"INTERNAL_ERROR",
			"An unexpected error occurred.",
			500,
		);
	}
}
