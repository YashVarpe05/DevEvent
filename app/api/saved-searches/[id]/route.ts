export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import SavedSearch from "@/database/saved-search.model";
import { saveSearchSchema } from "@/lib/validations/discovery";

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const body = await request.json().catch(() => ({}));
		const parsed = saveSearchSchema.partial().safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid payload", issues: parsed.error.issues },
				{ status: 400 },
			);
		}

		await connectDB();
		const updated = await SavedSearch.findOneAndUpdate(
			{ _id: id, userId: session.user.id },
			{ $set: parsed.data },
			{ new: true },
		).lean();
		if (!updated) {
			return NextResponse.json(
				{ error: "Saved search not found" },
				{ status: 404 },
			);
		}
		return NextResponse.json({ search: updated });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to update saved search" },
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
		const deleted = await SavedSearch.findOneAndDelete({
			_id: id,
			userId: session.user.id,
		}).lean();
		if (!deleted) {
			return NextResponse.json(
				{ error: "Saved search not found" },
				{ status: 404 },
			);
		}
		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error.message || "Failed to delete saved search" },
			{ status: 500 },
		);
	}
}
