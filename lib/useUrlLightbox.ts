"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const PARAM = "photo";

/**
 * Makes "which photo is open in the lightbox" a property of the URL rather
 * than throwaway component state. This means:
 * - Browser back/forward correctly opens/closes/steps through the lightbox
 * - Refreshing the page while a photo is open keeps it open
 * - The exact photo can be linked/shared/bookmarked directly
 *
 * `open()` pushes a new history entry (so the back button closes the
 * lightbox first, rather than leaving the page). `goTo()` (used for
 * next/prev navigation while already open) replaces the current entry
 * instead, so swiping through 20 photos doesn't flood browser history.
 */
export function useUrlLightbox() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get(PARAM);
  const index = raw !== null && !Number.isNaN(Number(raw)) ? Number(raw) : -1;

  function buildUrl(nextIndex: number | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextIndex === null) {
      params.delete(PARAM);
    } else {
      params.set(PARAM, String(nextIndex));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function open(i: number) {
    router.push(buildUrl(i), { scroll: false });
  }

  function goTo(i: number) {
    router.replace(buildUrl(i), { scroll: false });
  }

  function close() {
    router.back();
  }

  return { index, open, goTo, close };
}
