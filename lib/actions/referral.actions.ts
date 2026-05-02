"use server";

import connectDB from "@/lib/mongodb";
import Referral from "@/database/referral.model";
import { revalidatePath } from "next/cache";

export const createReferral = async (data: { eventId: string; organizerId: string; code: string; name: string }) => {
	try {
		await connectDB();
		
		const existing = await Referral.findOne({ eventId: data.eventId, code: data.code.toLowerCase() });
		if (existing) {
			return { success: false, error: "Referral code already exists for this event" };
		}

		const newReferral = await Referral.create({
			eventId: data.eventId,
			organizerId: data.organizerId,
			code: data.code.toLowerCase(),
			name: data.name,
			clicks: 0,
			conversions: 0,
			revenue: 0,
		});

		revalidatePath(`/organizer/events/${data.eventId}/referrals`);
		return { success: true, data: JSON.parse(JSON.stringify(newReferral)) };
	} catch (error) {
		console.error("Error creating referral:", error);
		return { success: false, error: "Failed to create referral" };
	}
};

export const getEventReferrals = async (eventId: string) => {
	try {
		await connectDB();
		const referrals = await Referral.find({ eventId }).sort({ createdAt: -1 }).lean();
		return { success: true, data: JSON.parse(JSON.stringify(referrals)) };
	} catch (error) {
		console.error("Error fetching referrals:", error);
		return { success: false, error: "Failed to fetch referrals" };
	}
};

export const deleteReferral = async (referralId: string, eventId: string) => {
	try {
		await connectDB();
		await Referral.findByIdAndDelete(referralId);
		revalidatePath(`/organizer/events/${eventId}/referrals`);
		return { success: true };
	} catch (error) {
		console.error("Error deleting referral:", error);
		return { success: false, error: "Failed to delete referral" };
	}
};
