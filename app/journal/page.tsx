import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import { formatDateLong } from "@/lib/format";
import { getPublishedPosts, parseTags } from "@/lib/content";

export const metadata: Metadata = {
  title: "Journal | Stories by Akshat",
  description: "Wedding stories, tips, and behind-the-scenes notes.",
};

export default async function JournalPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Badge tone="rosewood" className="mb-4">
        Journal
      </Badge>
      <h1 className="mb-12 font-display text-3xl leading-tight text-ink md:text-4xl">
        Notes from behind the lens.
      </h1>

      <div className="flex flex-col gap-12">
        {posts.map((post, i) => (
          <Reveal key={post.id} delay={i * 0.06}>
            <Link
              href={`/journal/${post.slug}`}
              className="group grid gap-6 sm:grid-cols-[240px_1fr]"
            >
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
                <Image
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
        ))}
      </div>
    </div>
  );
}
