import { revalidatePath } from "next/cache";

/**
 * Public pages are statically rendered for speed, which means they'd keep
 * serving a cached copy after Akshat publishes something. These helpers
 * purge the affected pages so new work appears on the site immediately.
 *
 * Called from the admin API routes after any create/update/delete.
 */

/** Galleries feed the homepage, the portfolio index, and their own story pages. */
export function revalidateGalleries(slug?: string) {
  revalidatePath("/"); // featured galleries + category teasers
  revalidatePath("/portfolio");
  revalidatePath("/portfolio/[slug]", "page"); // all story pages
  if (slug) revalidatePath(`/portfolio/${slug}`);
  revalidatePath("/sitemap.xml");
}

/** Journal posts feed the journal index and their own post pages. */
export function revalidateJournal(slug?: string) {
  revalidatePath("/journal");
  revalidatePath("/journal/[slug]", "page");
  if (slug) revalidatePath(`/journal/${slug}`);
  revalidatePath("/sitemap.xml");
}

/** Editorial media splits across the Photography and Films pages. */
export function revalidateEditorial() {
  revalidatePath("/photography");
  revalidatePath("/films");
}
