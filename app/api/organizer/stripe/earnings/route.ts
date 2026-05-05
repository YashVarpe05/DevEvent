export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Order from "@/database/order.model";
import OrganizerProfile from "@/database/organizer-profile.model";
import { stripe } from "@/lib/stripe";

export async function GET() {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const organizer = await OrganizerProfile.findOne({
			userId: session.user.id,
		});
		if (!organizer) {
			return NextResponse.json(
				{ error: "Organizer profile not found" },
				{ status: 404 },
			);
		}

		const orders = await Order.find({ organizerId: session.user.id }).lean();

		let grossSales = 0;
		let refunds = 0;
		let platformFees = 0;
		let estimatedNet = 0;

		for (const order of orders) {
			const orderGross = order.lineItems.reduce(
				(sum, item) => sum + item.amountTotal,
				0,
			);
			const orderRefunds = (order.refunds || [])
				.filter((refund: any) => refund.status === "succeeded")
				.reduce((sum: number, refund: any) => sum + refund.amount, 0);

			if (
				["paid", "refunded_partial", "refunded_full", "chargeback"].includes(
					order.status,
				)
			) {
				grossSales += orderGross;
				platformFees += order.pricingSnapshot?.platformFeeAmount || 0;
				refunds += orderRefunds;
				estimatedNet += Math.max(
					0,
					(order.pricingSnapshot?.organizerNetEstimate || 0) - orderRefunds,
				);
			}
		}

		let availableBalance = 0;
		if (organizer.stripeConnectedAccountId) {
			try {
				const balance = await stripe.balance.retrieve({
					stripeAccount: organizer.stripeConnectedAccountId,
				});
				availableBalance = balance.available.reduce(
					(sum, item) => sum + item.amount,
					0,
				);
			} catch {
				availableBalance = 0;
			}
		}

		return NextResponse.json({
			stats: {
				grossSales,
				refunds,
				platformFees,
				estimatedNet,
				availableBalance,
				chargesEnabled: organizer.chargesEnabled,
				payoutsEnabled: organizer.payoutsEnabled,
				stripeOnboardingComplete: organizer.stripeOnboardingComplete,
			},
		});
	} catch (error: any) {
		console.error("Organizer earnings error", error);
		return NextResponse.json(
			{ error: error.message || "Failed to load earnings" },
			{ status: 500 },
		);
	}
}
