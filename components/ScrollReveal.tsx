"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.6,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-50px" });

  const getVariants = () => {
    switch (direction) {
      case "up":
        return { hidden: { y: 40, opacity: 0 }, visible: { y: 0, opacity: 1 } };
      case "down":
        return { hidden: { y: -40, opacity: 0 }, visible: { y: 0, opacity: 1 } };
      case "left":
        return { hidden: { x: 40, opacity: 0 }, visible: { x: 0, opacity: 1 } };
      case "right":
        return { hidden: { x: -40, opacity: 0 }, visible: { x: 0, opacity: 1 } };
      default:
        return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={getVariants()}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
