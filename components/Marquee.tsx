"use client";

import { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  speed?: number; // Speed in seconds for one full translation
}

export default function Marquee({
  children,
  className = "",
  speed = 40,
}: MarqueeProps) {
  return (
    <div
      className={`relative flex w-full overflow-hidden ${className}`}
      style={
        {
          "--marquee-duration": `${speed}s`,
        } as React.CSSProperties
      }
    >
      <div
        className="flex min-w-full shrink-0 animate-marquee items-center justify-around gap-8 whitespace-nowrap px-4"
        style={{ animationDuration: "var(--marquee-duration)" }}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className="flex min-w-full shrink-0 animate-marquee items-center justify-around gap-8 whitespace-nowrap px-4"
        style={{ animationDuration: "var(--marquee-duration)" }}
      >
        {children}
      </div>
    </div>
  );
}
