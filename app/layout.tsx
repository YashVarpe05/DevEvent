import type { Metadata } from "next";
import { Suspense } from "react";
import { Bebas_Neue, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

import { Providers } from "./providers";

const bebasNeue = Bebas_Neue({
	weight: "400",
	variable: "--font-bebas-neue",
	subsets: ["latin"],
	display: "swap",
});

const dmSans = DM_Sans({
	variable: "--font-dm-sans",
	subsets: ["latin"],
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "DevEvent | India's Developer Event Platform",
	description:
		"Discover tech meetups, hackathons, and workshops across India. Book your spot in seconds.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<Providers>
				<body
					suppressHydrationWarning
					className={`${bebasNeue.variable} ${dmSans.variable} ${jetbrainsMono.variable} min-h-screen antialiased`}
				>
					<Navbar />
					<Suspense>
						<main>{children}</main>
					</Suspense>
				</body>
			</Providers>
		</html>
	);
}
