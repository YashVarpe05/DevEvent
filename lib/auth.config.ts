import type { NextAuthConfig } from "next-auth";
import type { UserRole, OrganizerStatus } from "@/database/user.model";

// Define the extensions to NextAuth types here so they are available where config is used
declare module "next-auth" {
	interface User {
		roles?: UserRole[];
		isEmailVerified?: boolean;
		organizerStatus?: OrganizerStatus;
	}
	interface Session {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
			roles: UserRole[];
			isEmailVerified: boolean;
			organizerStatus: OrganizerStatus;
		};
	}
}

declare module "next-auth" {
	interface JWT {
		id?: string;
		roles?: UserRole[];
		isEmailVerified?: boolean;
		organizerStatus?: OrganizerStatus;
	}
}

export const authConfig = {
	providers: [],
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	pages: {
		signIn: "/login",
		error: "/login",
	},
	callbacks: {
		async jwt({ token, user, trigger, session }) {
			if (user) {
				token.id = user.id;
				token.roles = user.roles || ["attendee"];
				token.isEmailVerified = user.isEmailVerified || false;
				token.organizerStatus = user.organizerStatus || "not_applied";
			}

			// Handle session update (e.g., after email verification)
			if (trigger === "update" && session) {
				token.isEmailVerified = session.isEmailVerified ?? token.isEmailVerified;
				token.roles = session.roles ?? token.roles;
				token.name = session.name ?? token.name;
				token.organizerStatus = session.organizerStatus ?? token.organizerStatus;
			}

			return token;
		},

		async session({ session, token }) {
			if (token) {
				session.user.id = token.id as string;
				session.user.roles = (token.roles as UserRole[]) || ["attendee"];
				session.user.isEmailVerified = (token.isEmailVerified as boolean) || false;
				session.user.organizerStatus =
					(token.organizerStatus as OrganizerStatus) || "not_applied";
			}
			return session;
		},
	},
} satisfies NextAuthConfig;
