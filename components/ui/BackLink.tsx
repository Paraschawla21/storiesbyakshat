import Link from "next/link";

export default function BackLink({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-marigold-dark ${className}`}
    >
      <span
        aria-hidden
        className="transition-transform duration-300 ease-out group-hover:-translate-x-0.5"
      >
        &larr;
      </span>
      {label}
    </Link>
  );
}
