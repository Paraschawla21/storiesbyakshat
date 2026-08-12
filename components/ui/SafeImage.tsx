"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * A drop-in `next/image` replacement for remotely hosted photos.
 *
 * Next's Image has no built-in fallback: if the file 404s (deleted from
 * Cloudinary, a stale Unsplash URL, an offline visitor) the browser paints a
 * broken-image icon and the layout collapses. This keeps the box, keeps the
 * alt text for screen readers, and shows a quiet placeholder instead.
 */
export default function SafeImage({
  src,
  alt,
  className = "",
  fill,
  width,
  height,
  ...props
}: ImageProps) {
  const [failed, setFailed] = useState(false);

  const missing = typeof src === "string" && src.trim().length === 0;

  if (failed || missing) {
    // `fill` images are absolutely positioned inside a sized parent. The
    // placeholder has to do the same, otherwise it collapses to zero height
    // and the layout breaks worse than the missing image would.
    const layout = fill
      ? "absolute inset-0 h-full w-full"
      : "h-full w-full";

    return (
      <div
        className={`flex items-center justify-center bg-paper ${layout} ${className}`}
        style={!fill && width && height ? { aspectRatio: `${width} / ${height}` } : undefined}
        role="img"
        aria-label={typeof alt === "string" ? alt : undefined}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5 text-ink-soft/35"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18M3 12h18" strokeOpacity="0.5" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
