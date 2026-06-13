"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import MagneticButton from "@/components/MagneticButton";
import HeroBackdrop from "@/components/HeroBackdrop";

/* ── Hero card data ── */
const heroCards = [
  {
    id: 1,
    title: "AI Agents Buildspace",
    category: "Hackathon",
    location: "Bengaluru",
    date: "JUN 14, 2025",
    time: "10:00 AM",
    attendees: 124,
    badge: "LIVE NOW",
    badgeVariant: "accent" as const,
    image: "/images/hero/hackathon.png",
  },
  {
    id: 2,
    title: "React India Conf '25",
    category: "Conference",
    location: "Goa",
    date: "AUG 22, 2025",
    time: "09:00 AM",
    attendees: 890,
    badge: "TRENDING",
    badgeVariant: "teal" as const,
    image: "/images/hero/conference.png",
  },
  {
    id: 3,
    title: "DevOps & Cloud Meetup",
    category: "Meetup",
    location: "Hyderabad",
    date: "JUL 05, 2025",
    time: "06:30 PM",
    attendees: 67,
    badge: "FREE",
    badgeVariant: "teal" as const,
    image: "/images/hero/meetup.png",
  },
  {
    id: 4,
    title: "Fullstack Workshop",
    category: "Workshop",
    location: "Remote",
    date: "JUL 19, 2025",
    time: "02:00 PM",
    attendees: 210,
    badge: "FILLING FAST",
    badgeVariant: "accent" as const,
    image: "/images/hero/workshop.png",
  },
];

/* ── Vertical text words ── */
const verticalWords = ["HACKATHON", "MEETUP", "WORKSHOP", "CONFERENCE"];

/* ── Positions for the 4-card stack ── */
const stackPositions = [
  { zIndex: 40, x: 0, y: 0, rotate: -2, scale: 1, opacity: 1 },
  { zIndex: 30, x: 24, y: -12, rotate: 3, scale: 0.95, opacity: 0.85 },
  { zIndex: 20, x: -16, y: -20, rotate: -6, scale: 0.90, opacity: 0.55 },
  { zIndex: 10, x: 8, y: -28, rotate: 5, scale: 0.85, opacity: 0.30 },
];

export default function Hero() {
  const [order, setOrder] = useState([0, 1, 2, 3]);
  const [isHovering, setIsHovering] = useState(false);
  const [glitchIdx, setGlitchIdx] = useState<number | null>(null);

  /* Auto-shuffle every 3.5s unless hovering */
  const shuffle = useCallback(() => {
    setOrder((prev) => {
      const next = [...prev];
      const front = next.shift()!;
      next.push(front);
      return next;
    });
  }, []);

  useEffect(() => {
    if (isHovering) return;
    const timer = setInterval(shuffle, 3500);
    return () => clearInterval(timer);
  }, [isHovering, shuffle]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.6 } },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden bg-bg-base">
      <HeroBackdrop />
      <div className="relative max-w-[1440px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
        
        {/* LEFT: Content */}
        <motion.div 
          className="lg:col-span-6 xl:col-span-7 flex flex-col items-start"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="section-label">
              {"// INDIA'S DEVELOPER EVENT PLATFORM"}
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

        {/* CENTER: Vertical scrolling text */}
        <div className="hidden xl:flex lg:col-span-1 justify-center relative h-[520px]">
          {/* Hairline */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border-subtle opacity-30" />
          
          {/* Vertical marquee */}
          <div className="hero-vertical-track">
            <div className="hero-vertical-scroll">
              {/* Repeat 3x for seamless loop */}
              {[...Array(3)].map((_, rep) => (
                <div key={rep} className="flex flex-col items-center gap-6">
                  {verticalWords.map((word, i) => (
                    <span key={`${rep}-${i}`} className="hero-vertical-word">
                      {word}
                    </span>
                  ))}
                  <span className="hero-vertical-dot">&middot;</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Shuffling Card Stack */}
        <motion.div 
          className="lg:col-span-6 xl:col-span-4 relative h-[440px] sm:h-[520px] w-full mt-10 lg:mt-0"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => { setIsHovering(false); setGlitchIdx(null); }}
        >
          <AnimatePresence mode="sync">
            {order.map((cardIdx, stackPos) => {
              const card = heroCards[cardIdx];
              const pos = stackPositions[stackPos];
              const isFront = stackPos === 0;

              return (
                <motion.div
                  key={card.id}
                  layout
                  className="absolute top-0 right-0 w-[82%] sm:w-[78%] cursor-pointer"
                  style={{ zIndex: pos.zIndex }}
                  animate={{
                    x: pos.x,
                    y: pos.y,
                    rotate: pos.rotate,
                    scale: pos.scale,
                    opacity: pos.opacity,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 24,
                    mass: 0.8,
                  }}
                  onClick={() => {
                    if (!isFront) {
                      setOrder((prev) => {
                        const next = prev.filter((i) => i !== cardIdx);
                        return [cardIdx, ...next];
                      });
                    }
                  }}
                  whileHover={isFront ? { scale: 1.02, y: -4 } : { scale: pos.scale + 0.02 }}
                >
                  <div
                    className={`
                      aspect-[3/4] bg-bg-elevated border overflow-hidden flex flex-col group
                      ${isFront 
                        ? "border-accent/60 shadow-[0_0_40px_rgba(255,107,53,0.12)]" 
                        : "border-border-subtle"}
                    `}
                    onMouseEnter={() => isFront && setGlitchIdx(cardIdx)}
                    onMouseLeave={() => setGlitchIdx(null)}
                  >
                    {/* Image area */}
                    <div className="relative h-[55%] overflow-hidden bg-[#0d0e15]">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        priority={card.id === 1}
                        className={`object-cover transition-all duration-500 ${
                          isFront 
                            ? "grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105" 
                            : "grayscale brightness-75"
                        }`}
                        sizes="(max-width: 768px) 80vw, 400px"
                      />
                      
                      {/* Glitch effect layers — only on hovered front card */}
                      {glitchIdx === cardIdx && (
                        <>
                          <div className="hero-glitch-layer hero-glitch-r" />
                          <div className="hero-glitch-layer hero-glitch-b" />
                          <div className="hero-glitch-scanlines" />
                        </>
                      )}

                      {/* Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <Badge
                          variant={card.badgeVariant}
                          className={card.badge === "LIVE NOW" ? "animate-pulse" : ""}
                        >
                          {card.badge}
                        </Badge>
                      </div>

                      {/* Bottom gradient fade */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg-elevated to-transparent z-[5]" />
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="default">{card.category}</Badge>
                          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-wider">
                            {card.location}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-xl sm:text-2xl text-text-primary leading-tight mb-2 group-hover:text-accent transition-colors duration-200">
                          {card.title}
                        </h3>
                        <p className="font-mono text-[10px] sm:text-[11px] text-text-secondary uppercase tracking-widest">
                          {card.date} &middot; {card.time}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-4 border-t border-border-subtle flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-7 h-7 border border-border-subtle flex items-center justify-center font-mono text-[9px] text-text-secondary bg-bg-surface"
                            >
                              {String.fromCharCode(65 + (card.id + i) % 26)}
                            </div>
                          ))}
                        </div>
                        <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
                          +{card.attendees} JOINED
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Navigation dots */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50">
            {heroCards.map((card, i) => (
              <button
                key={card.id}
                onClick={() => {
                  setOrder((prev) => {
                    const next = prev.filter((idx) => idx !== i);
                    return [i, ...next];
                  });
                }}
                className={`
                  h-1.5 transition-all duration-300 
                  ${order[0] === i 
                    ? "w-6 bg-accent" 
                    : "w-1.5 bg-border-subtle hover:bg-text-secondary"}
                `}
              />
            ))}
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}
