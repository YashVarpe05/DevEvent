"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import MagneticButton from "@/components/MagneticButton";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.6 } as any },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden bg-bg-base">
      <div className="max-w-[1440px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
        
        {/* LEFT: Content (55%) */}
        <motion.div 
          className="lg:col-span-6 xl:col-span-7 flex flex-col items-start"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="section-label">
              // INDIA&apos;S DEVELOPER EVENT PLATFORM
            </span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="editorial-headline text-[56px] md:text-[72px] lg:text-[80px] mb-6 max-w-3xl"
          >
            Where Builders <br />
            <em className="text-accent not-italic font-italic pr-4">Come Together</em>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-text-secondary text-base md:text-lg max-w-xl mb-10 leading-relaxed font-body"
          >
            Discover hackathons, meetups, and workshops. Book your spot in seconds. No fluff. Engineered for the builders who build the future.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 mb-16">
            <MagneticButton>
              <Button href="/events" variant="primary" size="lg">
                Browse Events
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button href="/become-organizer" variant="secondary" size="lg">
                List an Event
              </Button>
            </MagneticButton>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-8 border-t border-border-subtle w-full max-w-xl"
          >
            <div>
              <div className="mono-data text-accent text-xl font-bold">2400+</div>
              <div className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mt-1">Developers</div>
            </div>
            <div className="h-8 w-px bg-border-subtle hidden sm:block"></div>
            <div>
              <div className="mono-data text-accent text-xl font-bold">140+</div>
              <div className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mt-1">Events Hosted</div>
            </div>
            <div className="h-8 w-px bg-border-subtle hidden sm:block"></div>
            <div>
              <div className="mono-data text-accent text-xl font-bold">28</div>
              <div className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mt-1">Cities</div>
            </div>
            <div className="h-8 w-px bg-border-subtle hidden sm:block"></div>
            <div>
              <div className="mono-data text-accent text-xl font-bold">100%</div>
              <div className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mt-1">Open Source</div>
            </div>
          </motion.div>
        </motion.div>

        {/* CENTER: Vertical chaos strip */}
        <div className="hidden xl:flex lg:col-span-1 justify-center relative h-full">
          <div className="absolute top-1/2 -translate-y-1/2 editorial-hairline h-[200px]"></div>
          <div className="absolute top-1/2 -translate-y-1/2 vertical-text font-mono text-[10px] text-border-subtle uppercase tracking-[0.2em] mix-blend-screen">
            HACKATHON &middot; MEETUP &middot; WORKSHOP &middot; CONFERENCE
          </div>
        </div>

        {/* RIGHT: Overlapping Cards (45%) */}
        <motion.div 
          className="lg:col-span-6 xl:col-span-4 relative h-[400px] sm:h-[500px] w-full mt-10 lg:mt-0"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          {/* Card 3 (Back) */}
          <div className="absolute top-[10%] right-[15%] w-[70%] aspect-[3/4] bg-bg-surface border border-border-subtle -rotate-8 origin-bottom-right opacity-40">
            <div className="grain-overlay"></div>
          </div>
          
          {/* Card 2 (Middle) */}
          <div className="absolute top-[5%] right-[5%] w-[75%] aspect-[3/4] bg-bg-surface-high border border-border-subtle rotate-3 origin-bottom-left opacity-80">
            <div className="grain-overlay"></div>
          </div>
          
          {/* Card 1 (Front) */}
          <div className="absolute top-0 right-0 w-[85%] aspect-[3/4] bg-bg-elevated border border-accent shadow-[0_0_30px_rgba(255,107,53,0.1)] -rotate-2 origin-center overflow-hidden flex flex-col group">
            <div className="grain-overlay"></div>
            
            <div className="relative h-[55%] bg-[#1a1a1e] border-b border-border-subtle overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <Badge variant="accent" className="animate-pulse">LIVE NOW</Badge>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated to-transparent opacity-50"></div>
            </div>
            
            <div className="p-6 flex flex-col justify-between flex-1 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="default">Hackathon</Badge>
                  <span className="font-mono text-[10px] text-text-secondary uppercase">Bengaluru</span>
                </div>
                <h3 className="font-display font-bold text-2xl text-text-primary leading-tight mb-2 group-hover:text-accent transition-colors">
                  AI Agents Buildspace
                </h3>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border-subtle flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 bg-bg-surface border border-border-subtle flex items-center justify-center font-mono text-[10px]">
                      {i}
                    </div>
                  ))}
                </div>
                <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">+124 JOINED</span>
              </div>
            </div>
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}
