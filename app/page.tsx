import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import MasonryGrid from "@/components/gallery/MasonryGrid";
import GalleryCard from "@/components/gallery/GalleryCard";
import Badge from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import HeroParallax from "@/components/home/HeroParallax";
import {
  getPublishedGalleries,
  getTestimonials,
  getCategoryTeasers,
  getHomepageContent,
  CATEGORY_LABELS,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Stories by Akshat — Wedding, Pre-Wedding & Portrait Photography",
  description:
    "Warm, editorial wedding, pre-wedding, portrait, and event photography by Akshat. Every gallery is a story, told in golden-hour light.",
};

export default async function Home() {
  const [galleries, testimonials, categoryTeasers, content] = await Promise.all([
    getPublishedGalleries(),
    getTestimonials(),
    getCategoryTeasers(),
    getHomepageContent(),
  ]);
  const featured = galleries.slice(0, 6);

  const categories = categoryTeasers.map((teaser) => ({
    label: CATEGORY_LABELS[teaser.category],
    href: `/portfolio?category=${teaser.category}`,
    image: galleries.find((g) => g.category === teaser.category)?.coverImageUrl,
    blurb: teaser.blurb,
  }));

  return (
    <div className="flex flex-col">
      {/* Full-bleed editorial hero */}
      <section className="relative h-[85svh] min-h-[560px] w-full overflow-hidden">
        <HeroParallax src={content.heroImageUrl} alt={content.heroImageAlt} />
        <div className="relative flex h-full max-w-6xl flex-col justify-end gap-6 px-6 pb-20 mx-auto">
          <Reveal direction="up">
            <p className="font-accent text-2xl text-linen/90 md:text-3xl">
              {content.eyebrow}
            </p>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <h1 className="max-w-2xl font-display text-4xl leading-[1.1] text-linen md:text-6xl">
              {content.heroHeading}
            </h1>
          </Reveal>
          <Reveal direction="up" delay={0.2}>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button href="/portfolio" variant="primary">
                {content.ctaPrimaryLabel}
              </Button>
              <Button
                href="/contact"
                variant="secondary"
                className="border-linen/40 text-linen hover:border-linen hover:text-linen"
              >
                {content.ctaSecondaryLabel}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured masonry pull */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <Badge tone="marigold" className="mb-3">
                {content.featuredBadge}
              </Badge>
              <h2 className="font-display text-3xl text-ink md:text-4xl">
                {content.featuredHeading}
              </h2>
            </div>
            <Link
              href="/portfolio"
              className="link-underline hidden shrink-0 text-sm font-medium text-marigold-dark md:block"
            >
              View all &rarr;
            </Link>
          </div>
        </Reveal>

        {featured.length > 0 ? (
          <MasonryGrid>
            {featured.map((gallery) => (
              <GalleryCard key={gallery.id} gallery={gallery} />
            ))}
          </MasonryGrid>
        ) : (
          <p className="text-ink-soft">New galleries coming soon.</p>
        )}

        <div className="mt-10 text-center md:hidden">
          <Button href="/portfolio" variant="ghost">
            View all galleries &rarr;
          </Button>
        </div>
      </section>

      {/* Category teasers */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="mb-10 font-display text-3xl text-ink md:text-4xl">
              {content.categoriesHeading}
            </h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, i) => (
              <Reveal key={cat.label} delay={i * 0.08}>
                <Link
                  href={cat.href}
                  className="group relative block h-72 overflow-hidden rounded-2xl"
                >
                  {cat.image && (
                    <SafeImage
                      src={cat.image}
                      alt={cat.label}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent transition-opacity duration-500 group-hover:from-ink/90" />
                  <div className="absolute inset-x-0 bottom-0 p-6 transition-transform duration-500 ease-out group-hover:-translate-y-1">
                    <h3 className="font-display text-2xl text-linen">
                      {cat.label}
                    </h3>
                    <p className="mt-1 text-sm text-linen/80">{cat.blurb}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <h2 className="mb-10 font-display text-3xl text-ink md:text-4xl">
            {content.testimonialsHeading}
          </h2>
        </Reveal>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.1}>
              <figure className="h-full rounded-2xl border border-ink/10 bg-linen p-6 transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-marigold/40 hover:shadow-[0_12px_32px_-16px_rgba(43,27,18,0.25)]">
                <blockquote className="font-display text-lg leading-relaxed text-ink">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 font-accent text-xl text-marigold-dark">
                  {t.name}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink py-24 text-center">
        <Reveal>
          <div className="mx-auto max-w-2xl px-6">
            <h2 className="font-display text-3xl text-linen md:text-4xl">
              {content.closingHeading}
            </h2>
            <p className="mt-4 text-linen/70">{content.closingSubtext}</p>
            <div className="mt-8">
              <Button href="/contact" variant="primary">
                {content.closingCtaLabel}
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
