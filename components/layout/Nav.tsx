"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";

const links = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/photography", label: "Photography" },
  { href: "/films", label: "Films" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let raf = 0;

    const updateScrolled = () => {
      raf = 0;
      // Hysteresis: enter the "scrolled" state past 56px, only leave it
      // once back under 24px. This prevents rapid on/off flicker from
      // small scroll jitters (trackpads, rubber-banding) right at a
      // single threshold.
      setScrolled((prev) => {
        const y = window.scrollY;
        if (!prev && y > 56) return true;
        if (prev && y < 24) return false;
        return prev;
      });
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(updateScrolled);
    };

    updateScrolled();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-[background-color,box-shadow] duration-300 ease-out ${
          scrolled
            ? "bg-paper/95 shadow-[0_1px_0_0_rgba(43,27,18,0.08)] backdrop-blur-sm"
            : "bg-transparent shadow-none"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:h-20">
          <Logo />

          <nav className="hidden items-center gap-9 lg:flex">
            {links.map((link) => {
              const active = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative py-1 text-xs font-medium uppercase tracking-widest transition-colors hover:text-marigold-dark ${
                    active ? "text-marigold-dark" : "text-ink"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-px origin-center scale-x-0 bg-marigold transition-transform duration-300 ease-out group-hover:scale-x-100 ${
                      active ? "scale-x-100" : ""
                    }`}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </nav>

          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center lg:hidden"
          >
            <span
              className={`absolute left-1/2 top-1/2 h-[1.5px] w-6 -translate-x-1/2 bg-ink transition-transform duration-300 ease-out ${
                open ? "-translate-y-1/2 rotate-45" : "translate-y-[calc(-50%-6px)]"
              }`}
            />
            <span
              className={`absolute left-1/2 top-1/2 h-[1.5px] w-6 -translate-x-1/2 -translate-y-1/2 bg-ink transition-opacity duration-300 ease-out ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-1/2 top-1/2 h-[1.5px] w-6 -translate-x-1/2 bg-ink transition-transform duration-300 ease-out ${
                open ? "-translate-y-1/2 -rotate-45" : "translate-y-[calc(-50%+6px)]"
              }`}
            />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-7 bg-paper lg:hidden"
          >
            {links.map((link, i) => {
              const active = pathname?.startsWith(link.href);
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`group relative py-1 text-sm font-medium uppercase tracking-widest transition-colors hover:text-marigold-dark ${
                      active ? "text-marigold-dark" : "text-ink"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute inset-x-0 -bottom-0.5 h-px origin-center scale-x-0 bg-marigold transition-transform duration-300 ease-out group-hover:scale-x-100 ${
                        active ? "scale-x-100" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
