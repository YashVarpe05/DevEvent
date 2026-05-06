"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* =============================================================================
   LogoSlider Component
   
   A smooth, infinite marquee/slider component for displaying logos.
   Uses Tailwind CSS where possible, raw CSS only for animations/masks.
============================================================================= */

export interface LogoSliderProps {
    /** Array of React nodes (logos, icons, images) to display */
    logos: React.ReactNode[];
    /** Animation speed - higher = slower (default: 60) */
    speed?: number;
    /** Scroll direction. Default: "left" */
    direction?: "left" | "right";
    /** Whether to show blur overlays on edges. Default: true */
    showBlur?: boolean;
    /** Number of blur layers for progressive effect. Default: 8 */
    blurLayers?: number;
    /** Blur intensity multiplier. Default: 1 */
    blurIntensity?: number;
    /** Additional CSS classes */
    className?: string;
    /** Whether to pause animation on hover. Default: false */
    pauseOnHover?: boolean;
}

/**
 * LogoSlider Component
 *
 * A beautiful infinite marquee for showcasing logos, partners, or any content.
 * Uses per-item CSS animations for optimal performance.
 */


export const LogoSlider = ({
    logos,
    speed = 60,
    direction = "left",
    showBlur = true,
    blurLayers = 8,
    blurIntensity = 1,
    className,
    pauseOnHover = false,
}: LogoSliderProps) => {
    return (
        <div
            className={cn(
                "logo-slider w-full h-full overflow-hidden",
                className
            )}
            style={
                {
                    "--speed": speed,
                    "--count": logos.length,
                    "--blurs": blurLayers,
                    "--blur": blurIntensity,
                } as React.CSSProperties
            }
        >
            <div
                className={cn(
                    "logo-slider__container",
                    "relative w-full h-full flex"
                )}
                data-direction={direction}
                data-pause-on-hover={pauseOnHover}
            >
                {/* Progressive Blur Overlay - Left */}
                {showBlur && (
                    <div className="logo-slider__blur logo-slider__blur--left absolute top-0 bottom-0 left-0 w-1/4 z-10 pointer-events-none rotate-180">
                        {Array.from({ length: blurLayers }).map((_, i) => (
                            <div
                                key={`blur-left-${i}`}
                                className="absolute inset-0"
                                style={{ "--blur-index": i } as React.CSSProperties}
                            />
                        ))}
                    </div>
                )}

                {/* Progressive Blur Overlay - Right */}
                {showBlur && (
                    <div className="logo-slider__blur logo-slider__blur--right absolute top-0 bottom-0 right-0 w-1/4 z-10 pointer-events-none">
                        {Array.from({ length: blurLayers }).map((_, i) => (
                            <div
                                key={`blur-right-${i}`}
                                className="absolute inset-0"
                                style={{ "--blur-index": i } as React.CSSProperties}
                            />
                        ))}
                    </div>
                )}

                {/* Logo Track */}
                <ul className="logo-slider__track flex items-center justify-center h-full w-max mx-auto m-0 p-0 list-none gap-8">
                    {logos.map((logo, index) => (
                        <li
                            key={index}
                            className="logo-slider__item flex items-center justify-center h-full w-auto shrink-0"
                            style={{ "--item-index": index } as React.CSSProperties}
                        >
                            <div className="w-full h-full flex items-center justify-center">
                                {logo}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

LogoSlider.displayName = "LogoSlider";

export default LogoSlider;
