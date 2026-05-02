import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Referral from "@/database/referral.model";
import { Types } from "mongoose";
import { z } from "zod";

const trackReferralSchema = z.object({
	eventId: z.string().refine((value) => Types.ObjectId.isValid(value), {
		message: "Invalid eventId",
	}),
	code: z.string().trim().min(1).max(64),
});

export async function POST(request: Request) {
	try {
		await connectDB();
		const parsed = trackReferralSchema.safeParse(await request.json());

		if (!parsed.success) {
			return NextResponse.json({ error: "Invalid referral payload" }, { status: 400 });
		}

		await Referral.findOneAndUpdate(
			{
				eventId: parsed.data.eventId,
				code: parsed.data.code.toLowerCase(),
			},
			{ $inc: { clicks: 1 } }
		);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Referral track error:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
