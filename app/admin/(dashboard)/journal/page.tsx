import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";

export default async function AdminJournalPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Journal</h1>
        <Button href="/admin/journal/new" variant="primary" className="px-5 py-2.5">
          + New Post
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/admin/journal/${p.id}`}
            className="flex items-center gap-4 rounded-xl border border-ink/10 bg-paper p-4 hover:border-marigold"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
              <Image src={p.coverImageUrl} alt={p.title} fill sizes="64px" className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-display text-lg text-ink">{p.title}</p>
              <p className="text-sm text-ink-soft">{p.excerpt}</p>
            </div>
            <Badge tone={p.published ? "marigold" : "olive"}>
              {p.published ? "Published" : "Draft"}
            </Badge>
          </Link>
        ))}

        {posts.length === 0 && (
          <p className="text-ink-soft">No posts yet. Write your first one.</p>
        )}
      </div>
    </div>
  );
}
