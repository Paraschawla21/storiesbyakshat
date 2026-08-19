import Link from "next/link";
import LogoMark from "./LogoMark";

/**
 * The site's wordmark, matching the real Stories by Akshat brand identity:
 * a flowing cursive "stories by" signature sitting above bold,
 * wide-tracked "AKSHAT" caps, with an optional small tracked tagline
 * ("Never Ending Stories") beneath — same hierarchy as the Instagram
 * profile mark, re-set in the site's warm palette instead of its teal.
 * Paired with the aperture-bloom icon mark (also used as the favicon /
 * app icon / social share image) so the same identity shows up
 * everywhere consistently — nav, footer, and admin sidebar.
 */
export default function Logo({
  className = "",
  variant = "nav",
  showMark = true,
}: {
  className?: string;
  variant?: "nav" | "full";
  /** Set false to render the wordmark alone (e.g. very tight spaces). */
  showMark?: boolean;
}) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center ${
        variant === "full" ? "flex-col items-start text-left" : "gap-3"
      } ${className}`}
      aria-label="Stories by Akshat — Home"
    >
      {showMark && (
        <LogoMark
          className={
            variant === "nav"
              ? "h-9 w-9 shrink-0 translate-y-0.5 transition-transform duration-500 ease-out group-hover:rotate-12 md:h-10 md:w-10"
              : "mb-3 h-16 w-16 shrink-0 transition-transform duration-500 ease-out group-hover:rotate-12"
          }
        />
      )}

      <span className="flex flex-col items-start">
        <span
          className={`font-logo-script leading-none text-marigold-dark ${
            variant === "nav" ? "text-2xl md:text-3xl" : "text-5xl md:text-6xl"
          }`}
        >
          stories by
        </span>
        <span
          className={`font-logo-akshat font-semibold uppercase leading-none text-ink ${
            variant === "nav"
              ? "text-base tracking-[0.28em] md:text-lg"
              : "text-2xl tracking-[0.3em] md:text-3xl"
          }`}
        >
          AKSHAT
        </span>
        {variant === "full" && (
          <span className="mt-2 text-xs uppercase tracking-[0.35em] text-olive">
            Never Ending Stories
          </span>
        )}
      </span>
    </Link>
  );
}
