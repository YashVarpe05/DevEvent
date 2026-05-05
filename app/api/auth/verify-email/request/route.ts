export const dynamic = 'force-dynamic';
import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user.model";
import { EmailVerificationToken } from "@/database/token.model";
import {
	generateToken,
	hashToken,
	createErrorResponse,
	createSuccessResponse,
	isRateLimited,
	getClientIp,
} from "@/lib/auth.utils";
import { sendVerificationEmail } from "@/lib/email";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return createErrorResponse("UNAUTHORIZED", "Please log in first.", 401);
		}

		const clientIp = getClientIp(request);
		if (
			await isRateLimited(`verify-request:${clientIp}`, 3, 15 * 60 * 1000)
		) {
			return createErrorResponse(
				"RATE_LIMITED",
				"Too many verification requests. Please try again later.",
				429,
			);
		}

		await connectDB();

		const user = await User.findById(session.user.id);
		if (!user) {
			return createErrorResponse("NOT_FOUND", "User not found.", 404);
		}

		if (user.emailVerified) {
			return createErrorResponse(
				"ALREADY_VERIFIED",
				"Your email is already verified.",
				400,
			);
		}

		// Invalidate any existing verification tokens
		await EmailVerificationToken.deleteMany({ userId: user._id });

		// Generate new token
		const rawToken = generateToken();
		const tokenHash = hashToken(rawToken);

		await EmailVerificationToken.create({
			userId: user._id,
			tokenHash,
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
		});

		await sendVerificationEmail(user.email, rawToken);

		return createSuccessResponse({
			message: "Verification email sent. Please check your inbox.",
		});
	} catch (error) {
		console.error("❌ Verify-email request error:", error);
		return createErrorResponse(
			"INTERNAL_ERROR",
			"An unexpected error occurred.",
			500,
		);
	}
}
