import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { formatDateLong } from "@/lib/format";
import { getAllPostSlugs, getPostBySlug, parseTags } from "@/lib/content";

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/journal/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Stories by Akshat`,
    description: post.excerpt ?? undefined,
    openGraph: {
      images: [{ url: post.coverImageUrl }],
    },
  };
}

export default async function BlogPostPage(props: PageProps<"/journal/[slug]">) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-3 flex flex-wrap gap-2">
        {parseTags(post.tags).map((tag) => (
          <Badge key={tag} tone="rosewood">
            {tag}
          </Badge>
        ))}
      </div>
      <h1 className="mb-4 font-display text-4xl leading-tight text-ink md:text-5xl">
        {post.title}
      </h1>
      <p className="mb-8 font-accent text-xl text-marigold-dark">
        {formatDateLong(post.publishedAt)}
      </p>

      <div className="relative mb-10 aspect-16/9 overflow-hidden rounded-2xl">
        <Image
          src={post.coverImageUrl}
          alt={post.title}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 768px) 768px, 100vw"
        />
      </div>

      <div
        className="flex flex-col gap-5 text-lg leading-relaxed text-ink-soft [&_a]:text-marigold-dark [&_a]:underline [&_a]:underline-offset-4"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
