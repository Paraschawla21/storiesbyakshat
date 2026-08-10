"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

interface DevelopingImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * The signature "developing photo" reveal: image fades in from a
 * desaturated, softly blurred state into full color and sharpness,
 * mimicking a photograph developing in a darkroom.
 * Respects prefers-reduced-motion.
 */
export default function DevelopingImage({
  src,
  alt,
  width,
  height,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority = false,
  className = "",
}: DevelopingImageProps) {
  const [loaded, setLoaded] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={`relative overflow-hidden bg-paper ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <motion.div
        initial={reduceMotion ? false : { filter: "blur(14px) saturate(0.15) brightness(1.05)", scale: 1.04 }}
        animate={
          loaded
            ? reduceMotion
              ? { opacity: 1 }
              : { filter: "blur(0px) saturate(1) brightness(1)", scale: 1 }
            : {}
        }
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-full w-full"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onLoad={() => setLoaded(true)}
        />
      </motion.div>
    </div>
  );
}
