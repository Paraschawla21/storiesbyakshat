import { notFound } from "next/navigation";
import BlogPostForm from "@/components/admin/BlogPostForm";
import { prisma } from "@/lib/prisma";

export default async function EditJournalPostPage(
  props: PageProps<"/admin/journal/[id]">
) {
  const { id } = await props.params;
  const post = await prisma.blogPost.findUnique({ where: { id } });

  if (!post) notFound();

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl text-ink">{post.title}</h1>
      <BlogPostForm
        initial={{
          id: post.id,
          title: post.title,
          coverImageUrl: post.coverImageUrl,
          coverWidth: post.coverWidth,
          coverHeight: post.coverHeight,
          content: post.content,
          excerpt: post.excerpt ?? "",
          tags: post.tags,
          published: post.published,
        }}
      />
    </div>
  );
}
