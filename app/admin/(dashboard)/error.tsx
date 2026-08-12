"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="font-display text-2xl text-ink">
        This screen didn&apos;t load.
      </h1>
      <p className="mt-3 max-w-md text-sm text-ink-soft">
        Something went wrong loading this part of the dashboard. Your published
        content and enquiries are unaffected — nothing has been lost.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="cursor-pointer bg-marigold-dark px-5 py-2.5 text-sm text-linen transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/admin"
          className="border border-ink/15 px-5 py-2.5 text-sm text-ink transition-colors hover:border-ink/30"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
