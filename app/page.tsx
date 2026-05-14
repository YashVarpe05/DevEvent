import NavbarShell from "@/components/NavbarShell";
import Hero from "./sections/Hero";
import StatsBar from "./sections/StatsBar";
import CommunityMarquee from "./sections/CommunityMarquee";
import EventsDiscovery from "./sections/EventsDiscovery";
import FeaturesBento from "./sections/FeaturesBento";
import SocialProof from "./sections/SocialProof";
import CTABottom from "./sections/CTABottom";
import Footer from "./sections/Footer";
import { auth } from "@/lib/auth";

export async function generateMetadata() {
  return {
    title: "DevEvent | India's Developer Event Platform",
    description: "Discover hackathons, meetups, and workshops. Book your spot in seconds. No fluff.",
  };
}

export default async function Home() {
  // Fetch session server-side to pass to client NavbarShell
  const session = await auth();

  return (
    <main className="bg-bg-base min-h-screen text-text-primary">
      <NavbarShell user={session?.user ? { id: session.user.email || "" } : null} />
      <Hero />
      <StatsBar />
      <CommunityMarquee />
      <EventsDiscovery />
      <FeaturesBento />
      <SocialProof />
      <CTABottom />
      <Footer />
    </main>
  );
}
