"use client";

import type { CSSProperties } from "react";
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import StatsBar from "./sections/StatsBar";
import CommunityMarquee from "./sections/CommunityMarquee";
import EventsDiscovery from "./sections/EventsDiscovery";
import FeaturesBento from "./sections/FeaturesBento";
import SocialProof from "./sections/SocialProof";
import CTABottom from "./sections/CTABottom";
import Footer from "./sections/Footer";

const homeTheme = {
	"--home-bg": "#0A0A0B",
	"--home-bg-deep": "#0A0A0B",
	"--home-surface": "#111113",
	"--home-surface-low": "#1A1B22",
	"--home-border": "#1F1F23",
	"--home-border-bright": "#383941",
	"--home-text": "#E8E6E3",
	"--home-text-soft": "#E8E6E3",
	"--home-muted": "#6B6B74",
	"--home-copy": "#A7A1A0",
	"--home-primary": "#FF6B35",
	"--home-primary-hover": "#FFB59D",
	"--home-on-primary": "#0A0A0B",
	"--home-secondary": "#00D4AA",
	"--home-on-secondary": "#00382B",
} as CSSProperties;

export default function HomePage() {
	return (
		<div
			style={homeTheme}
			className="min-h-screen bg-[#0A0A0B] text-[#E8E6E3]"
		>
			<Navbar />
			<main>
				<Hero />
				<StatsBar />
				<CommunityMarquee />
				<EventsDiscovery />
				<FeaturesBento />
				<SocialProof />
				<CTABottom />
			</main>
			<Footer />
		</div>
	);
}
