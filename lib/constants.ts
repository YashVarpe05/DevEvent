export type EventItem = {
	image: string;
	title: string;
	slug: string;
	location: string;
	date: string;
	time: string;
};

export const events = [
	{
		title: "SaaStr Annual 2026",
		image: "/images/event1.png",
		slug: "saastr-annual-2026",
		location: "San Francisco Bay Area, CA",
		date: "Sep 09, 2026",
		time: "09:00 AM",
	},
	{
		title: "TechCrunch Disrupt 2026",
		image: "/images/event2.png",
		slug: "techcrunch-disrupt-2026",
		location: "San Francisco, CA",
		date: "Oct 18, 2026",
		time: "10:00 AM",
	},
	{
		title: "Web Summit 2026",
		image: "/images/event3.png",
		slug: "web-summit-2026",
		location: "Lisbon, Portugal",
		date: "Nov 02, 2026",
		time: "09:30 AM",
	},
	{
		title: "CES 2027",
		image: "/images/event4.png",
		slug: "ces-2027",
		location: "Las Vegas, NV",
		date: "Jan 05, 2027",
		time: "08:00 AM",
	},
	{
		title: "DeveloperWeek 2027",
		image: "/images/event5.png",
		slug: "developerweek-2027",
		location: "San Francisco Bay Area, CA",
		date: "Feb 17, 2027",
		time: "09:00 AM",
	},
	{
		title: "SXSW 2027",
		image: "/images/event6.png",
		slug: "sxsw-2027",
		location: "Austin, TX",
		date: "Mar 12, 2027",
		time: "10:00 AM",
	},
];
