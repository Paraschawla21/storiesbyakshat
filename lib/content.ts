import { prisma } from "@/lib/prisma";
import type { Category, EditorialMediaType } from "@/lib/generated/prisma/enums";
import { CATEGORY_LABELS, CATEGORY_TONES, ALL_CATEGORIES } from "@/lib/categories";

export type { Category, EditorialMediaType };
export { CATEGORY_LABELS, CATEGORY_TONES, ALL_CATEGORIES };

export async function getPublishedGalleries(category?: Category) {
  return prisma.gallery.findMany({
    where: { published: true, ...(category ? { category } : {}) },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { order: "asc" } } },
  });
}

export async function getGalleryBySlug(slug: string) {
  return prisma.gallery.findFirst({
    where: { slug, published: true },
    include: { images: { orderBy: { order: "asc" } } },
  });
}

export async function getAllGallerySlugs() {
  const galleries = await prisma.gallery.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return galleries.map((g) => g.slug);
}

export async function getPublishedPosts() {
  return prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({ where: { slug, published: true } });
}

export async function getAllPostSlugs() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return posts.map((p) => p.slug);
}

export function parseTags(tags: string) {
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
  return prisma.editorialImage.findMany({
    where: { published: true, ...(type ? { type } : {}) },
    orderBy: { order: "asc" },
  });
}
