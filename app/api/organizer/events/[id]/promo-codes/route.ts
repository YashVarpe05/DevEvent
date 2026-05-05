export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import PromoCode from "@/database/promo-code.model";
import Event from "@/database/event.model";
import { NextResponse } from "next/server";
import { z } from "zod";

const createPromoSchema = z.object({
	code: z.string().min(3).max(20).toUpperCase(),
	type: z.enum(["percentage", "fixed"]),
	value: z.number().min(1),
	maxUses: z.number().int().min(1).nullable().optional(),
	expiresAt: z.string().datetime().nullable().optional(),
});

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const eventId = (await params).id;
		await connectDB();

		const event = await Event.findOne({ _id: eventId, organizerId: session.user.id });
		if (!event) {
			return NextResponse.json({ error: "Event not found" }, { status: 404 });
		}

		const promoCodes = await PromoCode.find({ eventId }).sort({ createdAt: -1 });
		return NextResponse.json(promoCodes);
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to fetch promo codes" },
			{ status: 500 }
		);
	}
}

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const eventId = (await params).id;
		await connectDB();

		const event = await Event.findOne({ _id: eventId, organizerId: session.user.id });
		if (!event) {
			return NextResponse.json({ error: "Event not found" }, { status: 404 });
		}

		const body = await request.json();
		const parsed = createPromoSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
		}

		const data = parsed.data;

		// Validation on value based on type
		if (data.type === "percentage" && data.value > 100) {
			return NextResponse.json({ error: "Percentage discount cannot exceed 100" }, { status: 400 });
		}

		const existing = await PromoCode.findOne({ eventId, code: data.code });
		if (existing) {
			return NextResponse.json({ error: "Promo code already exists for this event" }, { status: 409 });
		}

		const promoCode = await PromoCode.create({
			eventId,
			code: data.code,
			type: data.type,
			value: data.type === "fixed" ? Math.round(data.value) : data.value,
			maxUses: data.maxUses || null,
			expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
		});

		return NextResponse.json(promoCode, { status: 201 });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to create promo code" },
			{ status: 500 }
		);
	}
}
