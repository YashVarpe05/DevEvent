"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function useSmoothScroll() {
	useEffect(() => {
		const lenis = new Lenis({
			lerp: 0.08,
			duration: 1.2,
			syncTouch: true,
		});

		let frameId = 0;

		function raf(time: number) {
			lenis.raf(time);
			frameId = requestAnimationFrame(raf);
		}

		frameId = requestAnimationFrame(raf);

		return () => {
			cancelAnimationFrame(frameId);
			lenis.destroy();
		};
	}, []);
}
