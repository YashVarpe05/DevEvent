import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/database/user.model";
import { EmailVerificationToken } from "@/database/token.model";
import { signupSchema } from "@/lib/validations/auth.schemas";
import {
	generateToken,
	hashToken,
	createErrorResponse,
	createSuccessResponse,
	isRateLimited,
	getClientIp,
} from "@/lib/auth.utils";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
	try {
		const clientIp = getClientIp(request);

		// Rate limit: 5 signups per IP per 15 minutes
		if (await isRateLimited(`signup:${clientIp}`, 5, 15 * 60 * 1000)) {
			return createErrorResponse(
				"RATE_LIMITED",
				"Too many signup attempts. Please try again later.",
				429,
			);
		}

		const body = await request.json();
		const parsed = signupSchema.safeParse(body);

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

		const { name, email, password } = parsed.data;

		await connectDB();

		// Check for existing user
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return createErrorResponse(
				"EMAIL_EXISTS",
				"An account with this email already exists.",
				409,
			);
		}

		// Hash password
		const passwordHash = await bcrypt.hash(password, 12);

		// Create user
		const user = await User.create({
			name,
			email,
			passwordHash,
			provider: "credentials",
			roles: ["attendee"],
		});

		// Generate verification token
		const rawToken = generateToken();
		const tokenHash = hashToken(rawToken);

		await EmailVerificationToken.create({
			userId: user._id,
			tokenHash,
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
		});

		// Send verification email
		await sendVerificationEmail(email, rawToken);

		console.log(`✅ Signup success: ${email}`);

		return createSuccessResponse(
			{
				message:
					"Account created successfully. Please check your email to verify your account.",
			},
			201,
		);
	} catch (error) {
		console.error("❌ Signup error:", error);
		return createErrorResponse(
			"INTERNAL_ERROR",
			"An unexpected error occurred. Please try again.",
			500,
		);
	}
}
