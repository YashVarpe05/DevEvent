export const dynamic = 'force-dynamic';
import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Types } from "mongoose";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import EventFeedback from "@/database/event-feedback.model";
import "@/database/user.model";
import { canManageEvent } from "@/lib/event-access";
import { ArrowLeft, Star, MessageSquare } from "lucide-react";

export const metadata = {
	title: "Event Feedback | DevEvent",
};

function Stars({ rating }: { rating: number }) {
	return (
		<span style={{ display: "inline-flex", gap: "2px", verticalAlign: "middle" }}>
			{[1, 2, 3, 4, 5].map((star) => (
				<Star
					key={star}
					size={14}
					style={{
						color: star <= Math.round(rating) ? "var(--gold)" : "var(--border-dim)",
						fill: star <= Math.round(rating) ? "var(--gold)" : "transparent",
					}}
				/>
			))}
		</span>
	);
}

export default async function EventFeedbackPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const session = await auth();

	if (!session?.user?.id) {
		redirect(`/login?callbackUrl=/organizer/events/${id}/feedback`);
	}

	await connectDB();

	const event = await Event.findById(id).lean();
	if (!event || event.deletedAt || !canManageEvent(event, session)) {
		notFound();
	}

	const [summary] = await EventFeedback.aggregate([
		{ $match: { eventId: new Types.ObjectId(id) } },
		{ $group: { _id: null, averageRating: { $avg: "$rating" }, count: { $sum: 1 } } },
	]);

	const entries = (await EventFeedback.find({ eventId: id })
		.populate({ path: "attendeeUserId", select: "name image" })
		.sort({ createdAt: -1 })
		.limit(100)
		.lean()) as Array<{
		_id: { toString(): string };
		rating: number;
		comment?: string;
		createdAt: Date;
		attendeeUserId?: { name?: string } | null;
	}>;

	const averageRating = summary ? Math.round(summary.averageRating * 10) / 10 : null;

	return (
		<div style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
			<div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
				<Link
					href={`/organizer/events/${id}/attendees`}
					style={{ color: "var(--text-secondary)", background: "var(--bg-surface)", border: "1px solid var(--border-dim)", padding: "8px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center" }}
				>
					<ArrowLeft className="w-5 h-5" />
				</Link>
				<span style={{ color: "var(--border-dim)", fontWeight: 500 }}>|</span>
				<span style={{ color: "var(--text-secondary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.title}</span>
			</div>

			<h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "0 0 8px 0" }}>Guest Feedback</h1>
			<p style={{ color: "var(--text-secondary)", fontSize: "15px", margin: "0 0 32px 0" }}>What attendees thought of your event.</p>

			<div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-lg)", padding: "24px", marginBottom: "24px", display: "flex", gap: "40px", flexWrap: "wrap" }}>
				<div>
					<p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 8px 0" }}>Average rating</p>
					<p style={{ fontSize: "32px", fontWeight: 700, color: "var(--gold)", fontFamily: "var(--font-display)", margin: 0 }}>
						{averageRating ?? "—"}
						{averageRating !== null && <span style={{ fontSize: "14px", color: "var(--text-muted)", marginLeft: "8px" }}><Stars rating={averageRating} /></span>}
					</p>
				</div>
				<div>
					<p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 8px 0" }}>Responses</p>
					<p style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: 0 }}>{summary?.count ?? 0}</p>
				</div>
			</div>

			{entries.length === 0 ? (
				<div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-lg)", padding: "48px 24px", textAlign: "center" }}>
					<MessageSquare style={{ width: "32px", height: "32px", color: "var(--text-muted)", margin: "0 auto 12px" }} />
					<p style={{ color: "var(--text-secondary)", fontSize: "15px", margin: 0 }}>
						No feedback yet. Guests can rate the event from their ticket page once it ends.
					</p>
				</div>
			) : (
				<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
					{entries.map((entry) => (
						<div key={entry._id.toString()} style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
								<span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>
									{entry.attendeeUserId?.name || "Guest"}
								</span>
								<Stars rating={entry.rating} />
							</div>
							{entry.comment && (
								<p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.6, margin: "10px 0 0 0" }}>{entry.comment}</p>
							)}
							<p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "8px 0 0 0" }}>
								{new Date(entry.createdAt).toLocaleDateString()}
							</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
