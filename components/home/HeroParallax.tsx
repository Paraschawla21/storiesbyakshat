"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * The homepage hero image drifts upward slightly slower than the page
 * scrolls, and gently deepens its scrim as it leaves — a restrained
 * parallax that adds depth without turning the hero into a ride.
 */
export default function HeroParallax({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const scrim = useTransform(scrollYProgress, [0, 1], [0, 0.35]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={reduceMotion ? undefined : { y, scale }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-ink/30" />
      {!reduceMotion && (
        <motion.div
          className="absolute inset-0 bg-ink"
          style={{ opacity: scrim }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
