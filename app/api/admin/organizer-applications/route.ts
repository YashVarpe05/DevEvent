import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { OrganizerApplication, User } from "@/database";

export async function GET(req: Request) {
	try {
		const session = await auth();
		if (!session?.user?.id || !session.user.roles.includes("admin")) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const { searchParams } = new URL(req.url);
		const status = searchParams.get("status") || "pending";
		const page = Number.parseInt(searchParams.get("page") || "1", 10);
		const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
		const skip = (page - 1) * limit;

		const query = status === "all" ? {} : { status };

		const [applications, total] = await Promise.all([
			OrganizerApplication.find(query)
				.populate({
					path: "userId",
					select: "name email image roles organizerStatus createdAt",
					model: User,
				})
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean(),
			OrganizerApplication.countDocuments(query),
		]);

		return NextResponse.json(
			{
				applications,
				pagination: {
					total,
					page,
					limit,
					pages: Math.ceil(total / limit),
				},
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching organizer applications:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
