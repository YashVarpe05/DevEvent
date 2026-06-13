export const dynamic = 'force-dynamic';
import Link from "next/link";
import { notFound } from "next/navigation";
import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Registration from "@/database/registration.model";
import "@/database/organizer-profile.model"; // Added to register the schema for populate
import "@/database/user.model"; // Registered for guest-list populate
import { googleCalendarUrl, outlookCalendarUrl } from "@/lib/ics";
import { ACTIVE_REGISTRATION_STATUSES, countConfirmedSeats } from "@/lib/registrations";
import BookEvent from "@/components/BookEvent";
import TicketSelector from "@/components/events/TicketSelector";
import { CalendarDays, MapPin, Video, ArrowUpRight, Plus } from "lucide-react";
import { getRelatedEventsByEvent } from "@/lib/discovery/recommendations";
import { FollowOrganizerButton } from "@/components/events/FollowOrganizerButton";
import { ShareEventActions } from "@/components/events/ShareEventActions";
import { ReferralTracker } from "@/components/events/ReferralTracker";
import type { Metadata } from "next";

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  }
  return symbols[currency?.toUpperCase()]
    ?? currency?.toUpperCase() ?? "$"
}

function formatEventDate(date: Date | string): string {
  const d = new Date(date)
  const day = d.toLocaleDateString("en-IN", {
    weekday: "short"
  }).toUpperCase()
  const dayNum = d.getDate()
  const month = d.toLocaleDateString("en-IN", {
    month: "short"
  }).toUpperCase()
  const time = d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toUpperCase()
  return `${day} · ${dayNum} ${month} · ${time}`
}

type Props = {
	params: Promise<{ slug: string }>;
};

type ObjectIdLike = string | { toString(): string };

type EventPageOrganizerProfile = {
	displayName?: string;
	bio?: string;
	website?: string;
	avatarUrl?: string;
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
	capacityType?: "limited" | "unlimited";
	requiresApproval?: boolean;
	waitlistEnabled?: boolean;
	showGuestList?: boolean;
	registrationQuestions?: {
		id: string;
		label: string;
		type: "text" | "select" | "checkbox";
		required: boolean;
		options: string[];
	}[];
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
			select: "displayName bio website avatarUrl socialLinks slug userId",
		})
		.lean();

	return event;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const event = (await getEvent(slug)) as EventPageData | null;

	if (!event) {
		// Sets the 404 status before streaming begins; returning plain metadata
		// here would let the page shell stream with a 200.
		notFound();
	}

	const title = event.seo?.metaTitle || `${event.title} | DevEvent`;
	const description = event.seo?.metaDescription || event.shortDescription;
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://devevents.dev";
	const canonical = `${appUrl}/events/${event.slug}`;
	const isPublic = event.visibility === "public";

	// Only override images when the organizer set a custom one — otherwise the
	// opengraph-image.tsx file convention serves the generated branded card.
	const customOgImage = event.seo?.ogImage
		? [{ url: event.seo.ogImage, width: 1200, height: 630, alt: event.title }]
		: undefined;

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
			...(customOgImage ? { images: customOgImage } : {}),
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			...(customOgImage ? { images: [event.seo!.ogImage!] } : {}),
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
	let registrationStatus: "confirmed" | "waitlisted" | "pending_approval" | null = null;
	let availableSpots = undefined;
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://devevents.dev";
	const canonicalUrl = `${appUrl}/events/${event.slug}`;

	if (session?.user?.id) {
		const reg = (await Registration.findOne({
			eventId: event._id,
			attendeeUserId: session.user.id,
			status: { $in: ACTIVE_REGISTRATION_STATUSES },
		})
			.select("status")
			.lean()) as { status: string } | null;
		if (reg) {
			registrationStatus = reg.status as "confirmed" | "waitlisted" | "pending_approval";
		}
	}

	if (event.capacity) {
		const confirmedSeats = await countConfirmedSeats(event._id.toString());
		availableSpots = Math.max(0, event.capacity - confirmedSeats);
	}

	// Guest list — public-safe: first names and avatars of confirmed guests only
	const showGuestList = event.showGuestList !== false;
	let goingCount = 0;
	let guestPreviews: { name: string; avatar?: string }[] = [];

	if (showGuestList) {
		goingCount = await Registration.countDocuments({
			eventId: event._id,
			status: "confirmed",
		});

		if (goingCount > 0) {
			const guests = (await Registration.find({
				eventId: event._id,
				status: "confirmed",
			})
				.sort({ createdAt: 1 })
				.limit(8)
				.populate({ path: "attendeeUserId", select: "name image" })
				.lean()) as Array<{
				attendeeName?: string;
				attendeeUserId?: { name?: string; image?: string } | null;
			}>;

			guestPreviews = guests.map((g) => ({
				name: (g.attendeeUserId?.name || g.attendeeName || "Guest").split(" ")[0],
				avatar: g.attendeeUserId?.image,
			}));
		}
	}

	// Other upcoming dates if this event is part of a recurring series
	let seriesEvents: { slug: string; startAt: Date | string; title: string }[] = [];
	const eventWithSeries = event as EventPageData & { seriesId?: ObjectIdLike | null };
	if (eventWithSeries.seriesId) {
		seriesEvents = (await Event.find({
			seriesId: eventWithSeries.seriesId.toString(),
			_id: { $ne: event._id.toString() },
			status: "published",
			deletedAt: null,
			visibility: { $in: ["public", "unlisted"] },
			endAt: { $gte: new Date() },
		})
			.select("slug startAt title")
			.sort({ startAt: 1 })
			.limit(6)
			.lean()) as { slug: string; startAt: Date; title: string }[];
	}

	const calendarEventInput = {
		id: event._id.toString(),
		slug: event.slug,
		title: event.title,
		description: event.shortDescription,
		startAt: event.startAt,
		endAt: event.endAt,
		location: event.location,
		eventType: event.eventType,
	};
	const calendarLinks = {
		google: googleCalendarUrl(calendarEventInput),
		outlook: outlookCalendarUrl(calendarEventInput),
		ics: `/api/public/events/${event.slug}/calendar`,
	};

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
			name: event.organizerProfileId?.displayName || "DevEvent Organizer",
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

	const priceLabel = event.isPaid
		? `${getCurrencySymbol(event.currency || "USD")}${event.basePrice}`
		: "Free";

	const capacityUsedPct =
		availableSpots !== undefined && event.capacity
			? Math.min(100, ((event.capacity - availableSpots) / event.capacity) * 100)
			: 0;

	return (
		<main className="min-h-screen bg-bg-base pb-44 md:pb-20">
			<ReferralTracker eventId={event._id.toString()} />
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(eventStructuredData),
				}}
			/>

			{/* SECTION 1 — HERO */}
			<section className="w-full relative overflow-hidden flex flex-col justify-end min-h-[320px] md:min-h-[440px] pt-24">
				{event.coverImageUrl ? (
					<>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={event.coverImageUrl}
							alt={event.title}
							className="absolute inset-0 w-full h-full object-cover"
						/>
						<div
							className="absolute inset-0"
							style={{
								background:
									"linear-gradient(to bottom, rgba(10,10,11,0.45) 0%, rgba(10,10,11,0.65) 50%, rgba(10,10,11,0.97) 100%)",
							}}
						/>
					</>
				) : (
					<div
						className="absolute inset-0 bg-bg-void"
						style={{
							backgroundImage:
								"radial-gradient(ellipse 60% 50% at 50% 100%, rgba(255,107,53,0.05), transparent), linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
							backgroundSize: "auto, 64px 64px, 64px 64px",
						}}
					/>
				)}

				<div className="relative w-full max-w-[1200px] mx-auto z-10 px-6 pb-10">
					{/* ROW 1 — Badges */}
					<div className="flex flex-row items-center gap-2 mb-5 flex-wrap">
						{event.category && (
							<span className="tag-industrial border-accent/40 text-accent bg-accent-dim">
								{event.category}
							</span>
						)}
						<span className="tag-industrial bg-bg-base/80 text-text-secondary">
							{getFormatString()}
						</span>
						{availableSpots === 0 ? (
							<span className="tag-industrial border-error/40 text-error bg-transparent">
								{event.waitlistEnabled !== false && !event.isPaid
									? "Full · Waitlist Open"
									: "Sold Out"}
							</span>
						) : availableSpots !== undefined &&
							availableSpots <= 10 &&
							availableSpots > 0 ? (
							<span className="tag-industrial border-accent text-accent-hover bg-accent-dim">
								Only {availableSpots} spots left
							</span>
						) : null}
					</div>

					{/* ROW 2 — Event title */}
					<h1 className="editorial-headline text-[34px] md:text-[52px] max-w-[800px] mb-5 [text-shadow:0_2px_20px_rgba(0,0,0,0.5)]">
						{event.title}
					</h1>

					{/* ROW 3 — Short description */}
					<p className="text-base text-text-primary/75 max-w-[620px] leading-relaxed mb-6 font-body">
						{event.shortDescription}
					</p>

					{/* ROW 4 — Organizer row */}
					<div className="flex items-center gap-3 flex-wrap">
						<div className="w-9 h-9 flex items-center justify-center overflow-hidden shrink-0 bg-bg-elevated border border-accent/30">
							{event.organizerProfileId?.avatarUrl ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={event.organizerProfileId.avatarUrl}
									alt="Organizer"
									className="w-full h-full object-cover"
								/>
							) : (
								<span className="font-mono text-accent text-sm font-semibold">
									{event.organizerProfileId?.displayName?.substring(0, 1) || "O"}
								</span>
							)}
						</div>
						<div className="flex flex-col">
							<span className="font-mono text-[10px] uppercase tracking-widest text-text-secondary leading-none mb-1">
								Hosted by
							</span>
							<span className="text-sm text-text-primary font-medium leading-none">
								{event.organizerProfileId?.displayName || "DevEvent Organizer"}
							</span>
						</div>

						<span className="text-text-secondary mx-1" aria-hidden="true">·</span>

						{event.organizerProfileId?.userId && (
							<FollowOrganizerButton
								organizerId={event.organizerProfileId.userId.toString()}
							/>
						)}

						<span className="text-text-secondary mx-1" aria-hidden="true">·</span>

						<ShareEventActions
							eventId={event._id.toString()}
							title={event.title}
							canonicalUrl={canonicalUrl}
						/>
					</div>
				</div>
			</section>

			{/* SECTION 2 — MAIN CONTENT + SIDEBAR */}
			<section className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_340px] gap-12 px-6 py-12">
				{/* LEFT — MAIN CONTENT */}
				<div className="min-w-0">
					{/* BLOCK 1 — About This Event */}
					<div className="mb-10">
						<span className="section-label">About This Event</span>
						<div className="mt-4 text-[15px] leading-[1.8] text-text-primary/80 font-body whitespace-pre-wrap">
							{event.description ? (
								event.description
							) : (
								<span className="text-text-secondary italic">
									No additional details provided.
								</span>
							)}
						</div>
					</div>

					<div className="divider-industrial my-10" />

					{/* BLOCK 2 — Organizer Section */}
					{(event.organizerProfileId?.bio || event.organizerProfileId?.website) && (
						<div className="card-industrial p-6 mb-10">
							<span className="section-label">About the Organizer</span>
							<div className="flex gap-4 mt-4">
								<div className="w-14 h-14 overflow-hidden shrink-0 flex items-center justify-center bg-bg-void border border-accent/30">
									{event.organizerProfileId?.avatarUrl ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img
											src={event.organizerProfileId.avatarUrl}
											alt="Logo"
											className="w-full h-full object-cover"
										/>
									) : (
										<span className="font-mono text-accent text-xl">
											{event.organizerProfileId?.displayName?.substring(0, 1) || "O"}
										</span>
									)}
								</div>
								<div className="min-w-0">
									<div className="font-display text-lg font-bold text-text-primary mb-1.5">
										{event.organizerProfileId?.displayName || "DevEvent Organizer"}
									</div>
									{event.organizerProfileId?.bio && (
										<p className="font-body text-sm text-text-secondary leading-[1.7] mb-3">
											{event.organizerProfileId.bio}
										</p>
									)}
									<div className="flex gap-5 flex-wrap">
										{event.organizerProfileId?.website && (
											<a
												href={event.organizerProfileId.website}
												target="_blank"
												rel="noreferrer"
												className="inline-flex items-center gap-1 font-mono text-[12px] uppercase tracking-wider text-accent hover:text-accent-hover transition-colors"
											>
												Visit Website <ArrowUpRight size={12} aria-hidden="true" />
											</a>
										)}
										{event.organizerProfileId?.slug && (
											<Link
												href={`/organizers/${event.organizerProfileId.slug}`}
												className="inline-flex items-center gap-1 font-mono text-[12px] uppercase tracking-wider text-accent hover:text-accent-hover transition-colors"
											>
												View Profile <ArrowUpRight size={12} aria-hidden="true" />
											</Link>
										)}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* BLOCK 3 — Related Events */}
					{relatedEvents.length > 0 && (
						<div>
							<span className="section-label">You Might Also Like</span>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
								{relatedEvents.map((related) => (
									<Link
										href={`/events/${related.slug}`}
										key={related._id.toString()}
										className="group block card-industrial p-4"
									>
										<p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
											{related.category || "Event"}
										</p>
										<h3 className="font-display text-[15px] font-bold text-text-primary line-clamp-2 group-hover:text-accent transition-colors">
											{related.title}
										</h3>
										<span className="block font-mono text-[11px] text-text-secondary mt-2">
											{formatEventDate(related.startAt)}
										</span>
									</Link>
								))}
							</div>
						</div>
					)}
				</div>

				{/* RIGHT — STICKY SIDEBAR */}
				<div className="md:sticky md:top-24 self-start w-full">
					{/* CARD 1 — BOOKING CARD */}
					<div className="bg-bg-elevated border border-border-subtle overflow-hidden mb-4">
						<div className="p-5 border-b border-border-subtle">
							<div className="flex justify-between items-center">
								<span className="section-label">Access</span>
								<span
									className={`font-mono text-[26px] font-semibold ${
										event.isPaid ? "text-text-primary" : "text-teal"
									}`}
								>
									{priceLabel}
								</span>
							</div>

							{availableSpots !== undefined && (
								<div className="mt-3">
									<div className="h-1 bg-border-subtle overflow-hidden">
										<div
											className="h-full bg-accent transition-[width] duration-500"
											style={{ width: `${capacityUsedPct}%` }}
										/>
									</div>
									<div className="mt-2">
										{availableSpots > 10 ? (
											<span className="font-mono text-[11px] uppercase tracking-wider text-text-secondary">
												{availableSpots} spots remaining
											</span>
										) : availableSpots > 0 ? (
											<span className="font-mono text-[11px] uppercase tracking-wider text-accent">
												Only {availableSpots} spots left
											</span>
										) : (
											<span className="font-mono text-[11px] uppercase tracking-wider text-error">
												This event is sold out
											</span>
										)}
									</div>
								</div>
							)}
						</div>

						<div className="p-5">
							{event.isPaid ? (
								<TicketSelector
									eventId={event._id.toString()}
									currency={event.currency || "USD"}
								/>
							) : (
								<BookEvent
									eventId={event._id.toString()}
									isLoggedIn={!!session?.user}
									registrationStatus={registrationStatus}
									isPaid={event.isPaid}
									basePrice={event.basePrice ?? null}
									currency={event.currency || "USD"}
									capacity={event.capacity}
									availableSpots={availableSpots}
									waitlistEnabled={event.waitlistEnabled !== false}
									requiresApproval={event.requiresApproval === true}
									questions={event.registrationQuestions || []}
								/>
							)}

							{!session?.user && !event.isPaid && (
								<p className="font-mono text-[11px] uppercase tracking-wider text-text-secondary text-center mt-3">
									Sign in required to register
								</p>
							)}
						</div>
					</div>

					{/* CARD — GUESTS */}
					{showGuestList && goingCount > 0 && (
						<div className="bg-bg-elevated border border-border-subtle p-5 mb-4">
							<div className="flex justify-between items-center">
								<span className="section-label">Guests</span>
								<span className="font-mono text-[11px] uppercase tracking-wider text-text-secondary">
									{goingCount} going
								</span>
							</div>
							<div className="flex items-center mt-3.5">
								{guestPreviews.map((guest, index) => (
									<div
										key={index}
										className="w-9 h-9 rounded-full border-2 border-bg-elevated overflow-hidden bg-bg-void flex items-center justify-center shrink-0 -ml-2 first:ml-0"
										title={guest.name}
									>
										{guest.avatar ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={guest.avatar}
												alt={guest.name}
												className="w-full h-full object-cover"
											/>
										) : (
											<span className="font-mono text-[11px] text-accent font-semibold">
												{guest.name.charAt(0).toUpperCase()}
											</span>
										)}
									</div>
								))}
								{goingCount > guestPreviews.length && (
									<div className="w-9 h-9 rounded-full border-2 border-bg-elevated bg-bg-void flex items-center justify-center shrink-0 -ml-2">
										<span className="font-mono text-[9px] text-text-secondary">
											+{goingCount - guestPreviews.length}
										</span>
									</div>
								)}
							</div>
							<p className="font-body text-[13px] text-text-secondary mt-3 leading-relaxed">
								{goingCount === 1
									? `${guestPreviews[0]?.name} is going`
									: goingCount === 2
										? `${guestPreviews.map((g) => g.name).slice(0, 2).join(" and ")} are going`
										: `${guestPreviews.map((g) => g.name).slice(0, 2).join(", ")} and ${goingCount - 2} others are going`}
							</p>
						</div>
					)}

					{/* CARD 2 — DATE & TIME */}
					<div className="bg-bg-elevated border border-border-subtle p-5 mb-4">
						<span className="section-label">Date &amp; Time</span>
						<div className="flex gap-3 mt-3.5">
							<div className="w-9 h-9 bg-accent-dim border border-accent/20 flex items-center justify-center shrink-0">
								<CalendarDays size={16} className="text-accent" aria-hidden="true" />
							</div>
							<div className="min-w-0">
								<div className="font-body text-sm text-text-primary font-medium">
									{dateString}
								</div>
								<div className="font-mono text-[13px] text-text-secondary mt-1">
									{event.isAllDay ? "All Day" : `${startTimeString} – ${endTimeString}`}
								</div>
								{event.timezone && (
									<div className="font-mono text-[11px] text-text-secondary mt-0.5 uppercase tracking-wider">
										{event.timezone}
									</div>
								)}
								<div className="mt-3">
									<span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-text-secondary">
										Add to Calendar <Plus size={11} aria-hidden="true" />
									</span>
									<div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
										<a
											href={calendarLinks.google}
											target="_blank"
											rel="noreferrer"
											className="font-mono text-[11px] uppercase tracking-wider text-accent hover:text-accent-hover transition-colors"
										>
											Google
										</a>
										<a
											href={calendarLinks.outlook}
											target="_blank"
											rel="noreferrer"
											className="font-mono text-[11px] uppercase tracking-wider text-accent hover:text-accent-hover transition-colors"
										>
											Outlook
										</a>
										<a
											href={calendarLinks.ics}
											className="font-mono text-[11px] uppercase tracking-wider text-accent hover:text-accent-hover transition-colors"
										>
											Apple / .ics
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* CARD — SERIES DATES */}
					{seriesEvents.length > 0 && (
						<div className="bg-bg-elevated border border-border-subtle p-5 mb-4">
							<span className="section-label">More Dates in This Series</span>
							<div className="flex flex-col gap-2 mt-3.5">
								{seriesEvents.map((occurrence) => (
									<Link
										key={occurrence.slug}
										href={`/events/${occurrence.slug}`}
										className="flex items-center justify-between gap-2 font-mono text-[12px] text-text-secondary hover:text-accent transition-colors"
									>
										<span>{formatEventDate(occurrence.startAt)}</span>
										<ArrowUpRight size={12} aria-hidden="true" />
									</Link>
								))}
							</div>
						</div>
					)}

					{/* CARD 3 — LOCATION */}
					<div className="bg-bg-elevated border border-border-subtle p-5 mb-4">
						<span className="section-label">Location</span>

						{(event.eventType === "offline" || event.eventType === "hybrid") && event.location && (
							<div className="flex gap-3 mt-3.5">
								<div className="w-9 h-9 bg-accent-dim border border-accent/20 flex items-center justify-center shrink-0">
									<MapPin size={16} className="text-accent" aria-hidden="true" />
								</div>
								<div className="min-w-0">
									<div className="text-sm text-text-primary font-medium">
										{event.location.venueName || "Venue"}
									</div>
									{event.location.addressLine1 && (
										<div className="text-[13px] text-text-secondary mt-1">
											{event.location.addressLine1}
										</div>
									)}
									{event.location.addressLine2 && (
										<div className="text-[13px] text-text-secondary">
											{event.location.addressLine2}
										</div>
									)}
									<div className="text-[13px] text-text-secondary">
										{event.location.city}, {event.location.country}
									</div>
									<a
										href={`https://maps.google.com/?q=${encodeURIComponent(`${event.location.addressLine1} ${event.location.city} ${event.location.country}`)}`}
										target="_blank"
										rel="noreferrer"
										className="mt-2.5 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-accent hover:text-accent-hover transition-colors"
									>
										View on Maps <ArrowUpRight size={11} aria-hidden="true" />
									</a>
								</div>
							</div>
						)}

						{event.eventType === "hybrid" && (
							<div className="divider-industrial my-4" />
						)}

						{(event.eventType === "online" || event.eventType === "hybrid") && event.online && (
							<div className="flex gap-3 mt-3.5">
								<div className="w-9 h-9 bg-teal-dim border border-teal/20 flex items-center justify-center shrink-0">
									<Video size={16} className="text-teal" aria-hidden="true" />
								</div>
								<div className="min-w-0">
									<div className="text-sm text-text-primary font-medium">
										{event.online.platform || "Online Streaming"}
									</div>
									<div className="text-[12px] text-text-secondary mt-0.5">
										Link shared with registered attendees
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* SECTION 3 — MOBILE STICKY CTA */}
			<div
				className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border-subtle px-4 pt-3 pb-5"
				style={{
					backgroundColor: "rgba(10,10,11,0.95)",
					backdropFilter: "blur(20px)",
				}}
			>
				<div className="flex justify-between items-center mb-2.5">
					<span className="section-label">Access</span>
					<span
						className={`font-mono text-[20px] font-semibold ${
							event.isPaid ? "text-text-primary" : "text-teal"
						}`}
					>
						{priceLabel}
					</span>
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
						registrationStatus={registrationStatus}
						isPaid={event.isPaid}
						basePrice={event.basePrice ?? null}
						currency={event.currency || "USD"}
						capacity={event.capacity}
						availableSpots={availableSpots}
						waitlistEnabled={event.waitlistEnabled !== false}
						requiresApproval={event.requiresApproval === true}
						questions={event.registrationQuestions || []}
					/>
				)}
			</div>
		</main>
	);
}
