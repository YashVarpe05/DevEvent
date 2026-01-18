import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";
import LightRays from "@/components/LightRays";

import { PostHogProvider } from "./providers";

const schibstedGrotesk = Schibsted_Grotesk({
	variable: "--font-schibsted-grotesk",
	subsets: ["latin"],
});

const martianMono = Martian_Mono({
	variable: "--font-martian-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "DevEvent",
	description: "The Hub for Evey Dev Event You Mustn't Miss",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<PostHogProvider>
				<body
					suppressHydrationWarning
					className={`${schibstedGrotesk.variable} ${martianMono.variable} min-h-screen antialiased`}
				>
					<div className="absolute inset-0 top-0 z-[-1] min-h-screen">
						<LightRays
							raysOrigin="top-center-offset"
							raysColor="#5dfeca"
							raysSpeed={0.8}
							lightSpread={0.95}
							rayLength={2}
							followMouse={true}
							mouseInfluence={0.04}
							noiseAmount={0.0}
							distortion={0.02}
						/>
					</div>
					<main>{children}</main>
				</body>
			</PostHogProvider>
		</html>
	);
}
