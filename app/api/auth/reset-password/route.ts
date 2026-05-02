import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/database/user.model";
import { PasswordResetToken } from "@/database/token.model";
import { resetPasswordSchema } from "@/lib/validations/auth.schemas";
import {
	hashToken,
	createErrorResponse,
	createSuccessResponse,
	isRateLimited,
	getClientIp,
} from "@/lib/auth.utils";

export async function POST(request: NextRequest) {
	try {
		const clientIp = getClientIp(request);

		if (
			await isRateLimited(`reset-password:${clientIp}`, 5, 15 * 60 * 1000)
		) {
			return createErrorResponse(
				"RATE_LIMITED",
				"Too many attempts. Please try again later.",
				429,
			);
		}

		const body = await request.json();
		const parsed = resetPasswordSchema.safeParse(body);

		if (!parsed.success) {
			const fieldErrors: Record<string, string[]> = {};
			for (const error of parsed.error.issues) {
				const field = error.path.join(".");
				if (!fieldErrors[field]) fieldErrors[field] = [];
				fieldErrors[field].push(error.message);
			}
			return createErrorResponse(
				"VALIDATION_ERROR",
				"Please fix the errors below.",
				400,
				fieldErrors,
			);
		}

		const { token, password } = parsed.data;
		const tokenHash = hashToken(token);

		await connectDB();

		// Find valid token
		const tokenRecord = await PasswordResetToken.findOne({
			tokenHash,
			usedAt: null,
			expiresAt: { $gt: new Date() },
		});

		if (!tokenRecord) {
			return createErrorResponse(
				"INVALID_TOKEN",
				"This reset link is invalid or has expired. Please request a new one.",
				400,
			);
		}

		// Update user password
		const user = await User.findOne({ _id: tokenRecord.userId, deletedAt: null });
		if (!user || !user.isActive) {
			return createErrorResponse("NOT_FOUND", "User not found.", 404);
		}

		user.passwordHash = await bcrypt.hash(password, 12);
		if (user.provider === "google") {
			user.provider = "mixed";
		}
		await user.save();

		// Mark token as used
		tokenRecord.usedAt = new Date();
		await tokenRecord.save();

		// Invalidate all other reset tokens for this user
		await PasswordResetToken.deleteMany({
			userId: user._id,
			_id: { $ne: tokenRecord._id },
		});

		console.log(`✅ Password reset completed: ${user.email}`);

		return createSuccessResponse({
			message: "Password reset successful. You can now log in with your new password.",
		});
	} catch (error) {
		console.error("❌ Reset-password error:", error);
		return createErrorResponse(
			"INTERNAL_ERROR",
			"An unexpected error occurred.",
			500,
		);
	}
}
