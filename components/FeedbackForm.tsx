"use client";

import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";

type FeedbackFormProps = {
	eventId: string;
	eventTitle: string;
};

export default function FeedbackForm({ eventId, eventTitle }: FeedbackFormProps) {
	const [rating, setRating] = useState(0);
	const [hovered, setHovered] = useState(0);
	const [comment, setComment] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Prefill with previously submitted feedback
		fetch(`/api/events/${eventId}/feedback`)
			.then((res) => (res.ok ? res.json() : null))
			.then((data) => {
				if (data?.feedback) {
					setRating(data.feedback.rating);
					setComment(data.feedback.comment || "");
					setSubmitted(true);
				}
			})
			.catch(() => {});
	}, [eventId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (rating < 1) {
			setError("Pick a star rating first");
			return;
		}
		setSubmitting(true);
		setError(null);
		try {
			const res = await fetch(`/api/events/${eventId}/feedback`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ rating, comment: comment || undefined }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to submit feedback");
			setSubmitted(true);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to submit feedback");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			style={{
				background: "var(--bg-surface)",
				border: "1px solid var(--border-dim)",
				borderRadius: "var(--radius-lg)",
				padding: "24px",
				marginTop: "24px",
			}}
		>
			<h3 style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px 0" }}>
				{submitted ? "Your feedback" : `How was ${eventTitle}?`}
			</h3>
			<p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "0 0 16px 0" }}>
				{submitted ? "Thanks! You can update your rating anytime." : "Your rating helps the host improve future events."}
			</p>

			<div style={{ display: "flex", gap: "6px", marginBottom: "16px" }} role="radiogroup" aria-label="Star rating">
				{[1, 2, 3, 4, 5].map((star) => (
					<button
						key={star}
						type="button"
						onClick={() => setRating(star)}
						onMouseEnter={() => setHovered(star)}
						onMouseLeave={() => setHovered(0)}
						aria-label={`${star} star${star > 1 ? "s" : ""}`}
						style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
					>
						<Star
							size={26}
							style={{
								color: star <= (hovered || rating) ? "var(--gold)" : "var(--border-dim)",
								fill: star <= (hovered || rating) ? "var(--gold)" : "transparent",
								transition: "color 120ms ease",
							}}
						/>
					</button>
				))}
			</div>

			<textarea
				value={comment}
				onChange={(e) => setComment(e.target.value)}
				maxLength={2000}
				rows={3}
				placeholder="Anything you'd like the host to know? (optional)"
				style={{
					width: "100%",
					padding: "10px 14px",
					background: "var(--bg-base)",
					border: "1px solid var(--border-dim)",
					borderRadius: "var(--radius-md)",
					color: "var(--text-primary)",
					outline: "none",
					fontSize: "14px",
					resize: "vertical",
					marginBottom: "14px",
				}}
			/>

			<button
				type="submit"
				disabled={submitting}
				style={{
					background: "var(--gold)",
					color: "#000",
					padding: "10px 20px",
					borderRadius: "var(--radius-md)",
					fontWeight: 600,
					border: "none",
					cursor: "pointer",
					fontSize: "14px",
					opacity: submitting ? 0.6 : 1,
				}}
			>
				{submitting ? "Submitting..." : submitted ? "Update Feedback" : "Submit Feedback"}
			</button>

			{error && <p style={{ fontSize: "13px", color: "var(--red)", marginTop: "10px" }}>{error}</p>}
		</form>
	);
}
