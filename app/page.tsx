import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { events } from "@/lib/constants";

const page = () => {
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
					{events.map((event) => (
						<li key={event.title}>
							<EventCard {...event} />
						</li>
					))}
				</ul>
			</data>
		</section>
	);
};

export default page;
