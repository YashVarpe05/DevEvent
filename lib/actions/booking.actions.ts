"use server";
import Booking from "@/database/booking.model";

import connectDB from "../mongodb";

export const createBooking = async ({
	eventId,
	slug,
	email,
}: {
	eventId: string;
	slug: string;
	email: string;
}) => {
	try {
		await connectDB();
		// Only pass fields defined in Booking schema (eventId and email)
		await Booking.create({ eventId, email });
		return { success: true };
	} catch (error: any) {
		console.error("create booking failed", error);
		if (error.code === 11000) {
			return { success: false, error: "You have already booked this event." };
		}
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};
