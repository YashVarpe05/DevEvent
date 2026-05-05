export const dynamic = 'force-dynamic';
import Link from "next/link";
import { notFound } from "next/navigation";
import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Registration from "@/database/registration.model";
import BookEvent from "@/components/BookEvent";
import TicketSelector from "@/components/events/TicketSelector";
import { CalendarDays, MapPin, Video, ExternalLink, Globe } from "lucide-react";
import { getRelatedEventsByEvent } from "@/lib/discovery/recommendations";
import { FollowOrganizerButton } from "@/components/events/FollowOrganizerButton";
import { ShareEventActions } from "@/components/events/ShareEventActions";
import { ReferralTracker } from "@/components/events/ReferralTracker";
import type { Metadata } from "next";

type Props = {
	params: Promise<{ slug: string }>;
};

type ObjectIdLike = string | { toString(): string };

type EventPageOrganizerProfile = {
	organizationName?: string;
	bio?: string;
	websiteUrl?: string;
	logoUrl?: string;
	socialLinks?: Record<string, string | undefined>;
	slug?: string;
	userId?: ObjectIdLike;
};

type EventPageData = {
	_id: ObjectIdLike;
	organizerId?: ObjectIdLike;
	title: string;
	slug: string;
	shortDescription: string;
	description?: string;
	category?: string;
	tags?: string[];
	coverImageUrl?: string;
	eventType: "online" | "offline" | "hybrid";
	visibility: "public" | "unlisted" | "private";
	timezone?: string;
	startAt: Date | string;
	endAt: Date | string;
	isAllDay?: boolean;
	location?: {
		venueName?: string;
		addressLine1?: string;
		addressLine2?: string;
		city?: string;
		country?: string;
	};
	online?: {
		platform?: string;
		meetingUrl?: string;
	};
	capacity?: number;
	isPaid: boolean;
	currency?: string;
	basePrice?: number | null;
	seo?: {
		metaTitle?: string;
		metaDescription?: string;
		ogImage?: string;
	};
	organizerProfileId?: EventPageOrganizerProfile;
};

async function getEvent(slug: string) {
	await connectDB();

	const event = await Event.findOne({
		slug,
		deletedAt: null,
		status: "published",
		visibility: { $in: ["public", "unlisted"] },
	})
		.populate({
			path: "organizerProfileId",
			select: "organizationName bio websiteUrl logoUrl socialLinks slug userId",
		})
		.lean();

	return event;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const event = (await getEvent(slug)) as EventPageData | null;

	if (!event) {
		return {
			title: "Event Not Found | DevEvent",
		};
	}

	const title = event.seo?.metaTitle || `${event.title} | DevEvent`;
	const description = event.seo?.metaDescription || event.shortDescription;
	const ogImage =
		event.seo?.ogImage ||
		event.coverImageUrl ||
		"https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200&h=630";
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
	const canonical = `${appUrl}/events/${event.slug}`;
	const isPublic = event.visibility === "public";

	return {
		title,
		description,
		alternates: {
			canonical,
		},
		openGraph: {
			title,
			description,
			url: canonical,
			images: [
				{
					url: ogImage,
					width: 1200,
					height: 630,
					alt: event.title,
				},
			],
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [ogImage],
		},
		robots: isPublic
			? { index: true, follow: true }
			: { index: false, follow: false },
	};
}

export default async function EventDetailPage({ params }: Props) {
	const { slug } = await params;
	const event = (await getEvent(slug)) as EventPageData | null;

	if (!event) {
		notFound();
	}

	const session = await auth();
	let isRegistered = false;
	let availableSpots = undefined;
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
	const canonicalUrl = `${appUrl}/events/${event.slug}`;

	if (session?.user?.id) {
		const reg = await Registration.findOne({
			eventId: event._id,
			attendeeUserId: session.user.id,
			status: "confirmed",
		});
		if (reg) isRegistered = true;
	}

	if (event.capacity) {
		const confirmedCount = await Registration.countDocuments({
			eventId: event._id,
			status: "confirmed",
		});
		availableSpots = Math.max(0, event.capacity - confirmedCount);
	}

	const startDate = new Date(event.startAt);
	const endDate = new Date(event.endAt);

	const dateString = startDate.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	const startTimeString = startDate.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});
	const endTimeString = endDate.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});

	const relatedEvents = await getRelatedEventsByEvent(
		{
			_id: event._id.toString(),
			category: event.category,
			tags: event.tags,
			location: event.location,
			startAt: event.startAt,
		},
		4,
	);

	const eventStructuredData = {
		"@context": "https://schema.org",
		"@type": "Event",
		name: event.title,
		description: event.shortDescription,
		startDate: new Date(event.startAt).toISOString(),
		endDate: new Date(event.endAt).toISOString(),
		eventStatus: "https://schema.org/EventScheduled",
		eventAttendanceMode:
			event.eventType === "online"
				? "https://schema.org/OnlineEventAttendanceMode"
				: event.eventType === "offline"
					? "https://schema.org/OfflineEventAttendanceMode"
					: "https://schema.org/MixedEventAttendanceMode",
		image: event.coverImageUrl ? [event.coverImageUrl] : undefined,
		location:
			event.eventType === "online"
				? {
						"@type": "VirtualLocation",
						url: canonicalUrl,
					}
				: {
						"@type": "Place",
						name:
							event.location?.venueName ||
							event.location?.city ||
							"Event venue",
						address: {
							"@type": "PostalAddress",
							addressLocality: event.location?.city,
							addressCountry: event.location?.country,
							streetAddress: event.location?.addressLine1,
						},
					},
		organizer: {
			"@type": "Organization",
			name: event.organizerProfileId?.organizationName || "DevEvent Organizer",
			url: event.organizerProfileId?.slug
				? `${appUrl}/organizers/${event.organizerProfileId.slug}`
				: undefined,
		},
		offers: {
			"@type": "Offer",
			price: event.isPaid ? event.basePrice : 0,
			priceCurrency: event.currency || "USD",
			availability:
				availableSpots === 0
					? "https://schema.org/SoldOut"
					: "https://schema.org/InStock",
			url: canonicalUrl,
		},
	};

	const getTypeIcon = () => {
		switch (event.eventType) {
			case "online":
				return <Video className="w-5 h-5 text-blue-500" />;
			case "offline":
				return <MapPin className="w-5 h-5 text-red-500" />;
			case "hybrid":
				return <Globe className="w-5 h-5 text-purple-500" />;
			default:
				return <MapPin className="w-5 h-5 text-gray-400" />;
		}
	};

	const getFormatString = () => {
		switch (event.eventType) {
			case "online":
				return "Online Event";
			case "offline":
				return "In-Person Event";
			case "hybrid":
				return "Hybrid Event (In-Person + Online)";
			default:
				return "Event";
		}
	};

	return (
		<main className="min-h-screen bg-gray-50 pb-20">
			<ReferralTracker eventId={event._id.toString()} />
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(eventStructuredData),
				}}
			/>
			{/* Hero Header Context */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
					<div className="flex flex-col md:flex-row gap-8 lg:gap-16">
						<div className="flex-1">
							<div className="flex flex-wrap gap-2 mb-4">
								{event.category && (
									<span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
										{event.category}
									</span>
								)}
								<span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
									{getTypeIcon()}
									{getFormatString()}
								</span>
							</div>

							<h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
								{event.title}
							</h1>

							<p className="text-xl text-gray-600 mb-8 max-w-3xl">
								{event.shortDescription}
							</p>

							<div className="inline-flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
								<div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
									{event.organizerProfileId?.logoUrl ? (
										<img
											src={event.organizerProfileId.logoUrl}
											alt="Organizer logo"
											className="w-full h-full object-cover"
										/>
									) : (
										<span className="text-xl font-bold text-gray-400">
											{event.organizerProfileId?.organizationName?.substring(
												0,
												1,
											) || "O"}
										</span>
									)}
								</div>
								<div>
									<p className="text-sm text-gray-500 font-medium leading-none mb-1">
										Hosted by
									</p>
									<p className="text-base text-gray-900 font-bold leading-none">
										{event.organizerProfileId?.organizationName ||
											"DevEvent Organizer"}
									</p>
								</div>
								{event.organizerProfileId?.userId ? (
									<FollowOrganizerButton
										organizerId={event.organizerProfileId.userId.toString()}
									/>
								) : null}
								<ShareEventActions
									eventId={event._id.toString()}
									title={event.title}
									canonicalUrl={canonicalUrl}
								/>
							</div>
						</div>

						{/* Quick Actions / Register Card (Desktop) */}
						<div className="hidden md:block w-full max-w-sm">
							<div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 sticky top-24">
								<div className="mb-6 pb-6 border-b border-gray-100">
									<p className="text-sm font-medium text-gray-500 mb-1">
										Access
									</p>
									<p className="text-3xl font-bold text-gray-900">
										{event.isPaid
											? `${event.currency === "USD" ? "$" : event.currency}${event.basePrice}`
											: "Free"}
									</p>
								</div>

								{event.isPaid ? (
									<TicketSelector
										eventId={event._id.toString()}
										currency={event.currency || "USD"}
									/>
								) : (
						<BookEvent
							eventId={event._id.toString()}
							isLoggedIn={!!session?.user}
							isRegistered={isRegistered}
							isPaid={event.isPaid}
							basePrice={event.basePrice ?? null}
							currency={event.currency || "USD"}
							capacity={event.capacity}
							availableSpots={availableSpots}
									/>
								)}

								{!session?.user && !event.isPaid && (
									<p className="text-sm text-center text-gray-500 mt-4">
										Sign in required to register for free events.
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
				<div className="flex flex-col md:flex-row gap-8 lg:gap-16">
					<div className="flex-1 space-y-12">
						{/* Visual Cover (if exists) */}
						{event.coverImageUrl && (
							<div className="w-full aspect-21/9 bg-gray-200 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative">
								<img
									src={event.coverImageUrl}
									alt={event.title}
									className="object-cover w-full h-full"
								/>
							</div>
						)}

						{/* Main Content Area */}
						<section>
							<h2 className="text-2xl font-bold text-gray-900 mb-6">
								About This Event
							</h2>
							<div className="prose prose-lg prose-blue max-w-none text-gray-700 whitespace-pre-wrap">
								{event.description ? (
									event.description
								) : (
									<span className="text-gray-400 italic">
										No additional details provided.
									</span>
								)}
							</div>
						</section>

						{/* Organizer Section */}
						{(event.organizerProfileId?.bio ||
							event.organizerProfileId?.websiteUrl) && (
							<section className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
								<h2 className="text-xl font-bold text-gray-900 mb-4">
									About the Organizer
								</h2>
								<div className="flex gap-6 items-start">
									<div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
										{event.organizerProfileId?.logoUrl ? (
											<img
												src={event.organizerProfileId.logoUrl}
												alt="Logo"
												className="w-full h-full object-cover"
											/>
										) : (
											<span className="text-2xl font-bold text-gray-400">
												{event.organizerProfileId?.organizationName?.substring(
													0,
													1,
												) || "O"}
											</span>
										)}
									</div>
									<div>
										<h3 className="text-lg font-bold text-gray-900 mb-2">
											{event.organizerProfileId?.organizationName ||
												"DevEvent Organizer"}
										</h3>
										<p className="text-gray-600 mb-4">
											{event.organizerProfileId?.bio}
										</p>
										{event.organizerProfileId?.websiteUrl && (
											<a
												href={event.organizerProfileId.websiteUrl}
												target="_blank"
												rel="noreferrer"
												className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline text-sm"
											>
												Visit Website <ExternalLink className="w-4 h-4" />
											</a>
										)}
										{event.organizerProfileId?.slug ? (
											<Link
												href={`/organizers/${event.organizerProfileId.slug}`}
												className="ml-4 inline-flex items-center gap-1.5 text-primary font-medium hover:underline text-sm"
											>
												View organizer page
											</Link>
										) : null}
									</div>
								</div>
							</section>
						)}

						{relatedEvents.length > 0 && (
							<section>
								<h2 className="text-2xl font-bold text-gray-900 mb-4">
									Related Events
								</h2>
								<ul className="grid gap-4 md:grid-cols-2">
									{relatedEvents.map((related) => (
										<li key={related._id.toString()}>
											<Link
												href={`/events/${related.slug}`}
												className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300"
											>
												<p className="text-xs uppercase text-gray-500">
													{related.category || "Event"}
												</p>
												<h3 className="mt-1 text-lg font-semibold text-gray-900">
													{related.title}
												</h3>
												<p className="mt-2 text-sm text-gray-600">
													{new Date(related.startAt).toLocaleString()}
												</p>
											</Link>
										</li>
									))}
								</ul>
							</section>
						)}
					</div>

					{/* Logistics Sidebar */}
					<div className="w-full md:max-w-sm space-y-6">
						<div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
							<h3 className="text-lg font-bold text-gray-900">Date & Time</h3>
							<div className="flex gap-4">
								<div className="bg-blue-50 text-blue-600 p-3 rounded-xl shrink-0">
									<CalendarDays className="w-6 h-6" />
								</div>
								<div>
									<p className="font-medium text-gray-900">{dateString}</p>
									<p className="text-gray-600 mt-0.5">
										{event.isAllDay
											? "All Day"
											: `${startTimeString} to ${endTimeString}`}
									</p>
									<p className="text-sm text-gray-500 mt-0.5">
										{event.timezone}
									</p>
								</div>
							</div>

							<h3 className="text-lg font-bold text-gray-900 pt-4 border-t border-gray-100">
								Location
							</h3>

							{/* Offline Location details */}
							{(event.eventType === "offline" ||
								event.eventType === "hybrid") &&
								event.location && (
									<div className="flex gap-4">
										<div className="bg-red-50 text-red-600 p-3 rounded-xl shrink-0">
											<MapPin className="w-6 h-6" />
										</div>
										<div>
											<p className="font-medium text-gray-900">
												{event.location.venueName || "Venue"}
											</p>
											<p className="text-gray-600 mt-0.5">
												{event.location.addressLine1}
											</p>
											{event.location.addressLine2 && (
												<p className="text-gray-600">
													{event.location.addressLine2}
												</p>
											)}
											<p className="text-gray-600">
												{event.location.city}, {event.location.country}
											</p>
											<Link
												href={`https://maps.google.com/?q=${encodeURIComponent(`${event.location.addressLine1} ${event.location.city} ${event.location.country}`)}`}
												target="_blank"
												className="text-primary text-sm font-medium mt-2 inline-block hover:underline"
											>
												Show on Maps
											</Link>
										</div>
									</div>
								)}

							{/* Online Location details */}
							{(event.eventType === "online" || event.eventType === "hybrid") &&
								event.online && (
									<div className="flex gap-4">
										<div className="bg-purple-50 text-purple-600 p-3 rounded-xl shrink-0">
											<Video className="w-6 h-6" />
										</div>
										<div>
											<p className="font-medium text-gray-900">
												{event.online.platform || "Online Streaming"}
											</p>
											<p className="text-sm text-gray-600 mt-1 pb-1">
												Link will be available to registered attendees.
											</p>
										</div>
									</div>
								)}

							<div className="pt-6 border-t border-gray-100">
								<ShareEventActions
									eventId={event._id.toString()}
									title={event.title}
									canonicalUrl={canonicalUrl}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Sticky CTA */}
			<div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40">
				<div className="flex justify-between items-center mb-3">
					<p className="text-sm font-medium text-gray-500">Access</p>
					<p className="text-2xl font-bold text-gray-900">
						{event.isPaid
							? `${event.currency === "USD" ? "$" : event.currency}${event.basePrice}`
							: "Free"}
					</p>
				</div>
				{event.isPaid ? (
					<TicketSelector
						eventId={event._id.toString()}
						currency={event.currency || "USD"}
					/>
				) : (
					<BookEvent
						eventId={event._id.toString()}
						isLoggedIn={!!session?.user}
						isRegistered={isRegistered}
						isPaid={event.isPaid}
						basePrice={event.basePrice ?? null}
						currency={event.currency || "USD"}
						capacity={event.capacity}
						availableSpots={availableSpots}
					/>
				)}
			</div>
		</main>
	);
}
