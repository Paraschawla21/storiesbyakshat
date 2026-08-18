"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";

interface ClosingCtaProps {
  heading: string;
  subtext: string;
  ctaLabel: string;
  /** Stored like "+91 98765 43210" — optional, hides the call link if unset. */
  phone: string | null;
}

/**
 * The "Let's tell your story next" band. Originally only lived at the
 * bottom of the homepage; rendered here from the root layout instead so it
 * appears on every public page (contact info shouldn't be one click further
 * away just because a visitor landed on /about or a gallery page first).
 */
export default function ClosingCta({ heading, subtext, ctaLabel, phone }: ClosingCtaProps) {
  const pathname = usePathname();

  // tel: links can't contain spaces/formatting — keep the digits and a
  // leading "+" only, while still showing the nicely formatted version.
  const telHref = useMemo(() => {
    if (!phone) return null;
    const cleaned = phone.replace(/[^\d+]/g, "");
    return cleaned ? `tel:${cleaned}` : null;
  }, [phone]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <section className="bg-ink py-24 text-center">
      <Reveal>
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="font-display text-3xl text-linen md:text-4xl">{heading}</h2>
          <p className="mt-4 text-linen/70">{subtext}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button href="/contact" variant="primary">
              {ctaLabel}
            </Button>
            {telHref && (
              <Button
                href={telHref}
                variant="secondary"
                className="border-linen/40 text-linen hover:border-linen hover:text-linen"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
                </svg>
                {phone}
              </Button>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
