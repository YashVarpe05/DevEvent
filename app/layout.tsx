"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { AnimatePresence, motion } from "motion/react";
import "./globals.css";
import { Providers } from "./providers";

const fontVariables = {
	"--font-display": "'Space Grotesk', system-ui, sans-serif",
	"--font-body": "'Inter', system-ui, sans-serif",
	"--font-mono": "'JetBrains Mono', 'Courier New', monospace",
	"--font-editorial-display": "'Space Grotesk', system-ui, sans-serif",
	"--font-editorial-body": "'Inter', system-ui, sans-serif",
	margin: 0,
} as CSSProperties;

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const lenisRef = useRef<Lenis | null>(null);

	useEffect(() => {
		const lenis = new Lenis({
			lerp: 0.08,
			duration: 1.2,
			syncTouch: true,
		});
		let frameId = 0;

		lenisRef.current = lenis;

		function raf(time: number) {
			lenis.raf(time);
			frameId = requestAnimationFrame(raf);
		}

		frameId = requestAnimationFrame(raf);

		return () => {
			cancelAnimationFrame(frameId);
			lenis.destroy();
			lenisRef.current = null;
		};
	}, []);

	return (
		<html lang="en" className="dark" suppressHydrationWarning>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;600;700&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body
				className="min-h-screen bg-[#0A0A0B] text-[#E8E6E3] antialiased"
				style={fontVariables}
				suppressHydrationWarning
			>
				<Providers>
					<AnimatePresence mode="wait">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5 }}
						>
							{children}
						</motion.div>
					</AnimatePresence>
				</Providers>
			</body>
		</html>
	);
}
