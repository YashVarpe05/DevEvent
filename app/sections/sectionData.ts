export const ease = [0.16, 1, 0.3, 1] as const;

export const showcaseCards = [
	{
		date: "OCT 14 - BANGALORE",
		description: "The premier React conference in Asia.",
		image: "/images/event4.png",
		initial: { opacity: 0, rotate: -10, x: 58, y: -38 },
		rest: { opacity: 0.52, rotate: -7, x: 42, y: -34 },
		title: "React India 2024",
	},
	{
		date: "JAN 05 - HYDERABAD",
		description: "Hardware hacking at scale.",
		image: "/images/event2.png",
		initial: { opacity: 0, rotate: 7, x: -18, y: 18 },
		rest: { opacity: 0.82, rotate: 3, x: 0, y: 0 },
		title: "IoT Build Summit",
	},
	{
		date: "NOV 02 - MUMBAI",
		description: "Building the decentralized future.",
		image: "/images/event5.png",
		initial: { opacity: 0, rotate: -5, x: -38, y: 42 },
		rest: { opacity: 1, rotate: -2, x: -32, y: 32 },
		title: "Web3 Buildathon",
	},
] as const;

export const previewEvents = [
	{
		category: "Frontend",
		date: "DEC 12 - DELHI NCR",
		duration: "2 DAYS",
		href: "/events",
		image: "/images/event1.png",
		price: "INR 2499",
		title: "JSConf India 2024",
	},
	{
		category: "Hardware",
		date: "JAN 05 - HYDERABAD",
		duration: "1 DAY",
		href: "/events",
		image: "/images/event2.png",
		price: "FREE",
		title: "IoT Build Summit",
	},
	{
		category: "Backend",
		date: "FEB 18 - PUNE",
		duration: "3 DAYS",
		href: "/events",
		image: "/images/event3.png",
		price: "INR 4999",
		title: "GoLang Assembly",
	},
	{
		category: "AI/ML",
		date: "MAR 08 - BANGALORE",
		duration: "2 DAYS",
		href: "/events",
		image: "/images/event4.png",
		price: "INR 3499",
		title: "TensorFlow Conf",
	},
] as const;

export const communities = [
	"FOSS United",
	"GDG India",
	"React India",
	"AWS UG",
	"Devfolio",
	"MLH",
	"CNCF",
] as const;
