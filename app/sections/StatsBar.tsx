"use client";

import CountUp from "@/components/CountUp";
import ScrollReveal from "@/components/ScrollReveal";

export default function StatsBar() {
  const stats = [
    { target: 2400, prefix: "", suffix: "+", label: "DEVELOPERS" },
    { target: 140, prefix: "", suffix: "+", label: "EVENTS HOSTED" },
    { target: 28, prefix: "", suffix: "", label: "CITIES" },
    { target: 100, prefix: "", suffix: "%", label: "OPEN SOURCE" },
  ];

  return (
    <section className="bg-bg-elevated border-y border-border-subtle overflow-hidden">
      <div className="max-w-[1440px] mx-auto">
        <ScrollReveal direction="up" delay={0.2} className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border-subtle">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="font-display text-[32px] md:text-[40px] font-bold text-accent mb-2">
                <CountUp 
                  target={stat.target} 
                  prefix={stat.prefix} 
                  suffix={stat.suffix} 
                  duration={2.5} 
                />
              </div>
              <div className="font-mono text-[10px] sm:text-[11px] text-text-secondary uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
