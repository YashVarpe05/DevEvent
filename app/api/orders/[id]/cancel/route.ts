export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Order from "@/database/order.model";
import { orderCancelSchema } from "@/lib/validations/checkout";

export async function POST(
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
		const body = await request.json().catch(() => ({}));
		const parsed = orderCancelSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid payload", issues: parsed.error.issues },
				{ status: 400 },
			);
		}

		const order = await Order.findById(id);
		if (!order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		if (order.buyerUserId.toString() !== session.user.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		if (!["pending_payment", "payment_processing"].includes(order.status)) {
			return NextResponse.json(
				{ error: "Only unpaid orders can be cancelled" },
				{ status: 400 },
			);
		}

		order.status = "cancelled";
		await order.save();

		return NextResponse.json({
			message: "Order cancelled",
			orderId: order._id,
		});
	} catch (error: any) {
		console.error("Cancel order error", error);
		return NextResponse.json(
			{ error: error.message || "Failed to cancel order" },
			{ status: 500 },
		);
	}
}
