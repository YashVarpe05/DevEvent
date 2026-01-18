"use server";
import Event from "@/database/event.model";
import connectDB from "../mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
	try {
		await connectDB();
		const event = await Event.findOne({ slug });

		// Guard against null/undefined event
		if (!event) {
			return [];
		}

		return await Event.find({
			_id: { $ne: event._id },
			tags: { $in: event.tags },
		}).lean();
	} catch {
		return [];
	}
};

export const getAllEvents = async () => {
	try {
		await connectDB();
		const events = await Event.find({}).sort({ createdAt: -1 }).lean();
		return { success: true, data: events };
	} catch (error) {
		console.error("Error fetching events:", error);
		return { success: false, error: "Failed to fetch events" };
	}
};
