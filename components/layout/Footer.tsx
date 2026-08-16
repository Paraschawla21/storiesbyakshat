"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { getCurrentYear } from "@/lib/format";

interface FooterProps {
  tagline: string;
  signature: string;
  instagramUrl: string;
}

export default function Footer({ tagline, signature, instagramUrl }: FooterProps) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-ink/10 bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo variant="full" />
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {tagline}
          </p>
          <p className="mt-4 font-script text-2xl text-marigold-dark">
            {signature}
          </p>
        </div>

        <div className="flex gap-16">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-olive">
              Explore
            </span>
            <Link
              href="/portfolio"
              className="text-sm text-ink hover:text-marigold-dark"
            >
              Portfolio
            </Link>
            <Link
              href="/photography"
              className="text-sm text-ink hover:text-marigold-dark"
            >
              Photography
            </Link>
            <Link
              href="/films"
              className="text-sm text-ink hover:text-marigold-dark"
            >
              Films
            </Link>
            <Link
              href="/journal"
              className="text-sm text-ink hover:text-marigold-dark"
            >
              Journal
            </Link>
            <Link
              href="/about"
              className="text-sm text-ink hover:text-marigold-dark"
            >
              About
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-olive">
              Connect
            </span>
            <Link
              href="/contact"
              className="text-sm text-ink hover:text-marigold-dark"
            >
              Contact
            </Link>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-ink hover:text-marigold-dark"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-ink/10 py-5 text-center text-xs text-ink-soft">
        © {getCurrentYear()} Stories by Akshat. All rights reserved.
      </div>
    </footer>
  );
}
