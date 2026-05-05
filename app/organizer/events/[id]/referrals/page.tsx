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
		<main className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-6">
					<Link
						href="/organizer/events"
						className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
					>
						<ArrowLeft className="w-4 h-4 mr-1" />
						Back to Events
					</Link>
				</div>

				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
						<LinkIcon className="text-primary w-7 h-7" />
						Referral Links
					</h1>
					<p className="text-gray-500 mt-2">
						Create trackable referral links for <span className="font-semibold">{event.title}</span>. 
						Share them with partners, influencers, or affiliates to track clicks and conversions.
					</p>
				</div>

				{/* Quick Navigation */}
				<div className="mb-6 flex flex-wrap gap-2">
					<Link
						href={`/organizer/events/${id}/edit`}
						className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
					>
						Edit Event
					</Link>
					<Link
						href={`/organizer/events/${id}/tickets`}
						className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
					>
						Tickets
					</Link>
					<Link
						href={`/organizer/events/${id}/promo-codes`}
						className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
					>
						Promo Codes
					</Link>
					<Link
						href={`/organizer/events/${id}/referrals`}
						className="text-sm px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-primary font-medium transition-colors"
					>
						Referrals
					</Link>
					<Link
						href={`/organizer/events/${id}/orders`}
						className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
					>
						Orders
					</Link>
					<Link
						href={`/organizer/events/${id}/attendees`}
						className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
					>
						Attendees
					</Link>
					<Link
						href={`/organizer/events/${id}/earnings`}
						className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
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
