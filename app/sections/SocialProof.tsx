"use client";

import ScrollReveal from "@/components/ScrollReveal";
import CountUp from "@/components/CountUp";

export default function SocialProof() {
  return (
    <section className="py-24 bg-bg-base border-b border-border-subtle overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
        
        {/* LEFT: Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <ScrollReveal delay={0.1}>
            <div className="border-t-2 border-accent pt-6">
              <div className="font-display font-bold text-[56px] text-accent mb-2 leading-none">
                <CountUp target={2400} suffix="+" duration={2.5} />
              </div>
              <div className="font-body text-text-secondary text-base">Active developers using the platform monthly</div>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <div className="border-t-2 border-accent pt-6">
              <div className="font-display font-bold text-[56px] text-accent mb-2 leading-none">
                <CountUp target={140} suffix="+" duration={2} />
              </div>
              <div className="font-body text-text-secondary text-base">Successful tech events hosted this year</div>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={0.3} className="sm:col-span-2">
            <div className="border-t-2 border-accent pt-6">
              <div className="font-display font-bold text-[56px] text-accent mb-2 leading-none">
                <CountUp target={28} duration={2} />
              </div>
              <div className="font-body text-text-secondary text-base">Cities across India with active communities</div>
            </div>
          </ScrollReveal>
        </div>

        {/* RIGHT: Testimonials */}
        <div>
          <ScrollReveal delay={0.2} direction="left">
            <h2 className="font-display font-bold text-[32px] md:text-[40px] leading-tight mb-12 text-text-primary">
              Engineered for the builders who build the future
            </h2>
          </ScrollReveal>

          <div className="flex flex-col gap-6">
            <ScrollReveal delay={0.3} direction="left">
              <div className="bg-bg-elevated border border-border-subtle p-8 hover:border-accent transition-colors relative group">
                <div className="absolute top-4 right-6 font-display font-bold text-[80px] leading-none text-border-subtle opacity-20 group-hover:text-accent-dim transition-colors select-none">
                  "
                </div>
                <p className="font-display text-lg md:text-xl text-text-primary italic leading-relaxed mb-6 relative z-10">
                  "DevEvent completely removed the friction of organizing our city-wide hackathon. The open-source ethos aligns perfectly with our community."
                </p>
                <div className="flex flex-col relative z-10">
                  <span className="font-mono text-[12px] uppercase text-accent tracking-widest font-bold">Priya Sharma</span>
                  <span className="font-mono text-[10px] uppercase text-text-secondary tracking-widest">Lead Organizer, FOSS United</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.4} direction="left">
              <div className="bg-bg-elevated border border-border-subtle p-8 hover:border-accent transition-colors relative group">
                <div className="absolute top-4 right-6 font-display font-bold text-[80px] leading-none text-border-subtle opacity-20 group-hover:text-accent-dim transition-colors select-none">
                  "
                </div>
                <p className="font-display text-lg md:text-xl text-text-primary italic leading-relaxed mb-6 relative z-10">
                  "The fastest way to spin up an event page, manage RSVPs, and handle check-ins. It just works."
                </p>
                <div className="flex flex-col relative z-10">
                  <span className="font-mono text-[12px] uppercase text-accent tracking-widest font-bold">Rahul Desai</span>
                  <span className="font-mono text-[10px] uppercase text-text-secondary tracking-widest">Community Manager, AWS UG</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

      </div>
    </section>
  );
}
