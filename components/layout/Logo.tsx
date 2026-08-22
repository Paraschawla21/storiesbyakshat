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
  if (variant === "full") {
    return (
      <Link
        href="/"
        className={`group inline-flex items-center gap-4 text-left ${className}`}
        aria-label="Stories by Akshat — Home"
      >
        {showMark && (
          <LogoMark className="h-14 w-14 shrink-0 translate-y-3 transition-transform duration-500 ease-out group-hover:rotate-12 md:h-16 md:w-16 md:translate-y-4" />
        )}
        <span className="flex flex-col items-start">
          <span className="font-logo-script text-[76px] leading-none text-marigold-dark md:text-[96px]">
            stories by
          </span>
          <span className="font-logo-akshat -mt-2 text-xl font-semibold uppercase leading-none tracking-[0.3em] text-ink md:-mt-2.5 md:text-2xl">
            AKSHAT
          </span>
          <span className="mt-1.5 text-[11px] uppercase tracking-[0.35em] text-olive">
            Never Ending Stories
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 ${className}`}
      aria-label="Stories by Akshat — Home"
    >
      {showMark && (
        <LogoMark className="h-10 w-10 shrink-0 translate-y-0.5 transition-transform duration-500 ease-out group-hover:rotate-12 md:h-11 md:w-11" />
      )}

      <span className="flex -translate-y-2.5 flex-col items-start md:-translate-y-3">
        <span className="font-logo-script text-[60px] leading-none text-marigold-dark md:text-[72px]">
          stories by
        </span>
        <span className="font-logo-akshat -mt-2 text-base font-semibold uppercase leading-none tracking-[0.28em] text-ink md:-mt-2.5 md:text-lg">
          AKSHAT
        </span>
      </span>
    </Link>
  );
}
