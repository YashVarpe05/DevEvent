import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import UserReferral from "@/database/user-referral.model";
import { setUserReferralCookie } from "@/lib/utils/user-referral";
import { Types } from "mongoose";
import { z } from "zod";

const trackUserReferralSchema = z.object({
	eventId: z.string().refine((value) => Types.ObjectId.isValid(value), {
		message: "Invalid eventId",
	}),
	referrerId: z.string().refine((value) => Types.ObjectId.isValid(value), {
		message: "Invalid referrerId",
	}),
});

export async function POST(request: Request) {
	try {
		await connectDB();
		const parsed = trackUserReferralSchema.safeParse(await request.json());

		if (!parsed.success) {
			return NextResponse.json({ error: "Invalid referral payload" }, { status: 400 });
		}

		const { eventId, referrerId } = parsed.data;

		// Create a new click record
		await UserReferral.create({
			referrerId,
			eventId,
			status: "clicked",
		});

		// Set the cookie for tracking signups and conversions
		await setUserReferralCookie(referrerId, eventId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("User Referral track error:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
