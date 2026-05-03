import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PromoCode from "@/database/promo-code.model";
import { z } from "zod";

const validatePromoSchema = z.object({
	eventId: z.string(),
	code: z.string().min(1),
});

export async function POST(request: Request) {
	try {
		await connectDB();
		const body = await request.json();
		const parsed = validatePromoSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
		}

		const { eventId, code } = parsed.data;
		const now = new Date();

		const promo = await PromoCode.findOne({
			eventId,
			code: code.toUpperCase(),
			isActive: true,
		});

		if (!promo) {
			return NextResponse.json({ error: "Invalid promo code" }, { status: 400 });
		}

		if (promo.expiresAt && now > new Date(promo.expiresAt)) {
			return NextResponse.json({ error: "Promo code has expired" }, { status: 400 });
		}

		if (promo.maxUses && promo.currentUses >= promo.maxUses) {
			return NextResponse.json({ error: "Promo code has reached its usage limit" }, { status: 400 });
		}

		return NextResponse.json({
			discount: {
				type: promo.type,
				value: promo.value,
			},
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
