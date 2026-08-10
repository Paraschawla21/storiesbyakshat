"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminLink {
  href: string;
  label: string;
}

export default function AdminNavLinks({
  links,
  variant = "sidebar",
}: {
  links: AdminLink[];
  variant?: "sidebar" | "mobile";
}) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        // "/admin" (Dashboard) needs an exact match — every admin route
        // starts with "/admin", so startsWith would always highlight it.
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname?.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              variant === "sidebar"
                ? `rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-linen hover:text-marigold-dark ${
                    active ? "bg-linen text-marigold-dark" : "text-ink-soft"
                  }`
                : `transition-colors hover:text-marigold-dark ${
                    active ? "font-semibold text-marigold-dark" : "text-ink-soft"
                  }`
            }
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
