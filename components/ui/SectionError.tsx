"use client";

import { useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

/**
 * Shared body for per-segment error boundaries. Because these live inside
 * the root layout, the nav, footer and film-grain all survive — the visitor
 * loses one section, not the whole site.
 */
export default function SectionError({
  error,
  reset,
  title = "This frame didn't develop.",
  description = "We couldn't load this section. You can try again, or explore the rest of the site.",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}) {
  useEffect(() => {
    console.error("[section-error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-accent text-3xl text-marigold-dark">
        Something went wrong
      </p>
      <h1 className="mt-3 font-display text-3xl text-ink md:text-4xl">{title}</h1>
      <p className="mt-4 text-ink-soft">{description}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button onClick={reset} variant="primary">
          Try again
        </Button>
        <Button href="/" variant="secondary">
          Back home
        </Button>
      </div>
      <Link
        href="/contact"
        className="mt-6 text-sm text-ink-soft hover:text-marigold-dark"
      >
        Still stuck? Get in touch
      </Link>
    </div>
  );
}
