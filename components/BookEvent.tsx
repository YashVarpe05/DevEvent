"use client";
import { createBooking } from "@/lib/actions/booking.actions";
import posthog from "posthog-js";
import React, { useState } from "react";

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const { success, error } = await createBooking({ eventId, slug, email });

		if (success) {
			setSubmitted(true);
			// Only send non-PII fields to analytics
			posthog.capture("event_booked", { eventId, slug });
		} else {
			console.error("create booking failed");
			posthog.captureException(error);
		}
	};

	return (
		<div id="book-event">
			{submitted ? (
				<p className="text-sm">Thank you for signing up!</p>
			) : (
				<form onSubmit={handleSubmit}>
					<div>
						<label htmlFor="email">Email Address</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							id="email"
							placeholder="Enter your email address"
						/>
					</div>
					<button type="submit" className="button-submit">
						Submit
					</button>
				</form>
			)}
		</div>
	);
};

export default BookEvent;
