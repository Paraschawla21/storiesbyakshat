import { prisma } from "@/lib/prisma";
import type { Category, EditorialMediaType } from "@/lib/generated/prisma/enums";
import { CATEGORY_LABELS, CATEGORY_TONES, ALL_CATEGORIES } from "@/lib/categories";

export type { Category, EditorialMediaType };
export { CATEGORY_LABELS, CATEGORY_TONES, ALL_CATEGORIES };

/**
 * Next bakes these pages at build time, so a database outage has two very
 * different meanings depending on when it happens:
 *
 *   - At BUILD time, swallowing the error would silently ship a site with
 *     empty galleries and no journal. We'd rather the build fail loudly so
 *     a broken deploy never goes out.
 *   - At RUNTIME (on-demand revalidation, dynamic requests), the visitor
 *     should never see a crash. Degrade to empty content instead — the
 *     page still renders with its empty state, nav, and contact details.
 */
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

async function safeQuery<T>(
  label: string,
  query: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error(`[content] ${label} failed:`, error);
    if (isBuildPhase) throw error;
    return fallback;
  }
}

export async function getPublishedGalleries(category?: Category) {
  return safeQuery(
    "getPublishedGalleries",
    () =>
      prisma.gallery.findMany({
        where: { published: true, ...(category ? { category } : {}) },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        include: { images: { orderBy: { order: "asc" } } },
      }),
    []
  );
}

export async function getGalleryBySlug(slug: string) {
  return safeQuery(
    `getGalleryBySlug(${slug})`,
    () =>
      prisma.gallery.findFirst({
        where: { slug, published: true },
        include: { images: { orderBy: { order: "asc" } } },
      }),
    null
  );
}

export async function getAllGallerySlugs() {
  const galleries = await safeQuery(
    "getAllGallerySlugs",
    () =>
      prisma.gallery.findMany({
        where: { published: true },
        select: { slug: true },
      }),
    [] as { slug: string }[]
  );
  return galleries.map((g) => g.slug);
}

export async function getPublishedPosts() {
  return safeQuery(
    "getPublishedPosts",
    () =>
      prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
      }),
    []
  );
}

export async function getPostBySlug(slug: string) {
  return safeQuery(
    `getPostBySlug(${slug})`,
    () => prisma.blogPost.findFirst({ where: { slug, published: true } }),
    null
  );
}

export async function getAllPostSlugs() {
  const posts = await safeQuery(
    "getAllPostSlugs",
    () =>
      prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true },
      }),
    [] as { slug: string }[]
  );
  return posts.map((p) => p.slug);
}

export function parseTags(tags: string) {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Editorial media, optionally narrowed to a single type.
 * The public site splits these into two pages — /photography (IMAGE)
 * and /films (VIDEO) — while the admin manages them in one place.
 */
export async function getPublishedEditorialImages(
  type?: EditorialMediaType
) {
  return safeQuery(
    `getPublishedEditorialImages(${type ?? "ALL"})`,
    () =>
      prisma.editorialImage.findMany({
        where: { published: true, ...(type ? { type } : {}) },
        orderBy: { order: "asc" },
      }),
    []
  );
}

/**
 * Site content (testimonials, homepage/about copy, page headers, footer +
 * SEO defaults) is editable from /admin. Every getter below falls back to
 * the site's original launch copy — so a DB hiccup, or a fresh environment
 * that hasn't been seeded yet, never leaves a page with missing text.
 */

export async function getTestimonials() {
  return safeQuery(
    "getTestimonials",
    () =>
      prisma.testimonial.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      }),
    [
      {
        id: "fallback-1",
        quote:
          "Akshat didn't just photograph our wedding, he photographed how it felt. We cried looking at the gallery for the first time.",
        name: "Meera & Rohan",
        published: true,
        order: 0,
        createdAt: new Date(0),
      },
      {
        id: "fallback-2",
        quote:
          "Unobtrusive, warm, and somehow everywhere at once. Every important moment was captured without us ever noticing a camera.",
        name: "Anaya & Vikram",
        published: true,
        order: 1,
        createdAt: new Date(0),
      },
      {
        id: "fallback-3",
        quote:
          "The portrait session felt more like an afternoon with a friend than a photoshoot. The photos still don't feel real.",
        name: "Kavya S.",
        published: true,
        order: 2,
        createdAt: new Date(0),
      },
    ]
  );
}

export async function getPhilosophyItems() {
  return safeQuery(
    "getPhilosophyItems",
    () => prisma.philosophyItem.findMany({ orderBy: { order: "asc" } }),
    [
      {
        id: "fallback-1",
        title: "Presence over performance",
        body: "I photograph what's actually happening, not a staged version of it.",
        order: 0,
      },
      {
        id: "fallback-2",
        title: "Light first, always",
        body: "Every shoot is planned around the light, not squeezed around a schedule.",
        order: 1,
      },
      {
        id: "fallback-3",
        title: "The story, not just the shot",
        body: "Every gallery is sequenced to be read like a story from start to finish.",
        order: 2,
      },
    ]
  );
}

const PAGE_HEADER_FALLBACKS: Record<
  string,
  { badge: string; heading: string; subheading: string | null }
> = {
  photography: {
    badge: "Photography",
    heading: "Frames worth lingering on.",
    subheading:
      "A curated selection of standalone frames — moments captured for their own sake, beyond the arc of any single story.",
  },
  portfolio: {
    badge: "Portfolio",
    heading: "Every story, one frame at a time.",
    subheading: null,
  },
  films: {
    badge: "Films",
    heading: "Some moments need movement.",
    subheading:
      "Short films and motion pieces — the stories that a still frame couldn't quite hold.",
  },
  journal: {
    badge: "Journal",
    heading: "Notes from behind the lens.",
    subheading: null,
  },
  contact: {
    badge: "Contact",
    heading: "Let's tell your story.",
    subheading:
      "Fill out the form below with a few details about your event, and Akshat will get back to you within 2-3 days.",
  },
};

export async function getPageHeader(slug: keyof typeof PAGE_HEADER_FALLBACKS) {
  const fallback = PAGE_HEADER_FALLBACKS[slug];
  return safeQuery(
    `getPageHeader(${slug})`,
    () => prisma.pageHeader.findUnique({ where: { slug } }),
    fallback ? { id: `fallback-${slug}`, slug, updatedAt: new Date(0), ...fallback } : null
  );
}

const CATEGORY_TEASER_FALLBACKS: Record<Category, string> = {
  WEDDING: "Full-day coverage, from haldi to the last dance.",
  PRE_WEDDING: "Quiet couple shoots before the big day.",
  PORTRAIT: "Solo, couple, and family sessions in natural light.",
  EVENT: "Birthdays, anniversaries, and everything worth celebrating.",
};

export async function getCategoryTeasers() {
  return safeQuery(
    "getCategoryTeasers",
    () => prisma.categoryTeaser.findMany(),
    ALL_CATEGORIES.map((category) => ({
      id: `fallback-${category}`,
      category,
      blurb: CATEGORY_TEASER_FALLBACKS[category],
    }))
  );
}

const HOMEPAGE_FALLBACK = {
  id: "fallback",
  eyebrow: "every gallery, a story",
  heroHeading: "Wedding & portrait photography, told in golden-hour light.",
  heroImageUrl:
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=2000&q=80",
  heroImageAlt: "A couple walking through a golden field at sunset",
  ctaPrimaryLabel: "View Portfolio",
  ctaSecondaryLabel: "Book a Call",
  featuredBadge: "Recent Stories",
  featuredHeading: "Featured Galleries",
  categoriesHeading: "What We Shoot",
  testimonialsHeading: "Testimonials",
  closingHeading: "Let's tell your story next.",
  closingSubtext:
    "Available for weddings, pre-weddings, portraits, and events across India.",
  closingCtaLabel: "Get in Touch",
  updatedAt: new Date(0),
};

export async function getHomepageContent() {
  return safeQuery(
    "getHomepageContent",
    async () => (await prisma.homepageContent.findFirst()) ?? HOMEPAGE_FALLBACK,
    HOMEPAGE_FALLBACK
  );
}

const ABOUT_FALLBACK = {
  id: "fallback",
  badge: "About",
  heading: "Hi, I'm Akshat.",
  bioParagraph1:
    "I've spent the last decade photographing weddings, portraits, and the small, unrepeatable moments in between. I started with a borrowed film camera at a cousin's wedding and never really put it down.",
  bioParagraph2:
    "My approach is simple: stay out of the way, watch closely, and wait for the light to do most of the work. I'm drawn to golden hour, unscripted laughter, and the quiet minutes before a ceremony begins — the parts most people forget to notice until they see the photos.",
  bioParagraph3:
    "When I'm not shooting, I'm usually developing film in a makeshift darkroom, scouting new locations, or getting embarrassingly emotional at other people's weddings.",
  photoUrl:
    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1000&q=80",
  photoAlt: "Akshat, photographer",
  ctaLabel: "Work With Me",
  philosophyHeading: "My Philosophy",
  updatedAt: new Date(0),
};

export async function getAboutContent() {
  return safeQuery(
    "getAboutContent",
    async () => (await prisma.aboutContent.findFirst()) ?? ABOUT_FALLBACK,
    ABOUT_FALLBACK
  );
}

const SITE_SETTINGS_FALLBACK = {
  id: "fallback",
  siteTitle: "Stories by Akshat - Wedding & Portrait Photography",
  siteDescription:
    "Warm, editorial wedding and portrait photography by Akshat. Stories told in golden-hour light.",
  footerTagline:
    "Wedding, portrait & event photography — every gallery is a story, developed frame by frame.",
  footerSignature: "with love, Akshat",
  instagramUrl: "https://www.instagram.com/storiesbyakshat/",
  contactPhone: null as string | null,
  updatedAt: new Date(0),
};

export async function getSiteSettings() {
  return safeQuery(
    "getSiteSettings",
    async () => (await prisma.siteSettings.findFirst()) ?? SITE_SETTINGS_FALLBACK,
    SITE_SETTINGS_FALLBACK
  );
}
