export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import SavedSearch from "@/database/saved-search.model";
import { saveSearchSchema } from "@/lib/validations/discovery";
import { trackServerEvent } from "@/lib/analytics";

export async function GET() {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();
		const searches = await SavedSearch.find({ userId: session.user.id })
			.sort({ createdAt: -1 })
			.lean();
		return NextResponse.json({ searches });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to load saved searches" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json().catch(() => ({}));
		const parsed = saveSearchSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid payload", issues: parsed.error.issues },
				{ status: 400 },
			);
		}

		await connectDB();
		const search = await SavedSearch.create({
			userId: session.user.id,
			query: parsed.data.query || "",
			filters: parsed.data.filters || {},
			name: parsed.data.name,
			notificationFrequency: parsed.data.notificationFrequency,
		});

		trackServerEvent("saved_search_created", {
			userId: session.user.id,
			savedSearchId: search._id.toString(),
			notificationFrequency: search.notificationFrequency,
		});

		return NextResponse.json({ search }, { status: 201 });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to save search" },
			{ status: 500 },
		);
	}
}
