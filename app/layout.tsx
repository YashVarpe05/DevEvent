import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "700"],
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DevEvent | India's Developer Event Platform",
  description:
    "Discover hackathons, meetups, and workshops. Book your spot in seconds. No fluff. India's developer event platform.",
  keywords: [
    "developer events",
    "hackathons India",
    "tech meetups",
    "workshops",
    "developer community",
  ],
  openGraph: {
    title: "DevEvent | India's Developer Event Platform",
    description: "Discover hackathons, meetups, and workshops across India.",
    type: "website",
    locale: "en_IN",
    url: "https://devevents.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevEvent | India's Developer Event Platform",
    description: "Discover hackathons, meetups, and workshops across India.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable}`}
    >
      <body className="bg-[#0A0A0B] text-[#E8E6E3] antialiased min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
