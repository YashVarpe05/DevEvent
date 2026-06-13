export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import connectDB from "@/lib/mongodb";
import FollowOrganizer from "@/database/follow-organizer.model";
import OrganizerProfile from "@/database/organizer-profile.model";
import { verifyUnsubscribeToken } from "@/lib/follow-notifications";

// One-click unsubscribe linked from follower notification emails. Token-based
// so it works without a login session (the reader may be in a mail client).
export async function GET(req: NextRequest) {
	const uid = req.nextUrl.searchParams.get("uid") || "";
	const oid = req.nextUrl.searchParams.get("oid") || "";
	const sig = req.nextUrl.searchParams.get("sig") || "";

	if (
		!Types.ObjectId.isValid(uid) ||
		!Types.ObjectId.isValid(oid) ||
		!sig ||
		!verifyUnsubscribeToken(uid, oid, sig)
	) {
		return NextResponse.json({ message: "Invalid unsubscribe link" }, { status: 400 });
	}

	try {
		await connectDB();
		await FollowOrganizer.deleteOne({ userId: uid, organizerId: oid });

		const profile = await OrganizerProfile.findOne({ userId: oid })
			.select("displayName")
			.lean();
		const organizerName = profile?.displayName || "this organizer";

		const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Unsubscribed | DevEvent</title></head>
<body style="margin:0;background:#0a0a0b;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="max-width:420px;padding:40px;text-align:center;">
    <h1 style="color:#e7e7ea;font-size:22px;margin:0 0 12px;">You've unfollowed ${organizerName.replace(/</g, "&lt;")}</h1>
    <p style="color:#9b9ba3;font-size:15px;line-height:1.6;">You won't receive emails about their new events anymore. You can follow them again anytime from their profile.</p>
    <a href="/" style="display:inline-block;margin-top:20px;color:#ff6b35;text-decoration:none;font-size:14px;">Back to DevEvent</a>
  </div>
</body>
</html>`;

		return new NextResponse(html, {
			status: 200,
			headers: { "Content-Type": "text/html; charset=utf-8" },
		});
	} catch (error) {
		console.error("Unsubscribe error:", error);
		return NextResponse.json({ message: "Failed to unsubscribe" }, { status: 500 });
	}
}

// RFC 8058 one-click unsubscribe (mail clients POST to the List-Unsubscribe URL)
export async function POST(req: NextRequest) {
	return GET(req);
}
