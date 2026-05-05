export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import OrganizerProfile from "@/database/organizer-profile.model";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { publishEventSchema } from "@/lib/validations/event";
import { cacheDelByPrefix } from "@/lib/cache/redis";

export async function POST(
	req: NextRequest,
	props: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		const { id } = await props.params;

		await connectDB();
		const event = await Event.findById(id).lean();

		if (!event || event.deletedAt) {
			return NextResponse.json({ message: "Event not found" }, { status: 404 });
		}

		const isAdmin = session.user.roles?.includes("admin");
		const isOwner = event.organizerId.toString() === session.user.id;

		if (!isAdmin && !isOwner) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		if (event.status === "published") {
			return NextResponse.json(
				{ message: "Event is already published" },
				{ status: 400 },
			);
		}

		if (event.isPaid) {
			const organizerProfile = await OrganizerProfile.findOne({
				userId: event.organizerId,
			}).lean();
			if (
				!organizerProfile?.stripeConnectedAccountId ||
				!organizerProfile.chargesEnabled ||
				!organizerProfile.payoutsEnabled
			) {
				return NextResponse.json(
					{
						message:
							"Paid events require completed Stripe Connect onboarding with charges and payouts enabled.",
					},
					{ status: 400 },
				);
			}
		}

		// Validate the event against the publish schema
		const validationResult = publishEventSchema.safeParse(event);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					message: "Event does not meet publish requirements",
					errors: validationResult.error.issues,
				},
				{ status: 400 },
			);
		}

		// Update to published
		const updatedEvent = await Event.findByIdAndUpdate(
			id,
			{
				$set: {
					status: "published",
					publishedAt: event.publishedAt || new Date(),
					lastPublishedAt: new Date(),
				},
			},
			{ new: true },
		);

		await Promise.all([
			cacheDelByPrefix("discovery:search:"),
			cacheDelByPrefix("discovery:recommended:"),
		]);

		return NextResponse.json(
			{ message: "Event published successfully", event: updatedEvent },
			{ status: 200 },
		);
	} catch (error: any) {
		console.error("Publish event error:", error);
		return NextResponse.json(
			{ message: "Failed to publish event", error: error.message },
			{ status: 500 },
		);
	}
}
