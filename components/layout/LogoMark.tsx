import { apertureBloomPaths } from "@/lib/logo-mark";

const paths = apertureBloomPaths(50, 50, 42);

/**
 * The site's icon mark — a six-petal "aperture bloom" (camera aperture +
 * golden-hour flower), the same shape used for the favicon, apple touch
 * icon, and default social share image. Rendered here as a plain
 * React/SVG component so it can sit inline in the nav, footer, and admin
 * sidebar without pulling in `next/og`.
 */
export default function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="49" fill="var(--color-ink)" />
      <g fill="var(--color-marigold)">
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <circle cx="50" cy="50" r="16" fill="var(--color-linen)" />
      <text
        x="50"
        y="57"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontSize="20"
        fill="var(--color-rosewood)"
      >
        S
      </text>
    </svg>
  );
}
