import type { Metadata } from "next";
import { Suspense } from "react";
import { Playfair_Display, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

import { Providers } from "./providers";

const playfair = Playfair_Display({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "900"],
	style: ["normal", "italic"],
	variable: "--font-display",
	display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600"],
	variable: "--font-body",
	display: "swap",
});

const jetbrains = JetBrains_Mono({
	subsets: ["latin"],
	weight: ["400", "500"],
	variable: "--font-mono",
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
					className={`${playfair.variable} ${jakarta.variable} ${jetbrains.variable} min-h-screen antialiased`}
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
