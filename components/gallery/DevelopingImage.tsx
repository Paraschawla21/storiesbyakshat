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
 *
 * If the file itself can't be fetched (deleted from Cloudinary, bad URL,
 * offline), we fall back to a quiet placeholder that keeps the layout
 * intact. Without this the reveal would never resolve and the image would
 * sit blurred and empty forever.
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
  const [failed, setFailed] = useState(false);
  const reduceMotion = useReducedMotion();

  const hasValidSrc = typeof src === "string" && src.trim().length > 0;

  if (!hasValidSrc || failed) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-paper ${className}`}
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-6 w-6 text-ink-soft/40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18M3 12h18" strokeOpacity="0.5" />
          </svg>
          <span className="text-[11px] uppercase tracking-[0.18em] text-ink-soft/60">
            Image unavailable
          </span>
        </div>
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

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
          onError={() => setFailed(true)}
        />
      </motion.div>
    </div>
  );
}
