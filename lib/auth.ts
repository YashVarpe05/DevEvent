import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/database/user.model";
import { authConfig } from "./auth.config";
import { isRateLimited, getClientIp } from "./auth.utils";

export const { handlers, signIn, signOut, auth } = NextAuth({
	trustHost: true,
	...authConfig,
	providers: [
		Credentials({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials, request) {
				if (!credentials?.email || !credentials?.password) {
					console.log("[Auth] Missing credentials");
					return null;
				}

				// Rate limit: 5 login attempts per IP per 15 minutes
				const clientIp = getClientIp(request);
				if (await isRateLimited(`login:${clientIp}`, 20, 15 * 60 * 1000)) { // Increased to 20 for dev
					console.log("[Auth] Rate limited for IP:", clientIp);
					throw new Error("TOO_MANY_REQUESTS");
				}

				try {
					await connectDB();

					const user = await User.findOne({
						email: (credentials.email as string).toLowerCase().trim(),
						isActive: true,
						deletedAt: null,
					});

					if (!user) {
						console.log("[Auth] User not found or inactive:", credentials.email);
						return null;
					}
					
					if (!user.passwordHash) {
						console.log("[Auth] User has no password hash (OAuth user?):", credentials.email);
						return null;
					}

					const isPasswordValid = await bcrypt.compare(
						credentials.password as string,
						user.passwordHash,
					);

					if (!isPasswordValid) {
						console.log("[Auth] Invalid password for user:", credentials.email);
						return null;
					}

					// Update last login
					user.lastLoginAt = new Date();
					await user.save();

					// [FIXED]: Avoid logging authenticated user identifiers.
					console.log("[Auth] credentials login completed");

					return {
						id: user._id.toString(),
						name: user.name,
						email: user.email,
						image: user.image,
						roles: Array.from(user.roles || ["attendee"]),
						isEmailVerified: user.emailVerified,
						organizerStatus: user.organizerStatus || "not_applied",
					};
				} catch (error) {
					console.error("❌ Login error:", error);
					return null;
				}
			},
		}),
		...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
			? [
					Google({
						clientId: process.env.GOOGLE_CLIENT_ID,
						clientSecret: process.env.GOOGLE_CLIENT_SECRET,
					}),
				]
			: []),
	],
	callbacks: {
		...authConfig.callbacks,
		async signIn({ user, account }) {
			if (account?.provider === "google") {
				try {
					await connectDB();

					if (!user.email) return false;
					const existingUser = await User.findOne({
						email: user.email.toLowerCase(),
						deletedAt: null,
					});

					if (existingUser) {
						// Link Google to existing account
						if (
							existingUser.provider === "credentials" ||
							existingUser.provider !== "google"
						) {
							existingUser.provider = existingUser.passwordHash
								? "mixed"
								: "google";
						}
						existingUser.emailVerified = true;
						existingUser.image = user.image || existingUser.image;
						existingUser.name = user.name || existingUser.name;
						existingUser.lastLoginAt = new Date();
						existingUser.isActive = true;
						await existingUser.save();

						// Override user.id so JWT gets MongoDB _id
						user.id = existingUser._id.toString();
						user.roles = Array.from(existingUser.roles || ["attendee"]);
						user.isEmailVerified = true;
						user.organizerStatus = existingUser.organizerStatus || "not_applied";

						console.log("[Auth] Google login completed");
					} else {
						// Create new user from Google
						const newUser = await User.create({
							name: user.name || undefined,
							email: user.email.toLowerCase(),
							emailVerified: true,
							image: user.image || undefined,
							provider: "google" as const,
							roles: ["attendee" as const],
							isActive: true,
							lastLoginAt: new Date(),
						});

						const created = Array.isArray(newUser) ? newUser[0] : newUser;
						user.id = created._id.toString();
						user.roles = Array.from(created.roles || ["attendee"]);
						user.isEmailVerified = true;

						console.log("[Auth] Google signup completed");
					}
				} catch (error) {
					console.error("❌ Google sign-in error:", error);
					return false;
				}
			}
			return true;
		},
	},
});
