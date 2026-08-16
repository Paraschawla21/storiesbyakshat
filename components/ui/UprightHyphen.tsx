import type { ReactNode } from "react";

/**
 * Italic display fonts (Cormorant Garamond, used via `.font-accent`) draw a
 * plain hyphen "-" as a steep diagonal stroke rather than the gentle,
 * near-horizontal dash it uses for an em/en dash — next to upright text
 * (dates, ampersands) it reads as a stray slash rather than a separator.
 *
 * Cormorant Garamond is only loaded in its italic style (see
 * `app/layout.tsx`) — there's no upright face for this family at all, so
 * `font-style: normal` alone is a no-op; the browser still has nothing but
 * italic glyphs to draw from. Swapping the hyphen to the body font (Inter,
 * upright by design) instead of merely un-italicizing is what actually
 * fixes the tilt, while leaving the rest of the italic text untouched.
 */
export function withUprightHyphens(text: string): ReactNode {
  const parts = text.split(/(\s-\s)/g);
  if (parts.length === 1) return text;

  return parts.map((part, i) =>
    part === " - " ? (
      <span key={i} className="font-body not-italic">
        {" "}
        -{" "}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
