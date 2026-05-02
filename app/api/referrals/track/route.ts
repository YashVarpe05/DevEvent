import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Referral from "@/database/referral.model";

export async function POST(request: Request) {
	try {
		await connectDB();
		const { eventId, code } = await request.json();

		if (!eventId || !code) {
			return NextResponse.json({ error: "Missing eventId or code" }, { status: 400 });
		}

		await Referral.findOneAndUpdate(
			{ eventId, code: code.toLowerCase() },
			{ $inc: { clicks: 1 } }
		);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Referral track error:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
