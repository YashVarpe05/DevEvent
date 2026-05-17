"use client";

import ScrollReveal from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/Badge";

// Deterministic pseudo-random based on index — avoids hydration mismatch from Math.random()
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export default function FeaturesBento() {
  return (
    <section className="py-24 bg-bg-elevated border-b border-border-subtle overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6">
        
        <ScrollReveal className="mb-16">
          <span className="section-label mb-4 block">
            // WHY DEVEVENT
          </span>
          <h2 className="editorial-headline text-[40px] md:text-[56px]">
            Built for <br />
            <em className="text-accent not-italic pr-2">Builders</em>
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[240px]">
          
          {/* Card 1: Open Source (8 cols, 2 rows) */}
          <ScrollReveal delay={0.1} className="md:col-span-8 md:row-span-2 group">
            <div className="w-full h-full bg-bg-base border border-border-subtle hover:border-accent transition-colors relative overflow-hidden flex flex-col p-8">
              <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                {/* Heatmap dot grid decoration */}
                <div className="absolute inset-0 grid grid-cols-[repeat(auto-fill,20px)] grid-rows-[repeat(auto-fill,20px)] gap-1 p-4">
                  {Array.from({ length: 400 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`heatmap-cell ${seededRandom(i) > 0.8 ? `active-${Math.floor(seededRandom(i + 500) * 5) + 1}` : ''}`} 
                    />
                  ))}
                </div>
              </div>
              
              <div className="relative z-10 flex-1 flex flex-col justify-between">
                <div>
                  <Badge variant="accent" className="mb-4">100% OPEN SOURCE</Badge>
                  <h3 className="font-display font-bold text-3xl md:text-5xl text-text-primary mb-4 leading-tight">
                    Own your data. <br /> Fork the code.
                  </h3>
                  <p className="font-mono text-[12px] uppercase text-text-secondary tracking-widest max-w-md leading-relaxed">
                    DevEvent is fully open source. Self-host it, extend it, or contribute back. The community builds the future.
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border border-border-subtle bg-bg-elevated flex items-center gap-3">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-text-primary">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span className="font-mono text-[14px] text-text-primary">8.2k</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 2: Secure (4 cols) */}
          <ScrollReveal delay={0.2} className="md:col-span-4 group relative">
            <div className="w-full h-full bg-bg-base border border-border-subtle hover:border-accent transition-colors p-8 flex flex-col justify-between overflow-hidden relative">
              <div className="absolute -right-6 -bottom-6 font-display font-bold text-[160px] leading-none text-border-subtle opacity-10 group-hover:text-accent-dim transition-colors select-none">
                <svg className="w-[1em] h-[1em]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7.5 3.33V11c0 4.52-2.98 8.69-7.5 9.93-4.52-1.24-7.5-5.41-7.5-9.93V6.51l7.5-3.33z"/>
                </svg>
              </div>
              <div className="relative z-10 w-12 h-12 border border-border-subtle flex items-center justify-center group-hover:border-accent transition-colors mb-4">
                <svg className="w-5 h-5 text-text-secondary group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="font-display font-bold text-2xl text-text-primary mb-2">Enterprise Security</h3>
                <p className="font-mono text-[11px] uppercase text-text-secondary tracking-widest leading-relaxed">
                  Bank-grade encryption for all payments and user data.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 3: Lightning Fast (4 cols) */}
          <ScrollReveal delay={0.3} className="md:col-span-4 group relative">
            <div className="w-full h-full bg-bg-base border border-border-subtle hover:border-accent transition-colors p-8 flex flex-col justify-between overflow-hidden relative">
              <div className="absolute -right-8 -bottom-8 font-display font-bold text-[120px] leading-none text-border-subtle opacity-50 group-hover:text-accent-dim transition-colors select-none">
                99<span className="text-[60px]">ms</span>
              </div>
              <div className="relative z-10 w-12 h-12 border border-border-subtle flex items-center justify-center group-hover:border-accent transition-colors mb-4">
                <svg className="w-5 h-5 text-text-secondary group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="font-display font-bold text-2xl text-text-primary mb-2">Lightning Fast</h3>
                <p className="font-mono text-[11px] uppercase text-text-secondary tracking-widest leading-relaxed">
                  Global edge caching via Next.js and Vercel.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 4: UPI Native (4 cols) */}
          <ScrollReveal delay={0.4} className="md:col-span-4 group relative">
            <div className="w-full h-full bg-bg-base border border-border-subtle hover:border-accent transition-colors p-8 flex flex-col justify-between overflow-hidden relative">
              <div className="absolute -right-4 -bottom-6 font-display font-bold text-[140px] leading-none text-border-subtle opacity-20 group-hover:text-accent-dim transition-colors select-none">
                ₹
              </div>
              <div className="relative z-10 w-12 h-12 border border-border-subtle flex items-center justify-center group-hover:border-accent transition-colors mb-4">
                <svg className="w-5 h-5 text-text-secondary group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="font-display font-bold text-2xl text-text-primary mb-2">UPI Native</h3>
                <p className="font-mono text-[11px] uppercase text-text-secondary tracking-widest leading-relaxed">
                  Zero-friction payments tailored for India.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 5: Community (4 cols) */}
          <ScrollReveal delay={0.5} className="md:col-span-4 group relative">
            <div className="w-full h-full bg-bg-base border border-border-subtle hover:border-accent transition-colors p-8 flex flex-col justify-between overflow-hidden relative">
              <div className="absolute -right-6 -bottom-6 font-display font-bold text-[160px] leading-none text-border-subtle opacity-10 group-hover:text-accent-dim transition-colors select-none">
                <svg className="w-[1em] h-[1em]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <div className="relative z-10 w-12 h-12 border border-border-subtle flex items-center justify-center group-hover:border-accent transition-colors mb-4">
                <svg className="w-5 h-5 text-text-secondary group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="font-display font-bold text-2xl text-text-primary mb-2">Community First</h3>
                <p className="font-mono text-[11px] uppercase text-text-secondary tracking-widest leading-relaxed">
                  Built specifically for dev communities.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 6: API First (4 cols) - Completing the grid */}
          <ScrollReveal delay={0.6} className="md:col-span-4 group relative">
            <div className="w-full h-full bg-bg-base border border-border-subtle hover:border-accent transition-colors p-8 flex flex-col justify-between overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 font-mono font-bold text-[140px] leading-none text-border-subtle opacity-20 group-hover:text-accent-dim transition-colors select-none">
                {"{}"}
              </div>
              <div className="relative z-10 w-12 h-12 border border-border-subtle flex items-center justify-center group-hover:border-accent transition-colors mb-4">
                <svg className="w-5 h-5 text-text-secondary group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="font-display font-bold text-2xl text-text-primary mb-2">API First</h3>
                <p className="font-mono text-[11px] uppercase text-text-secondary tracking-widest leading-relaxed">
                  Headless architecture. Bring your own frontend.
                </p>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
