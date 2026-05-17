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

export async function generateMetadata() {
  return {
    title: "DevEvent | India's Developer Event Platform",
    description: "Discover hackathons, meetups, and workshops. Book your spot in seconds. No fluff.",
  };
}

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
