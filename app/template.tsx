"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * `template.tsx` (unlike `layout.tsx`) re-mounts on every navigation, which
 * makes it the right place for an enter transition. A soft cross-fade with a
 * whisper of upward drift — deliberately understated so it reads as polish
 * rather than a slideshow effect between pages.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
