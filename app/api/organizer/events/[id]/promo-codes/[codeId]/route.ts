import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import PromoCode from "@/database/promo-code.model";
import Event from "@/database/event.model";
import { NextResponse } from "next/server";

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string; codeId: string }> }
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: eventId, codeId } = await params;
		await connectDB();

		const event = await Event.findOne({ _id: eventId, organizerId: session.user.id });
		if (!event) {
			return NextResponse.json({ error: "Event not found" }, { status: 404 });
		}

		const promoCode = await PromoCode.findOneAndDelete({ _id: codeId, eventId });
		if (!promoCode) {
			return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to delete promo code" },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string; codeId: string }> }
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: eventId, codeId } = await params;
		await connectDB();

		const event = await Event.findOne({ _id: eventId, organizerId: session.user.id });
		if (!event) {
			return NextResponse.json({ error: "Event not found" }, { status: 404 });
		}

		const body = await request.json();
		if (typeof body.isActive !== 'boolean') {
			return NextResponse.json({ error: "isActive boolean is required" }, { status: 400 });
		}

		const promoCode = await PromoCode.findOneAndUpdate(
			{ _id: codeId, eventId },
			{ isActive: body.isActive },
			{ new: true }
		);

		if (!promoCode) {
			return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
		}

		return NextResponse.json(promoCode);
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to update promo code" },
			{ status: 500 }
		);
	}
}
