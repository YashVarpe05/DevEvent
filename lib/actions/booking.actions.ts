"use server";
import Booking from "@/database/booking.model";

import connectDB from "../mongodb";

// [FIXED]: Removed unused slug input from the legacy booking action contract.
export const createBooking = async ({
	eventId,
	email,
}: {
	eventId: string;
	email: string;
}) => {
	try {
		await connectDB();
		// Only pass fields defined in Booking schema (eventId and email)
		await Booking.create({ eventId, email });
		return { success: true };
	} catch (error: unknown) {
		console.error("create booking failed", error);
		const duplicateKeyError =
			typeof error === "object" &&
			error !== null &&
			"code" in error &&
			(error as { code?: number }).code === 11000;

		if (duplicateKeyError) {
			return { success: false, error: "You have already booked this event." };
		}
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};
