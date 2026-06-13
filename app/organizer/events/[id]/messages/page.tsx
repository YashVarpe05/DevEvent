export const dynamic = 'force-dynamic';
import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Registration from "@/database/registration.model";
import { ArrowLeft } from "lucide-react";
import MessageGuestsPanel from "@/components/organizer/MessageGuestsPanel";
import { canManageEvent } from "@/lib/event-access";

export const metadata = {
	title: "Message Guests | DevEvent",
};

export default async function MessageGuestsPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const session = await auth();

	if (!session?.user?.id) {
		redirect(`/login?callbackUrl=/organizer/events/${id}/messages`);
	}

	await connectDB();

	const event = await Event.findById(id).lean();

	if (!event || event.deletedAt || !canManageEvent(event, session)) {
		notFound();
	}

	const confirmedCount = await Registration.countDocuments({ eventId: id, status: "confirmed" });
	const activeCount = await Registration.countDocuments({
		eventId: id,
		status: { $in: ["confirmed", "waitlisted", "pending_approval"] },
	});

	return (
		<div style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
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

			<div style={{ marginBottom: "32px" }}>
				<h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "0 0 8px 0" }}>Message Guests</h1>
				<p style={{ color: "var(--text-secondary)", fontSize: "15px", margin: 0 }}>
					Send announcements to registered guests or invite new people by email.
				</p>
			</div>

			<MessageGuestsPanel
				eventId={id}
				confirmedCount={confirmedCount}
				activeCount={activeCount}
			/>
		</div>
	);
}
