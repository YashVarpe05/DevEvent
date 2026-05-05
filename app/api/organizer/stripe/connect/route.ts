import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import OrganizerProfile from "@/database/organizer-profile.model";
import { stripe } from "@/lib/stripe";
import { trackServerEvent } from "@/lib/analytics";

function normalizeCountry(country: string | undefined) {
	if (!country || country.trim().length !== 2) {
		return "US";
	}
	return country.toUpperCase();
}

async function getProfileForCurrentOrganizer() {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
		};
	}

	await connectDB();
	const profile = await OrganizerProfile.findOne({ userId: session.user.id });
	if (!profile) {
		return {
			error: NextResponse.json(
				{ error: "Organizer profile not found" },
				{ status: 404 },
			),
		};
	}

	return { profile, session };
}

export async function GET() {
	try {
		const result = await getProfileForCurrentOrganizer();
		if ("error" in result) {
			return result.error;
		}

		const { profile } = result;
		if (!profile.stripeConnectedAccountId) {
			return NextResponse.json({
				isConnected: false,
				stripeConnectedAccountId: null,
				chargesEnabled: false,
				payoutsEnabled: false,
				stripeOnboardingComplete: false,
			});
		}

		const account = await stripe.accounts.retrieve(
			profile.stripeConnectedAccountId,
		);

		profile.chargesEnabled = !!account.charges_enabled;
		profile.payoutsEnabled = !!account.payouts_enabled;
		profile.stripeOnboardingComplete = !!account.details_submitted;
		await profile.save();

		return NextResponse.json({
			isConnected: true,
			stripeConnectedAccountId: profile.stripeConnectedAccountId,
			chargesEnabled: profile.chargesEnabled,
			payoutsEnabled: profile.payoutsEnabled,
			stripeOnboardingComplete: profile.stripeOnboardingComplete,
			requirements: account.requirements,
		});
	} catch (error: any) {
		console.error("Stripe connect status error", error);
		return NextResponse.json(
			{ error: error.message || "Failed to fetch connect status" },
			{ status: 500 },
		);
	}
}

export async function POST() {
	try {
		const result = await getProfileForCurrentOrganizer();
		if ("error" in result) {
			return result.error;
		}

		const { profile, session } = result;
		const appUrl =
			process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL;
		if (!appUrl) {
			return NextResponse.json(
				{ error: "Missing app URL configuration" },
				{ status: 500 },
			);
		}
		if (
			process.env.NODE_ENV === "production" &&
			!appUrl.startsWith("https://")
		) {
			return NextResponse.json(
				{ error: "Production callback URLs must use HTTPS" },
				{ status: 500 },
			);
		}

		let stripeAccountId = profile.stripeConnectedAccountId;
		if (!stripeAccountId) {
			const account = await stripe.accounts.create({
				type: "express",
				country: normalizeCountry(profile.location?.country),
				email: profile.contactEmail,
				business_type: "individual",
				capabilities: {
					card_payments: { requested: true },
					transfers: { requested: true },
				},
				metadata: {
					organizerUserId: session.user.id,
				},
			});

			stripeAccountId = account.id;
			profile.stripeConnectedAccountId = stripeAccountId;
			await profile.save();
		}

		const accountLink = await stripe.accountLinks.create({
			account: stripeAccountId,
			refresh_url: `${appUrl}/organizer/payouts?refresh=1`,
			return_url: `${appUrl}/organizer/payouts?connected=1`,
			type: "account_onboarding",
			collection_options: {
				future_requirements: "include",
			},
		});

		trackServerEvent("organizer_connected_account_updated", {
			organizerUserId: session.user.id,
			stripeConnectedAccountId: stripeAccountId,
			action: "onboarding_link_generated",
		});

		return NextResponse.json({
			url: accountLink.url,
			stripeConnectedAccountId: stripeAccountId,
		});
	} catch (error: any) {
		console.error("Stripe connect onboarding error", error);
		return NextResponse.json(
			{ error: error.message || "Failed to create onboarding link" },
			{ status: 500 },
		);
	}
}
