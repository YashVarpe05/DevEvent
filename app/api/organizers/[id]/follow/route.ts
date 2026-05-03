import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import FollowOrganizer from "@/database/follow-organizer.model";
import { trackServerEvent } from "@/lib/analytics";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		const { id } = await params;
		await connectDB();
		const followersCount = await FollowOrganizer.countDocuments({
			organizerId: id,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ following: false, followersCount });
		}

		const following = await FollowOrganizer.exists({
			userId: session.user.id,
			organizerId: id,
		});
		return NextResponse.json({ following: !!following, followersCount });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to load follow state" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		await connectDB();

		await FollowOrganizer.updateOne(
			{ userId: session.user.id, organizerId: id },
			{ $setOnInsert: { userId: session.user.id, organizerId: id } },
			{ upsert: true },
		);

		trackServerEvent("organizer_followed", {
			organizerId: id,
			followerUserId: session.user.id,
		});

		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to follow organizer" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		await connectDB();
		await FollowOrganizer.deleteOne({
			userId: session.user.id,
			organizerId: id,
		});

		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to unfollow organizer" },
			{ status: 500 },
		);
	}
}
