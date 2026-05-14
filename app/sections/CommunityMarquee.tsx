"use client";

import Marquee from "@/components/Marquee";

export default function CommunityMarquee() {
  const communities = [
    "FOSS United",
    "GDG India",
    "ReactJS India",
    "MLH",
    "AWS UG",
    "DevFolio",
    "GitHub India",
    "Women Who Code",
    "HackerEarth",
    "Hasgeek",
    "JSConf India",
    "TensorFlow User Group"
  ];

  return (
    <section className="py-16 bg-bg-base overflow-hidden border-b border-border-subtle">
      <div className="max-w-[1440px] mx-auto mb-8 px-6 text-center">
        <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
          Trusted by leading developer communities
        </span>
      </div>

      <div className="relative w-full">
        {/* Edge gradient masks for smooth fade in/out */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg-base to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg-base to-transparent z-10 pointer-events-none" />

        <Marquee speed={50} className="py-4">
          {communities.map((community, index) => (
            <div key={index} className="flex items-center gap-8 group">
              <span className="font-mono text-[13px] text-text-secondary uppercase tracking-widest group-hover:text-accent transition-colors cursor-default">
                {community}
              </span>
              <div className="w-1.5 h-1.5 bg-accent opacity-50" />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
