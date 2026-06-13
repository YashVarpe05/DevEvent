"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const LightRays = dynamic(() => import("@/components/LightRays"), {
	ssr: false,
});

/**
 * Immersive stage-light backdrop for the hero.
 * Renders the OGL light-rays canvas only when the device can afford it:
 * falls back to a static gradient on reduced-motion, coarse-pointer
 * (mobile) and save-data contexts.
 */
export default function HeroBackdrop() {
	const [enableCanvas, setEnableCanvas] = useState(false);

	useEffect(() => {
		const id = requestAnimationFrame(() => {
			const reducedMotion = window.matchMedia(
				"(prefers-reduced-motion: reduce)",
			).matches;
			const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
			const smallViewport = window.innerWidth < 768;
			const saveData =
				"connection" in navigator &&
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				Boolean((navigator as any).connection?.saveData);

			setEnableCanvas(
				!reducedMotion && !saveData && !(coarsePointer && smallViewport),
			);
		});
		return () => cancelAnimationFrame(id);
	}, []);

	return (
		<div className="absolute inset-0 pointer-events-none" aria-hidden="true">
			{/* Static fallback layer — always present so first paint has depth */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse 70% 55% at 72% -10%, rgba(255,107,53,0.07), transparent 60%), radial-gradient(ellipse 50% 40% at 20% 110%, rgba(0,212,170,0.03), transparent 65%)",
				}}
			/>

			{/* Faint structural grid — industrial floor */}
			<div
				className="absolute inset-0 opacity-[0.35]"
				style={{
					backgroundImage:
						"linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
					backgroundSize: "72px 72px",
					maskImage:
						"radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 75%)",
					WebkitMaskImage:
						"radial-gradient(ellipse 80% 70% at 50% 30%, black 0%, transparent 75%)",
				}}
			/>

			{/* WebGL stage lights — lazy, capability-gated */}
			{enableCanvas && (
				<div className="absolute inset-0">
					<LightRays
						raysOrigin="top-center-offset"
						raysColor="#FF6B35"
						raysSpeed={0.6}
						lightSpread={1.1}
						rayLength={1.4}
						fadeDistance={1.0}
						saturation={0.85}
						followMouse
						mouseInfluence={0.06}
						noiseAmount={0.04}
						distortion={0.02}
						className="opacity-[0.32]"
					/>
				</div>
			)}

			{/* Bottom fade into page background — keeps text legible */}
			<div
				className="absolute inset-x-0 bottom-0 h-40"
				style={{
					background:
						"linear-gradient(to bottom, transparent, var(--bg-base))",
				}}
			/>
			<div className="grain-overlay" />
		</div>
	);
}
