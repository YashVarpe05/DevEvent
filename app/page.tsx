export const dynamic = "force-dynamic";
import Link from "next/link";
import EventCard from "@/components/EventCard";
import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";

import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { CommunitySection } from "@/components/home/CommunitySection";
import { EventsSection } from "@/components/home/EventsSection";
import { BentoSection } from "@/components/home/BentoSection";
import { SocialProofSection } from "@/components/home/SocialProofSection";
import { CTASection } from "@/components/home/CTASection";
import { Footer } from "@/components/home/Footer";
import RevealLoader from "@/components/ui/reveal-loader";

export const metadata: Metadata = {
	title: "DevEvent | India's Developer Event Platform",
	description:
		"Discover tech meetups, hackathons, and workshops across India. Book your spot in seconds.",
};

type HomeEvent = {
	_id: string;
	title: string;
	slug: string;
	thumbnail?: string;
	location?: string;
	eventStartDate: Date;
	eventEndDate: Date;
	category?: string;
	isPaid?: boolean;
	ticketPrice?: number;
	currency?: string;
	organizerProfileId?: { name?: string };
};

export default async function HomePage() {
	await connectDB();
	const session = await auth();

	const events = await Event.find({
		status: "published",
		visibility: "public",
		deletedAt: null,
		eventEndDate: { $gte: new Date() },
	})
		.sort({ eventStartDate: 1 })
		.limit(6)
		.populate("organizerProfileId", "name")
		.lean();

	const mappedEvents = events.map((event: any) => ({
		_id: event._id.toString(),
		title: event.title,
		slug: event.slug,
		thumbnail: event.thumbnail || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=900",
		location: event.location,
		eventStartDate: event.eventStartDate.toISOString(),
		eventEndDate: event.eventEndDate.toISOString(),
		category: event.category,
		isPaid: event.isPaid,
		ticketPrice: event.ticketPrice,
		currency: event.currency,
		organizerProfileId: event.organizerProfileId,
	}));

	return (
		<>
			<RevealLoader />
			<div className="flex flex-col" style={{ marginTop: "-58px" }}>
				<HeroSection />
				<StatsSection />
				<CommunitySection />
				<EventsSection events={mappedEvents} />
				<BentoSection />
				<SocialProofSection />
				<CTASection />
				<Footer />
			</div>
		</>
	);
}
