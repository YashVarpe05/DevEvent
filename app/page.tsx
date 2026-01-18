import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database";
import { cacheLife } from "next/cache";

import { getAllEvents } from "@/lib/actions/event.actions";

const page = async () => {
	"use cache";
	cacheLife("hours");

	const { data: events } = await getAllEvents();
	return (
		<section>
			<h1 className="text-center">
				The Hub For Every Dev <br /> Event You Can't Miss
			</h1>
			<p className="text-center mt-5">
				Hackathons, Meetups, and Conferences, All in One Place
			</p>
			<ExploreBtn />
			<data value="mt-20 space-y-7">
				<h3>Featured Events</h3>
				<ul className="events">
					{events &&
						events.length > 0 &&
						events.map((event: IEvent) => (
							<li key={event.title} className="list-none">
								<EventCard {...event} />
							</li>
						))}
				</ul>
			</data>
		</section>
	);
};

export default page;
