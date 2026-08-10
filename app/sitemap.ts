import type { MetadataRoute } from "next";
import { getAllGallerySlugs, getAllPostSlugs } from "@/lib/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [gallerySlugs, postSlugs] = await Promise.all([
    getAllGallerySlugs(),
    getAllPostSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/portfolio`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/photography`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/films`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/journal`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const galleryRoutes: MetadataRoute.Sitemap = gallerySlugs.map((slug) => ({
    url: `${SITE_URL}/portfolio/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const postRoutes: MetadataRoute.Sitemap = postSlugs.map((slug) => ({
    url: `${SITE_URL}/journal/${slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...galleryRoutes, ...postRoutes];
}
