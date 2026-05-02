"use server";

import connectDB from "@/lib/mongodb";
import Referral from "@/database/referral.model";
import Event from "@/database/event.model";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const referralInputSchema = z.object({
	eventId: z.string().min(1),
	code: z.string().trim().min(1).max(64),
	name: z.string().trim().min(1).max(100),
});

async function authorizeEventOrganizer(eventId: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { authorized: false as const, error: "Unauthorized" };
	}

	const event = await Event.findById(eventId).select("organizerId deletedAt").lean<{
		organizerId: { toString(): string };
		deletedAt?: Date | null;
	}>();

	if (!event || event.deletedAt) {
		return { authorized: false as const, error: "Event not found" };
	}

	const isAdmin = session.user.roles?.includes("admin");
	const isOwner = event.organizerId.toString() === session.user.id;
	if (!isAdmin && !isOwner) {
		return { authorized: false as const, error: "Forbidden" };
	}

	return {
		authorized: true as const,
		userId: session.user.id,
	};
}

export const createReferral = async (data: {
	eventId: string;
	code: string;
	name: string;
}) => {
	try {
		await connectDB();

		const parsed = referralInputSchema.safeParse(data);
		if (!parsed.success) {
			return { success: false, error: "Invalid referral details" };
		}

		const authorization = await authorizeEventOrganizer(parsed.data.eventId);
		if (!authorization.authorized) {
			return { success: false, error: authorization.error };
		}

		const normalizedCode = parsed.data.code.toLowerCase();
		const existing = await Referral.findOne({
			eventId: parsed.data.eventId,
			code: normalizedCode,
		});
		if (existing) {
			return { success: false, error: "Referral code already exists for this event" };
		}

		const newReferral = await Referral.create({
			eventId: parsed.data.eventId,
			organizerId: authorization.userId,
			code: normalizedCode,
			name: parsed.data.name,
			clicks: 0,
			conversions: 0,
			revenue: 0,
		});

		revalidatePath(`/organizer/events/${parsed.data.eventId}/referrals`);
		return { success: true, data: JSON.parse(JSON.stringify(newReferral)) };
	} catch (error) {
		console.error("Error creating referral:", error);
		return { success: false, error: "Failed to create referral" };
	}
};

export const getEventReferrals = async (eventId: string) => {
	try {
		await connectDB();
		const authorization = await authorizeEventOrganizer(eventId);
		if (!authorization.authorized) {
			return { success: false, error: authorization.error };
		}

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
		const authorization = await authorizeEventOrganizer(eventId);
		if (!authorization.authorized) {
			return { success: false, error: authorization.error };
		}

		await Referral.findOneAndDelete({ _id: referralId, eventId });
		revalidatePath(`/organizer/events/${eventId}/referrals`);
		return { success: true };
	} catch (error) {
		console.error("Error deleting referral:", error);
		return { success: false, error: "Failed to delete referral" };
	}
};
