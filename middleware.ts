import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
	const { pathname } = req.nextUrl;
	const isLoggedIn = !!req.auth;

	// Auth pages — redirect authenticated users away
	const authPages = ["/login", "/signup", "/forgot-password"];
	if (authPages.some((page) => pathname.startsWith(page))) {
		if (isLoggedIn) {
			return NextResponse.redirect(new URL("/", req.url));
		}
		return NextResponse.next();
	}

	// Email verification enforcement — unverified users can only access limited paths
	if (isLoggedIn && !req.auth?.user?.isEmailVerified) {
		const allowedUnverified = ["/profile", "/verify-email", "/api/auth"];
		if (!allowedUnverified.some((path) => pathname.startsWith(path))) {
			return NextResponse.redirect(new URL("/verify-email", req.url));
		}
	}

	// Protected routes — require auth
	const protectedPaths = ["/profile", "/dashboard"];
	if (protectedPaths.some((path) => pathname.startsWith(path))) {
		if (!isLoggedIn) {
			const loginUrl = new URL("/login", req.url);
			loginUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(loginUrl);
		}
		return NextResponse.next();
	}

	// Admin routes — require admin role
	if (pathname.startsWith("/admin")) {
		if (!isLoggedIn) {
			const loginUrl = new URL("/login", req.url);
			loginUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(loginUrl);
		}
		const roles = req.auth?.user?.roles || [];
		if (!roles.includes("admin")) {
			return NextResponse.redirect(new URL("/", req.url));
		}
		return NextResponse.next();
	}

	// Organizer routes
	if (pathname.startsWith("/organizer") || pathname === "/become-organizer") {
		if (!isLoggedIn) {
			const loginUrl = new URL("/login", req.url);
			loginUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(loginUrl);
		}
		// /become-organizer and /organizer/application-status accessible to any auth user
		if (
			pathname === "/become-organizer" ||
			pathname === "/organizer/application-status"
		) {
			return NextResponse.next();
		}
		// All other /organizer/** routes require approved organizer or admin
		const organizerStatus = req.auth?.user?.organizerStatus;
		const roles = req.auth?.user?.roles || [];
		if (organizerStatus !== "approved" && !roles.includes("admin")) {
			return NextResponse.redirect(new URL("/become-organizer", req.url));
		}
		return NextResponse.next();
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		// Match all paths except static files and API routes (except auth API)
		"/((?!_next/static|_next/image|favicon.ico|icons|images|ingest|api/(?!auth)).*)",
	],
};
