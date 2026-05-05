export const dynamic = 'force-dynamic';
import Link from "next/link";
import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { getRecommendedEvents } from "@/lib/discovery/recommendations";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "DevEvent | The Hub For Every Dev Event",
	description: "Hackathons, Meetups, and Conferences, All in One Place. Discover and organize top developer events.",
};

type HomeEvent = {
	_id: string;
	title: string;
	slug: string;
	coverImageUrl?: string;
	location?: { city?: string };
	startAt: Date;
	eventType: "online" | "offline" | "hybrid";
};

const mapToCard = (event: HomeEvent) => {
	const date = new Date(event.startAt);
	return {
		title: event.title,
		image:
			event.coverImageUrl ||
			"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=900",
		slug: event.slug,
		location:
			event.eventType === "online" ? "Online" : event.location?.city || "TBA",
		date: date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}),
		time: date.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
		}),
	};
};

const HomePage = async () => {
	await connectDB();
	const session = await auth();

	const [trending, upcoming, free, online] = await Promise.all([
		Event.find({
			status: "published",
			visibility: "public",
			deletedAt: null,
			endAt: { $gte: new Date() },
		})
			.sort({ trendingScore: -1, startAt: 1 })
			.limit(6)
			.lean(),
		Event.find({
			status: "published",
			visibility: "public",
			deletedAt: null,
			endAt: { $gte: new Date() },
		})
			.sort({ startAt: 1 })
			.limit(6)
			.lean(),
		Event.find({
			status: "published",
			visibility: "public",
			deletedAt: null,
			isPaid: false,
			endAt: { $gte: new Date() },
		})
			.sort({ startAt: 1 })
			.limit(6)
			.lean(),
		Event.find({
			status: "published",
			visibility: "public",
			deletedAt: null,
			eventType: "online",
			endAt: { $gte: new Date() },
		})
			.sort({ startAt: 1 })
			.limit(6)
			.lean(),
	]);

	const personalized = await getRecommendedEvents({
		userId: session?.user?.id,
		limit: 6,
	});

	const sections = [
		{ title: "Trending now", events: trending },
		{ title: "Upcoming soon", events: upcoming },
		{ title: "For you", events: personalized },
		{ title: "Free events", events: free },
		{ title: "Online events", events: online },
	];

	return (
		<section className="space-y-12">
			<div className="text-center">
				<h1 className="text-center">
					The Hub For Every Dev <br /> Event You Can&apos;t Miss
				</h1>
				<p className="mt-5 text-center">
					Hackathons, Meetups, and Conferences, All in One Place
				</p>
				<div className="mt-4 flex items-center justify-center gap-3">
					<ExploreBtn />
					<Link
						href="/events"
						className="rounded-full border border-zinc-700 px-5 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-900"
					>
						Open discovery
					</Link>
				</div>
			</div>

			{sections.map((section) => (
				<div key={section.title} className="space-y-4">
					<div className="flex items-center justify-between">
						<h3>{section.title}</h3>
						<Link
							href="/events"
							className="text-sm text-primary hover:underline"
						>
							View all
						</Link>
					</div>
					<ul className="events">
						{section.events.map((event: any) => {
							const card = mapToCard({
								_id: event._id.toString(),
								title: event.title,
								slug: event.slug,
								coverImageUrl: event.coverImageUrl,
								location: event.location,
								startAt: event.startAt,
								eventType: event.eventType,
							});

							return (
								<li key={event._id.toString()} className="list-none">
									<EventCard {...card} />
								</li>
							);
						})}
					</ul>
				</div>
			))}
		</section>
	);
};

export default HomePage;
