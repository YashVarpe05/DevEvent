export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Order from "@/database/order.model";

export async function GET() {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();
		require("@/database/event.model");

		const orders = await Order.find({ buyerUserId: session.user.id })
			.populate("eventId", "title slug coverImageUrl")
			.sort({ createdAt: -1 })
			.lean();

		return NextResponse.json({ orders });
	} catch (error: any) {
		console.error("Orders me error", error);
		return NextResponse.json(
			{ error: error.message || "Failed to load orders" },
			{ status: 500 },
		);
	}
}
