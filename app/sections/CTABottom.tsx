"use client";

import ScrollReveal from "@/components/ScrollReveal";
import MagneticButton from "@/components/MagneticButton";
import { Button } from "@/components/ui/Button";

export default function CTABottom() {
  return (
    <section className="relative py-32 bg-bg-void overflow-hidden flex flex-col items-center justify-center text-center">
      {/* Glow pulse background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-accent animate-glow-pulse blur-[120px]"></div>
      </div>
      
      <div className="max-w-3xl mx-auto px-6 relative z-10 flex flex-col items-center">
        <ScrollReveal direction="up" delay={0.1}>
          <span className="font-mono text-[12px] uppercase text-accent tracking-widest block mb-6">
            // READY TO BUILD?
          </span>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.2}>
          <h2 className="font-display font-bold text-[48px] md:text-[64px] leading-[0.9] text-text-primary mb-6">
            Host Your Next <br />
            <em className="text-accent not-italic">Big Event</em>
          </h2>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.3}>
          <p className="font-mono text-[12px] uppercase text-text-secondary tracking-widest mb-12 max-w-md mx-auto">
            Free to use. No credit card required. 100% open source.
          </p>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.4}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <MagneticButton>
              <Button href="/become-organizer" variant="primary" size="lg" className="w-full sm:w-auto">
                List an Event
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button href="/events" variant="secondary" size="lg" className="w-full sm:w-auto">
                Browse Events
              </Button>
            </MagneticButton>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
