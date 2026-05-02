import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { cacheLife } from 'next/cache';
import BookEvent from './BookEvent';
import EventCard from './EventCard';
import { getSimilarEventsBySlug } from '@/lib/actions/event.actions';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type EventDetailsApiEvent = {
	_id: string;
	slug: string;
	description?: string;
	image?: string;
	coverImageUrl?: string;
	overview?: string;
	agenda?: string[];
	audience?: string;
	date?: string;
	time?: string;
	location?: string;
	mode?: string;
	tags?: string[];
	organizer?: string;
	isPaid?: boolean;
	basePrice?: number | null;
	currency?: string;
	capacity?: number;
};

type SimilarEventCardSource = {
	_id: string | { toString(): string };
	title: string;
	slug: string;
	coverImageUrl?: string;
	image?: string;
	location?: string | { city?: string };
	startAt?: Date | string;
	date?: string;
	time?: string;
	eventType?: "online" | "offline" | "hybrid";
};

function toEventCardProps(event: SimilarEventCardSource) {
	const startAt = event.startAt ? new Date(event.startAt) : null;
	const location =
		typeof event.location === "string"
			? event.location
			: event.eventType === "online"
				? "Online"
				: event.location?.city || "TBA";

	return {
		title: event.title,
		image:
			event.coverImageUrl ||
			event.image ||
			"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=900",
		slug: event.slug,
		location,
		date:
			event.date ||
			(startAt
				? startAt.toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric",
					})
				: "TBA"),
		time:
			event.time ||
			(startAt
				? startAt.toLocaleTimeString("en-US", {
						hour: "numeric",
						minute: "2-digit",
					})
				: "TBA"),
	};
}

const EventDetailItem = ({
    icon,
    alt,
    label,
}: {
    icon: string;
    alt: string;
    label: string;
}) => (
    <div className="flex-row items-center gap-2">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((items) => (
                <li key={items}>{items}</li>
            ))}
        </ul>
    </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map((tag) => (
            <div className="pill" key={tag}>
                {tag}
            </div>
        ))}
    </div>
);
const EventDetails = async ({ params }: { params: Promise<{ slug: string }> }) => {
    'use cache';
    cacheLife('hours');
    const { slug } = await params;
	// let event;

	if (!slug) return notFound();

	const res = await fetch(`${BASE_URL}/api/events/${slug}`, {
		cache: "no-store",
	});

	if (!res.ok) return notFound();

	const json = await res.json();

	// ✅ API returns { success, data }
	if (!json?.data) return notFound();

	const event = json.data as EventDetailsApiEvent;

	const {
		description,
		image,
		coverImageUrl,
		overview,
		agenda = [],
		audience,
		date,
		time,
		location,
		mode,
		tags = [],
		organizer,
	} = event;

	const bookings = 10;

	const similarEvents = (await getSimilarEventsBySlug(
		slug,
	)) as unknown as SimilarEventCardSource[];
	return (
		<section id="event" className="p-6 max-w-7xl mx-auto">
			<div>
				<h1 className="text-3xl font-bold mb-4">Event Details</h1>

				<p>{description}</p>
			</div>
			<div className="details">
				<div className="content">
					<Image
						src={
							image ||
							coverImageUrl ||
							"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=900"
						}
						width={800}
						height={800}
						alt="Event Banner"
						className="banner"
					/>
					<section className="flex-col-gap-2">
						<h2>Overview</h2>
						<p>{overview}</p>
					</section>
					<section className="flex-col-gap-2">
						<h2>Event Details</h2>

						<EventDetailItem
							icon="/icons/calendar.svg"
							alt="Calendar"
							label={date || "TBA"}
						/>
						<EventDetailItem icon="/icons/clock.svg" alt="Clock" label={time || "TBA"} />
						<EventDetailItem
							icon="/icons/location.svg"
							alt="Location"
							label={location || "TBA"}
						/>
						<EventDetailItem icon="/icons/mode.svg" alt="Mode" label={mode || "TBA"} />
						<EventDetailItem
							icon="/icons/audience.svg"
							alt="audience"
							label={audience || "Developers"}
						/>
					</section>
					<EventAgenda agendaItems={agenda} />
					<section className="flex-col-gap-2">
						<h2>About the Organizer</h2>
						<p>{organizer}</p>
					</section>
					<EventTags tags={tags} />
				</div>

				<aside className="booking">
					<div className="signup-card">
						<h2>Book Your Spot</h2>
						{bookings > 0 ? (
							<p className="text-sm">
								Join {bookings} people who have already booked their spot!
							</p>
						) : (
							<p className="text-sm">be the first to book your spot!</p>
						)}
						{/* [FIXED]: Pass the current BookEvent props instead of the removed slug prop. */}
						<BookEvent
							eventId={event._id}
							isLoggedIn={false}
							isRegistered={false}
							isPaid={event.isPaid || false}
							basePrice={event.basePrice ?? null}
							currency={event.currency || "USD"}
							capacity={event.capacity}
						/>
					</div>
				</aside>
			</div>
			<div className="flex w-full flex-col gap-4 pt-20">
				<h2>Similar Events</h2>
				{similarEvents.length > 0 &&
					similarEvents.map((similarEvent) => (
						<EventCard
							{...toEventCardProps(similarEvent)}
							key={similarEvent._id.toString()}
						/>
					))}
			</div>
		</section>
	);
};

export default EventDetails;
