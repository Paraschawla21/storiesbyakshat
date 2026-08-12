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
        orderBy: { createdAt: "desc" },
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
