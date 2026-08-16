import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import { formatDateLong } from "@/lib/format";
import { getPublishedPosts, getPageHeader, parseTags } from "@/lib/content";

export const metadata: Metadata = {
  title: "Journal | Stories by Akshat",
  description: "Wedding stories, tips, and behind-the-scenes notes.",
};

export default async function JournalPage() {
  const [posts, header] = await Promise.all([
    getPublishedPosts(),
    getPageHeader("journal"),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Badge tone="rosewood" className="mb-4">
        {header?.badge}
      </Badge>
      <h1
        className={`font-display text-3xl leading-tight text-ink md:text-4xl ${
          header?.subheading ? "mb-4" : "mb-12"
        }`}
      >
        {header?.heading}
      </h1>
      {header?.subheading && (
        <p className="mb-8 max-w-xl text-lg text-ink-soft">{header.subheading}</p>
      )}

      <div className="flex flex-col gap-12">
        {posts.length === 0 ? (
          <p className="text-ink-soft">
            No stories published yet — check back soon.
          </p>
        ) : (
          posts.map((post, i) => (
          <Reveal key={post.id} delay={i * 0.06}>
            <Link
              href={`/journal/${post.slug}`}
              className="group grid gap-6 sm:grid-cols-[240px_1fr]"
            >
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
                <SafeImage
                  src={post.coverImageUrl}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  sizes="(min-width: 640px) 240px, 100vw"
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="mb-2 flex flex-wrap gap-2">
                  {parseTags(post.tags).map((tag) => (
                    <Badge key={tag} tone="olive">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h2 className="font-display text-2xl text-ink transition-colors duration-300 group-hover:text-marigold-dark">
                  {post.title}
                </h2>
                <p className="mt-2 text-ink-soft">{post.excerpt}</p>
                <span className="mt-3 font-accent text-lg text-marigold-dark">
                  {formatDateLong(post.publishedAt)}
                </span>
              </div>
            </Link>
          </Reveal>
          ))
        )}
      </div>
    </div>
  );
}
