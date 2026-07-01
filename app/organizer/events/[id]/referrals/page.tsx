export const dynamic = 'force-dynamic';
import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { getEventReferrals } from "@/lib/actions/referral.actions";
import ReferralManager from "@/components/events/referrals/ReferralManager";
import { ArrowLeft, LinkIcon } from "lucide-react";

export const metadata = {
	title: "Referral Links | DevEvent",
};

type ObjectIdLike = string | { toString(): string };

interface OrganizerReferralEvent {
	_id: ObjectIdLike;
	title: string;
	slug: string;
	organizerId: ObjectIdLike;
	deletedAt?: Date | null;
}

export default async function ReferralsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/login");
	}

	const { id } = await params;

	await connectDB();
	const event = await Event.findById(id).lean<OrganizerReferralEvent>();

	if (!event || event.deletedAt) {
		notFound();
	}

	const isAdmin = session.user.roles?.includes("admin");
	const isOwner = event.organizerId.toString() === session.user.id;

	if (!isAdmin && !isOwner) {
		redirect("/organizer/events");
	}

	const result = await getEventReferrals(id);
	const referrals = result.success && result.data ? result.data : [];

	return (
		<main style={{ padding: "32px 24px", maxWidth: "1000px", margin: "0 auto" }}>
			<div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
				<div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
					<Link
						href="/organizer/events"
						className="nav-pill"
						style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", padding: "8px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center" }}
					>
						<ArrowLeft className="w-4 h-4" />
					</Link>
					<span style={{ color: "var(--border-dim)", fontWeight: 500 }}>|</span>
					<span style={{ color: "var(--text-secondary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.title}</span>
				</div>

				<div>
					<h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: "12px", margin: "0 0 8px 0" }}>
						<LinkIcon style={{ color: "var(--gold)", width: "24px", height: "24px" }} />
						Referral Links
					</h1>
					<p style={{ color: "var(--text-secondary)", fontSize: "15px", margin: 0 }}>
						Create trackable referral links for <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{event.title}</span>. 
						Share them with partners, influencers, or affiliates to track clicks and conversions.
					</p>
				</div>

				{/* Quick Navigation */}
				<div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px", marginBottom: "32px" }}>
					<Link
						href={`/organizer/events/${id}/edit`}
						className="nav-pill"
						style={{ fontSize: "13px", padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-dim)", textDecoration: "none" }}
					>
						Edit Event
					</Link>
					<Link
						href={`/organizer/events/${id}/tickets`}
						className="nav-pill"
						style={{ fontSize: "13px", padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-dim)", textDecoration: "none" }}
					>
						Tickets
					</Link>
					<Link
						href={`/organizer/events/${id}/promo-codes`}
						className="nav-pill"
						style={{ fontSize: "13px", padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-dim)", textDecoration: "none" }}
					>
						Promo Codes
					</Link>
					<Link
						href={`/organizer/events/${id}/referrals`}
						style={{ fontSize: "13px", padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--gold-dim)", background: "var(--gold-dim)", color: "var(--gold)", fontWeight: 500, textDecoration: "none" }}
					>
						Referrals
					</Link>
					<Link
						href={`/organizer/events/${id}/orders`}
						className="nav-pill"
						style={{ fontSize: "13px", padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-dim)", textDecoration: "none" }}
					>
						Orders
					</Link>
					<Link
						href={`/organizer/events/${id}/attendees`}
						className="nav-pill"
						style={{ fontSize: "13px", padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-dim)", textDecoration: "none" }}
					>
						Attendees
					</Link>
					<Link
						href={`/organizer/events/${id}/earnings`}
						className="nav-pill"
						style={{ fontSize: "13px", padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-dim)", textDecoration: "none" }}
					>
						Earnings
					</Link>
				</div>

				<ReferralManager
					eventId={id}
					eventSlug={event.slug}
					initialReferrals={referrals}
				/>
			</div>
		</main>
	);
}
