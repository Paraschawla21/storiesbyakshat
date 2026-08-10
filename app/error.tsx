"use client";

import { useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-accent text-3xl text-marigold-dark">
        Something went wrong
      </p>
      <h1 className="mt-3 font-display text-3xl text-ink md:text-4xl">
        This frame didn&apos;t develop.
      </h1>
      <p className="mt-4 text-ink-soft">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      <div className="mt-8 flex gap-4">
        <Button onClick={reset} variant="primary">
          Try again
        </Button>
        <Button href="/" variant="secondary">
          Back home
        </Button>
      </div>
      <Link href="/contact" className="mt-6 text-sm text-ink-soft hover:text-marigold-dark">
        Still stuck? Get in touch
      </Link>
    </div>
  );
}
