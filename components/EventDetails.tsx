import React from 'react'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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
    'use hours'
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

	const event = json.data;

	const {
		description,
		image,
		overview,
		agenda,
		audience,
		date,
		time,
		location,
		mode,
		tags,
		organizer,
	} = event;

	const bookings = 10;

	const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);
	return (
		<section id="event" className="p-6 max-w-7xl mx-auto">
			<div>
				<h1 className="text-3xl font-bold mb-4">Event Details</h1>

				<p>{description}</p>
			</div>
			<div className="details">
				<div className="content">
					<Image
						src={image}
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
							label={date}
						/>
						<EventDetailItem icon="/icons/clock.svg" alt="Clock" label={time} />
						<EventDetailItem
							icon="/icons/location.svg"
							alt="Location"
							label={location}
						/>
						<EventDetailItem icon="/icons/mode.svg" alt="Mode" label={mode} />
						<EventDetailItem
							icon="/icons/audience.svg"
							alt="audience"
							label={audience}
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
						<BookEvent eventId={event._id} slug={event.slug} />
					</div>
				</aside>
			</div>
			<div className="flex w-full flex-col gap-4 pt-20">
				<h2>Similar Events</h2>
				{similarEvents.length > 0 &&
					similarEvents.map((similarEvents: IEvent) => (
						<EventCard {...similarEvents} key={similarEvents.title} />
					))}
			</div>
		</section>
	);

export default EventDetails