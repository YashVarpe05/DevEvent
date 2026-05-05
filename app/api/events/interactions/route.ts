import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import UserEventInteraction from "@/database/user-event-interaction.model";
import UserInterestProfile from "@/database/user-interest-profile.model";
import { trackInteractionSchema } from "@/lib/validations/discovery";
import { trackServerEvent } from "@/lib/analytics";

export async function POST(request: Request) {
	try {
		const session = await auth();
		const body = await request.json().catch(() => ({}));
		const parsed = trackInteractionSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid payload", issues: parsed.error.issues },
				{ status: 400 },
			);
		}

		await connectDB();
		const event = await Event.findById(parsed.data.eventId).lean();
		if (!event) {
			return NextResponse.json({ error: "Event not found" }, { status: 404 });
		}

		const userId = session?.user?.id || null;
		await UserEventInteraction.create({
			userId,
			eventId: parsed.data.eventId,
			type: parsed.data.type,
			weight: parsed.data.weight,
			query: parsed.data.query,
			filtersHash: parsed.data.filtersHash,
			position: parsed.data.position,
		});

		const incStats: Record<string, number> = {};
		if (parsed.data.type === "view") incStats["stats.viewsCount"] = 1;
		if (parsed.data.type === "bookmark") incStats["stats.bookmarksCount"] = 1;
		if (Object.keys(incStats).length > 0) {
			await Event.updateOne({ _id: parsed.data.eventId }, { $inc: incStats });
		}

		if (userId) {
			const profile = await UserInterestProfile.findOne({ userId });
			if (!profile) {
				await UserInterestProfile.create({
					userId,
					preferredCategories: event.category ? [event.category] : [],
					preferredCities: event.location?.city ? [event.location.city] : [],
					preferredFormats: event.eventType ? [event.eventType] : [],
					priceAffinity: event.isPaid ? "paid" : "free",
					recentInteractions: [
						{
							eventId: event._id,
							category: event.category,
							weight: parsed.data.weight,
							at: new Date(),
						},
					],
				});
			} else {
				const categories = new Set(profile.preferredCategories || []);
				const cities = new Set(profile.preferredCities || []);
				const formats = new Set(profile.preferredFormats || []);
				if (event.category) categories.add(event.category);
				if (event.location?.city) cities.add(event.location.city);
				if (event.eventType) formats.add(event.eventType);

				const recentInteractions = [
					{
						eventId: event._id,
						category: event.category,
						weight: parsed.data.weight,
						at: new Date(),
					},
					...(profile.recentInteractions || []),
				].slice(0, 40);

				profile.preferredCategories = [...categories];
				profile.preferredCities = [...cities];
				profile.preferredFormats = [...formats] as any;
				profile.recentInteractions = recentInteractions;
				if (profile.priceAffinity === "mixed") {
					profile.priceAffinity = event.isPaid ? "paid" : "free";
				}
				await profile.save();
			}
		}

		trackServerEvent(
			parsed.data.type === "view"
				? "event_card_clicked"
				: parsed.data.type === "share"
					? "share_clicked"
					: parsed.data.type === "bookmark"
						? "saved_search_created"
						: "filter_applied",
			{
				eventId: parsed.data.eventId,
				userId,
				query: parsed.data.query,
				filtersHash: parsed.data.filtersHash,
				position: parsed.data.position,
			},
		);

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error("Interaction tracking error", error);
		return NextResponse.json(
			{ error: error.message || "Failed to track interaction" },
			{ status: 500 },
		);
	}
}
