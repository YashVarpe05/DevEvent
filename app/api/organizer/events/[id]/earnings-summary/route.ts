export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Order from "@/database/order.model";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();
		const event = await Event.findOne({
			_id: id,
			organizerId: session.user.id,
		}).lean();
		if (!event) {
			return NextResponse.json(
				{ error: "Event not found or unauthorized" },
				{ status: 404 },
			);
		}

		const orders = await Order.find({
			eventId: id,
			organizerId: session.user.id,
		}).lean();

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
				platformFees += order.pricingSnapshot.platformFeeAmount;
				refunds += orderRefunds;
				estimatedNet += Math.max(
					0,
					order.pricingSnapshot.organizerNetEstimate - orderRefunds,
				);
			}
		}

		return NextResponse.json({
			eventId: id,
			summary: {
				grossSales,
				refunds,
				platformFees,
				estimatedNet,
				currency: (
					orders[0]?.currency ||
					event.currency ||
					"usd"
				).toLowerCase(),
				ordersCount: orders.length,
			},
		});
	} catch (error: any) {
		console.error("Organizer earnings summary error", error);
		return NextResponse.json(
			{ error: error.message || "Failed to load earnings summary" },
			{ status: 500 },
		);
	}
}
