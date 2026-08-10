import Badge from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import MasonryGrid from "@/components/gallery/MasonryGrid";
import GalleryCard from "@/components/gallery/GalleryCard";
import { getPublishedGalleries, ALL_CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/content";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio | Stories by Akshat",
  description:
    "Wedding, pre-wedding, portrait, and event photography galleries by Akshat.",
};

const filters: { label: string; value?: Category }[] = [
  { label: "All" },
  ...ALL_CATEGORIES.map((value) => ({ label: CATEGORY_LABELS[value], value })),
];

export default async function PortfolioPage(props: PageProps<"/portfolio">) {
  const searchParams = await props.searchParams;
  const category = (searchParams.category as Category | undefined) ?? undefined;

  const filtered = await getPublishedGalleries(category);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Reveal>
        <Badge tone="marigold" className="mb-4">
          Portfolio
        </Badge>
        <h1 className="mb-8 font-display text-3xl leading-tight text-ink md:text-4xl">
          Every story, one frame at a time.
        </h1>
      </Reveal>

      <div className="mb-10 flex flex-wrap gap-3">
        {filters.map((f) => {
          const active = f.value === category || (!f.value && !category);
          const href = f.value ? `/portfolio?category=${f.value}` : "/portfolio";
          return (
            <Link
              key={f.label}
              href={href}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-[background-color,border-color,color,transform,box-shadow] duration-300 ease-out ${
                active
                  ? "border-marigold bg-marigold text-linen shadow-[0_4px_14px_-6px_rgba(201,138,59,0.7)]"
                  : "border-ink/15 text-ink hover:-translate-y-0.5 hover:border-marigold hover:text-marigold-dark"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {filtered.length > 0 ? (
        <MasonryGrid>
          {filtered.map((gallery, i) => (
            <GalleryCard key={gallery.id} gallery={gallery} priority={i < 3} />
          ))}
        </MasonryGrid>
      ) : (
        <p className="text-ink-soft">No galleries in this category yet.</p>
      )}
    </div>
  );
}
