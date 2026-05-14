export const dynamic = 'force-dynamic';
import Link from "next/link";
import { notFound } from "next/navigation";
import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Registration from "@/database/registration.model";
import "@/database/organizer-profile.model"; // Added to register the schema for populate
import BookEvent from "@/components/BookEvent";
import TicketSelector from "@/components/events/TicketSelector";
import { CalendarDays, MapPin, Video, ExternalLink, Globe } from "lucide-react";
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
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://devevents.dev";
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
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://devevents.dev";
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
		<main className="min-h-screen pb-20" style={{ backgroundColor: "var(--bg-base)" }}>
			<ReferralTracker eventId={event._id.toString()} />
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(eventStructuredData),
				}}
			/>

			{/* SECTION 1 — HERO */}
			<section
				className="w-full relative overflow-hidden flex flex-col justify-end min-h-[280px] md:min-h-[420px]"
			>
				{event.coverImageUrl ? (
					<>
						<img
							src={event.coverImageUrl}
							alt={event.title}
							className="absolute inset-0 w-full h-full object-cover"
						/>
						<div
							className="absolute inset-0"
							style={{
								background:
									"linear-gradient(to bottom, rgba(5,5,7,0.3) 0%, rgba(5,5,7,0.6) 50%, rgba(5,5,7,0.95) 100%)",
							}}
						/>
					</>
				) : (
					<div
						className="absolute inset-0"
						style={{
							backgroundColor: "var(--bg-void)",
							backgroundImage:
								"radial-gradient(ellipse 60% 50% at 50% 100%, rgba(201,168,76,0.04), transparent)",
						}}
					/>
				)}

				<div
					className="relative w-full max-w-[1200px] mx-auto z-10"
					style={{ padding: "0 24px 40px 24px" }}
				>
					{/* ROW 1 — Badges */}
					<div className="flex flex-row items-center gap-2 mb-4 flex-wrap">
						{event.category && (
							<span
								style={{
									padding: "3px 10px",
									fontSize: "11px",
									fontWeight: 500,
									letterSpacing: "0.08em",
									textTransform: "uppercase",
									border: "1px solid rgba(201,168,76,0.3)",
									borderRadius: "var(--radius-xs, 4px)",
									color: "var(--gold)",
									backgroundColor: "var(--gold-subtle)",
								}}
							>
								{event.category}
							</span>
						)}
						<span
							style={{
								padding: "3px 10px",
								fontSize: "11px",
								fontWeight: 500,
								letterSpacing: "0.08em",
								textTransform: "uppercase",
								border: "1px solid var(--border-bright)",
								borderRadius: "var(--radius-xs, 4px)",
								color: "var(--text-secondary)",
								backgroundColor: "rgba(18,18,20,0.8)",
							}}
						>
							{getFormatString()}
						</span>

						{availableSpots === 0 ? (
							<span
								style={{
									padding: "3px 10px",
									fontSize: "11px",
									fontWeight: 500,
									letterSpacing: "0.08em",
									textTransform: "uppercase",
									border: "1px solid rgba(239,68,68,0.3)",
									borderRadius: "var(--radius-xs, 4px)",
									color: "#EF4444",
									backgroundColor: "rgba(239,68,68,0.1)",
								}}
							>
								Sold Out
							</span>
						) : availableSpots !== undefined && availableSpots <= 10 && availableSpots > 0 ? (
							<span
								style={{
									padding: "3px 10px",
									fontSize: "11px",
									fontWeight: 500,
									letterSpacing: "0.08em",
									textTransform: "uppercase",
									border: "1px solid rgba(201,168,76,0.5)",
									borderRadius: "var(--radius-xs, 4px)",
									color: "var(--gold-bright)",
									backgroundColor: "var(--gold-subtle)",
								}}
							>
								Only {availableSpots} spots left
							</span>
						) : null}
					</div>

					{/* ROW 2 — Event title */}
					<h1
						style={{
							fontFamily: "var(--font-display)",
							fontSize: "clamp(28px, 4vw, 52px)",
							fontWeight: 700,
							lineHeight: 1.05,
							letterSpacing: "-0.025em",
							color: "var(--text-primary)",
							maxWidth: "760px",
							marginBottom: "16px",
							textShadow: "0 2px 20px rgba(0,0,0,0.5)",
						}}
					>
						{event.title}
					</h1>

					{/* ROW 3 — Short description */}
					<p
						style={{
							fontSize: "16px",
							color: "rgba(237,234,225,0.75)",
							maxWidth: "600px",
							lineHeight: 1.6,
							marginBottom: "20px",
							fontFamily: "var(--font-body)",
						}}
					>
						{event.shortDescription}
					</p>

					{/* ROW 4 — Organizer row */}
					<div className="flex items-center gap-3 flex-wrap">
						<div
							className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden shrink-0"
							style={{
								backgroundColor: "var(--gold-subtle)",
								border: "1px solid rgba(201,168,76,0.2)",
							}}
						>
							{event.organizerProfileId?.logoUrl ? (
								<img
									src={event.organizerProfileId.logoUrl}
									alt="Organizer"
									className="w-full h-full object-cover"
								/>
							) : (
								<span
									style={{
										fontFamily: "var(--font-mono)",
										color: "var(--gold)",
										fontSize: "14px",
										fontWeight: 600,
									}}
								>
									{event.organizerProfileId?.organizationName?.substring(0, 1) || "O"}
								</span>
							)}
						</div>
						<div className="flex flex-col">
							<span
								style={{
									fontSize: "11px",
									color: "var(--text-muted)",
									textTransform: "uppercase",
									letterSpacing: "0.05em",
									lineHeight: 1,
									marginBottom: "2px",
								}}
							>
								Hosted by
							</span>
							<span
								style={{
									fontSize: "14px",
									color: "var(--text-primary)",
									fontWeight: 500,
									lineHeight: 1,
								}}
							>
								{event.organizerProfileId?.organizationName || "DevEvent Organizer"}
							</span>
						</div>

						<span style={{ color: "var(--text-muted)", margin: "0 4px" }}>·</span>

						{event.organizerProfileId?.userId && (
							<FollowOrganizerButton
								organizerId={event.organizerProfileId.userId.toString()}
							/>
						)}

						<span style={{ color: "var(--text-muted)", margin: "0 4px" }}>·</span>

						<ShareEventActions
							eventId={event._id.toString()}
							title={event.title}
							canonicalUrl={canonicalUrl}
						/>
					</div>
				</div>
			</section>

			{/* SECTION 2 — MAIN CONTENT + SIDEBAR */}
			<section
				className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_340px] gap-12"
				style={{ padding: "48px 24px" }}
			>
				{/* LEFT — MAIN CONTENT */}
				<div>
					{/* BLOCK 1 — About This Event */}
					<div className="mb-10">
						<span
							style={{
								fontSize: "11px",
								fontWeight: 500,
								letterSpacing: "0.08em",
								textTransform: "uppercase",
								color: "var(--gold)",
							}}
						>
							About This Event
						</span>
						<div
							style={{
								fontSize: "15px",
								lineHeight: 1.8,
								color: "var(--text-secondary)",
								fontFamily: "var(--font-body)",
								whiteSpace: "pre-wrap",
								marginTop: "16px",
							}}
						>
							{event.description ? (
								event.description
							) : (
								<span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
									No additional details provided.
								</span>
							)}
						</div>
					</div>

					<div style={{ borderBottom: "1px solid var(--border-dim)", margin: "40px 0" }} />

					{/* BLOCK 2 — Organizer Section */}
					{(event.organizerProfileId?.bio || event.organizerProfileId?.websiteUrl) && (
						<div
							style={{
								backgroundColor: "var(--bg-surface)",
								border: "1px solid var(--border-dim)",
								borderRadius: "var(--radius-lg, 12px)",
								padding: "24px",
								marginBottom: "40px",
							}}
						>
							<span
								style={{
									fontSize: "11px",
									fontWeight: 500,
									letterSpacing: "0.08em",
									textTransform: "uppercase",
									color: "var(--gold)",
								}}
							>
								About the Organizer
							</span>
							<div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
								<div
									style={{
										width: "56px",
										height: "56px",
										borderRadius: "50%",
										overflow: "hidden",
										flexShrink: 0,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										backgroundColor: "var(--gold-subtle)",
										border: "1px solid var(--border-gold, rgba(201,168,76,0.3))",
									}}
								>
									{event.organizerProfileId?.logoUrl ? (
										<img
											src={event.organizerProfileId.logoUrl}
											alt="Logo"
											className="w-full h-full object-cover"
										/>
									) : (
										<span
											style={{
												fontFamily: "var(--font-mono)",
												color: "var(--gold)",
												fontSize: "20px",
											}}
										>
											{event.organizerProfileId?.organizationName?.substring(0, 1) || "O"}
										</span>
									)}
								</div>
								<div>
									<div
										style={{
											fontFamily: "var(--font-display)",
											fontSize: "18px",
											fontWeight: 600,
											color: "var(--text-primary)",
											marginBottom: "6px",
										}}
									>
										{event.organizerProfileId?.organizationName || "DevEvent Organizer"}
									</div>
									{event.organizerProfileId?.bio && (
										<div
											style={{
												fontFamily: "var(--font-body)",
												fontSize: "14px",
												color: "var(--text-secondary)",
												lineHeight: 1.7,
												marginBottom: "12px",
											}}
										>
											{event.organizerProfileId.bio}
										</div>
									)}
									<div style={{ display: "flex", gap: "16px" }}>
										{event.organizerProfileId?.websiteUrl && (
											<a
												href={event.organizerProfileId.websiteUrl}
												target="_blank"
												rel="noreferrer"
												style={{
													fontSize: "13px",
													color: "var(--gold)",
													display: "inline-flex",
													alignItems: "center",
													gap: "4px",
													textDecoration: "none",
												}}
												className="hover:text-[var(--gold-bright)] transition-colors"
											>
												Visit Website ↗
											</a>
										)}
										{event.organizerProfileId?.slug && (
											<Link
												href={`/organizers/${event.organizerProfileId.slug}`}
												style={{
													fontSize: "13px",
													color: "var(--gold)",
													display: "inline-flex",
													alignItems: "center",
													gap: "4px",
													textDecoration: "none",
												}}
												className="hover:text-[var(--gold-bright)] transition-colors"
											>
												View Profile →
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
							<span
								style={{
									fontSize: "11px",
									fontWeight: 500,
									letterSpacing: "0.08em",
									textTransform: "uppercase",
									color: "var(--gold)",
								}}
							>
								You Might Also Like
							</span>
							<div
								className="grid grid-cols-1 md:grid-cols-2 gap-3"
								style={{ marginTop: "16px" }}
							>
								{relatedEvents.map((related) => (
									<Link
										href={`/events/${related.slug}`}
										key={related._id.toString()}
										className="group transition-all duration-200 block"
										style={{
											backgroundColor: "var(--bg-surface)",
											border: "1px solid var(--border-dim)",
											borderRadius: "var(--radius-lg, 12px)",
											padding: "16px",
										}}
									>
										<p
											style={{
												fontSize: "11px",
												color: "var(--gold)",
												textTransform: "uppercase",
												letterSpacing: "0.08em",
												marginBottom: "6px",
											}}
										>
											{related.category || "Event"}
										</p>
										<h3
											className="line-clamp-2"
											style={{
												fontFamily: "var(--font-display)",
												fontSize: "15px",
												fontWeight: 600,
												color: "var(--text-primary)",
											}}
										>
											{related.title}
										</h3>
										<span style={{
											fontFamily: "var(--font-mono)",
											fontSize: "11px",
											color: "var(--text-muted)",
											marginTop: "6px",
											display: "block",
										}}>
											{formatEventDate(related.startAt)}
										</span>
									</Link>
								))}
							</div>
						</div>
					)}
				</div>

				{/* RIGHT — STICKY SIDEBAR */}
				<div style={{ position: "sticky", top: "80px", alignSelf: "flex-start" }}>
					{/* CARD 1 — BOOKING CARD */}
					<div
						style={{
							backgroundColor: "var(--bg-surface)",
							border: "1px solid var(--border-dim)",
							borderRadius: "var(--radius-lg, 12px)",
							overflow: "hidden",
							marginBottom: "16px",
						}}
					>
						<div
							style={{
								padding: "20px",
								borderBottom: "1px solid var(--border-dim)",
							}}
						>
							<div className="flex justify-between items-center">
								<span
									style={{
										fontSize: "11px",
										fontWeight: 500,
										letterSpacing: "0.08em",
										textTransform: "uppercase",
										color: "var(--gold)",
									}}
								>
									Access
								</span>
								<span
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: "28px",
										fontWeight: 600,
										color: event.isPaid ? "var(--text-primary)" : "var(--gold)",
									}}
								>
									{event.isPaid
										? `${getCurrencySymbol(event.currency || "USD")}${event.basePrice}`
										: "Free"}
								</span>
							</div>

							{availableSpots !== undefined && (
								<div style={{ marginTop: "12px" }}>
									<div
										style={{
											height: "4px",
											backgroundColor: "var(--border-dim)",
											borderRadius: "2px",
											overflow: "hidden",
										}}
									>
										<div
											style={{
												height: "100%",
												backgroundColor: "var(--gold)",
												width: `${Math.min(
													100,
													((event.capacity! - availableSpots) / event.capacity!) * 100
												)}%`,
												transition: "width 600ms ease",
											}}
										/>
									</div>
									<div style={{ marginTop: "6px" }}>
										{availableSpots > 10 ? (
											<span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
												{availableSpots} spots remaining
											</span>
										) : availableSpots > 0 ? (
											<span style={{ color: "var(--gold)", fontSize: "12px" }}>
												Only {availableSpots} spots left!
											</span>
										) : (
											<span style={{ color: "#EF4444", fontSize: "12px" }}>
												This event is sold out
											</span>
										)}
									</div>
								</div>
							)}
						</div>

						<div style={{ padding: "20px" }}>
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
								<p
									style={{
										fontSize: "12px",
										color: "var(--text-muted)",
										textAlign: "center",
										marginTop: "12px",
									}}
								>
									Sign in required to register.
								</p>
							)}
						</div>
					</div>

					{/* CARD 2 — DATE & TIME */}
					<div
						style={{
							backgroundColor: "var(--bg-surface)",
							border: "1px solid var(--border-dim)",
							borderRadius: "var(--radius-lg, 12px)",
							padding: "20px",
							marginBottom: "16px",
						}}
					>
						<span
							style={{
								fontSize: "11px",
								fontWeight: 500,
								letterSpacing: "0.08em",
								textTransform: "uppercase",
								color: "var(--gold)",
							}}
						>
							Date & Time
						</span>
						<div style={{ display: "flex", gap: "12px", marginTop: "14px" }}>
							<div
								style={{
									width: "36px",
									height: "36px",
									backgroundColor: "var(--gold-subtle)",
									border: "1px solid rgba(201,168,76,0.15)",
									borderRadius: "var(--radius-sm, 6px)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
								}}
							>
								<CalendarDays size={16} color="var(--gold)" />
							</div>
							<div>
								<div
									style={{
										fontFamily: "var(--font-body)",
										fontSize: "14px",
										color: "var(--text-primary)",
										fontWeight: 500,
									}}
								>
									{dateString}
								</div>
								<div
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: "13px",
										color: "var(--text-muted)",
										marginTop: "3px",
									}}
								>
									{event.isAllDay ? "All Day" : `${startTimeString} to ${endTimeString}`}
								</div>
								<div
									style={{
										fontFamily: "var(--font-body)",
										fontSize: "12px",
										color: "var(--text-muted)",
										marginTop: "2px",
									}}
								>
									{event.timezone}
								</div>
								<a
									href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${new Date(event.startAt).toISOString().replace(/-|:|\.\d\d\d/g, "")}/${new Date(event.endAt).toISOString().replace(/-|:|\.\d\d\d/g, "")}&details=${encodeURIComponent(event.shortDescription)}`}
									target="_blank"
									rel="noreferrer"
									style={{
										marginTop: "12px",
										fontSize: "12px",
										color: "var(--gold)",
										display: "flex",
										alignItems: "center",
										gap: "4px",
										textDecoration: "none",
									}}
								>
									Add to Calendar +
								</a>
							</div>
						</div>
					</div>

					{/* CARD 3 — LOCATION */}
					<div
						style={{
							backgroundColor: "var(--bg-surface)",
							border: "1px solid var(--border-dim)",
							borderRadius: "var(--radius-lg, 12px)",
							padding: "20px",
							marginBottom: "16px",
						}}
					>
						<span
							style={{
								fontSize: "11px",
								fontWeight: 500,
								letterSpacing: "0.08em",
								textTransform: "uppercase",
								color: "var(--gold)",
							}}
						>
							Location
						</span>

						{(event.eventType === "offline" || event.eventType === "hybrid") && event.location && (
							<div style={{ display: "flex", gap: "12px", marginTop: "14px" }}>
								<div
									style={{
										width: "36px",
										height: "36px",
										backgroundColor: "var(--gold-subtle)",
										border: "1px solid rgba(201,168,76,0.15)",
										borderRadius: "var(--radius-sm, 6px)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										flexShrink: 0,
									}}
								>
									<MapPin size={16} color="var(--gold)" />
								</div>
								<div>
									<div
										style={{
											fontSize: "14px",
											color: "var(--text-primary)",
											fontWeight: 500,
										}}
									>
										{event.location.venueName || "Venue"}
									</div>
									<div
										style={{
											fontSize: "13px",
											color: "var(--text-secondary)",
											marginTop: "3px",
										}}
									>
										{event.location.addressLine1}
									</div>
									{event.location.addressLine2 && (
										<div
											style={{
												fontSize: "13px",
												color: "var(--text-secondary)",
											}}
										>
											{event.location.addressLine2}
										</div>
									)}
									<div
										style={{
											fontSize: "13px",
											color: "var(--text-muted)",
										}}
									>
										{event.location.city}, {event.location.country}
									</div>
									<a
										href={`https://maps.google.com/?q=${encodeURIComponent(`${event.location.addressLine1} ${event.location.city} ${event.location.country}`)}`}
										target="_blank"
										rel="noreferrer"
										style={{
											marginTop: "10px",
											fontSize: "12px",
											color: "var(--gold)",
											display: "inline-block",
											textDecoration: "none",
										}}
										className="hover:underline"
									>
										View on Maps →
									</a>
								</div>
							</div>
						)}

						{event.eventType === "hybrid" && (
							<div
								style={{
									borderTop: "1px solid var(--border-dim)",
									margin: "16px 0",
								}}
							/>
						)}

						{(event.eventType === "online" || event.eventType === "hybrid") && event.online && (
							<div style={{ display: "flex", gap: "12px", marginTop: "14px" }}>
								<div
									style={{
										width: "36px",
										height: "36px",
										backgroundColor: "var(--gold-subtle)",
										border: "1px solid rgba(201,168,76,0.15)",
										borderRadius: "var(--radius-sm, 6px)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										flexShrink: 0,
									}}
								>
									<Video size={16} color="var(--gold)" />
								</div>
								<div>
									<div
										style={{
											fontSize: "14px",
											color: "var(--text-primary)",
										}}
									>
										{event.online.platform || "Online Streaming"}
									</div>
									<div
										style={{
											fontSize: "12px",
											color: "var(--text-muted)",
											fontStyle: "italic",
										}}
									>
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
				className="md:hidden block"
				style={{
					position: "fixed",
					bottom: 0,
					left: 0,
					right: 0,
					zIndex: 50,
					backgroundColor: "rgba(8,8,9,0.95)",
					backdropFilter: "blur(20px)",
					borderTop: "1px solid var(--border-dim)",
					padding: "12px 16px 20px",
				}}
			>
				<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
					<span
						style={{
							fontSize: "11px",
							fontWeight: 500,
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							color: "var(--gold)",
						}}
					>
						Access
					</span>
					<span
						style={{
							fontFamily: "var(--font-mono)",
							fontSize: "20px",
							fontWeight: 600,
							color: event.isPaid ? "var(--text-primary)" : "var(--gold)",
						}}
					>
						{event.isPaid
							? `${getCurrencySymbol(event.currency || "USD")}${event.basePrice}`
							: "Free"}
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
