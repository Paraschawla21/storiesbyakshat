import Link from "next/link";

const cards = [
  {
    href: "/admin/content/homepage",
    title: "Homepage",
    description: "Hero text, image, and call-to-action copy",
  },
  {
    href: "/admin/content/about",
    title: "About Page",
    description: "Bio, photo, and philosophy section",
  },
  {
    href: "/admin/content/testimonials",
    title: "Testimonials",
    description: "Client quotes shown on the homepage",
  },
  {
    href: "/admin/content/pages",
    title: "Page Headers",
    description:
      "Badge, heading, and subtext for Photography, Portfolio, Films, Journal, and Contact",
  },
  {
    href: "/admin/content/settings",
    title: "Site Settings",
    description: "Footer text, Instagram link, and SEO defaults",
  },
];

export default function AdminContentHubPage() {
  return (
    <div>
      <h1 className="mb-8 font-display text-3xl text-ink">Site Content</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-ink/10 bg-paper p-6 transition-colors hover:border-marigold"
          >
            <h2 className="mb-1 font-display text-lg text-ink">{card.title}</h2>
            <p className="text-sm text-ink-soft">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
