export const dynamic = "force-dynamic";
import Link from "next/link";
import EventCard from "@/components/EventCard";
import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsBar } from "@/components/home/StatsBar";
import { EventsSection } from "@/components/home/EventsSection";
import { WhySection } from "@/components/home/WhySection";
import { CTASection } from "@/components/home/CTASection";
import { Footer } from "@/components/home/Footer";

export const metadata: Metadata = {
	title: "DevEvent | India's Developer Event Platform",
	description:
		"Discover tech meetups, hackathons, and workshops across India. Book your spot in seconds.",
};

type HomeEvent = {
	_id: string;
	title: string;
	slug: string;
	coverImageUrl?: string;
	location?: { city?: string };
	startAt: Date;
	eventType: "online" | "offline" | "hybrid";
	category?: string;
	isPaid?: boolean;
	basePrice?: number;
	currency?: string;
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
			event.eventType === "online"
				? "Online"
				: event.location?.city || "TBA",
		date: date
			.toLocaleDateString("en-US", {
				weekday: "short",
				day: "numeric",
				month: "short",
			})
			.toUpperCase(),
		time: date.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
		}),
		category: event.category,
		isPaid: event.isPaid || false,
		price: event.basePrice,
		currency: event.currency || "INR",
	};
};

export default async function HomePage() {
	await connectDB();
	const session = await auth();

	const events = await Event.find({
		status: "published",
		visibility: "public",
		deletedAt: null,
		endAt: { $gte: new Date() },
	})
		.sort({ startAt: 1 })
		.limit(6)
		.lean();

	const cards = events.map((event: any) =>
		mapToCard({
			_id: event._id.toString(),
			title: event.title,
			slug: event.slug,
			coverImageUrl: event.coverImageUrl,
			location: event.location,
			startAt: event.startAt,
			eventType: event.eventType,
			category: event.category,
			isPaid: event.isPaid,
			basePrice: event.basePrice,
			currency: event.currency,
		}),
	);

	return (
		<div className="flex flex-col" style={{ marginTop: "-56px" }}>
			<HeroSection />
			<StatsBar />
			<EventsSection cards={cards} />
			<WhySection />
			<CTASection />
			<Footer />
		</div>
	);
}
