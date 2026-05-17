import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "./sections/Hero";
import StatsBar from "./sections/StatsBar";
import CommunityMarquee from "./sections/CommunityMarquee";
import EventsDiscovery from "./sections/EventsDiscovery";
import FeaturesBento from "./sections/FeaturesBento";
import SocialProof from "./sections/SocialProof";
import CTABottom from "./sections/CTABottom";
import Footer from "./sections/Footer";
import { getAllEvents } from "@/lib/actions/event.actions";

export const metadata: Metadata = {
  title: "DevEvent — Discover Developer Events in India",
  description: "Find and book the best tech meetups, hackathons, and developer workshops across India. Free to use. Open source.",
  keywords: ["developer events", "hackathon", "tech meetup", "india", "open source"],
  openGraph: {
    title: "DevEvent — Discover Developer Events in India",
    description: "Find and book the best tech meetups, hackathons, and developer workshops across India.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://devevents.dev",
    siteName: "DevEvent",
    type: "website",
    images: [{
      url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://devevents.dev"}/og-image.png`,
      width: 1200,
      height: 630,
      alt: "DevEvent",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevEvent — Discover Developer Events in India",
    description: "Find and book the best tech meetups, hackathons, and developer workshops.",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL || "https://devevents.dev"}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function Home() {
  const result = await getAllEvents();
  const events = result?.data || [];

  return (
    <main className="bg-bg-base min-h-screen text-text-primary">
      <Navbar />
      <Hero />
      <StatsBar />
      <CommunityMarquee />
      <EventsDiscovery events={events} />
      <FeaturesBento />
      <SocialProof />
      <CTABottom />
      <Footer />
    </main>
  );
}
