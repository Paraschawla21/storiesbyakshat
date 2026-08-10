import Link from "next/link";
import Button from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [
    newMessages,
    publishedGalleries,
    draftGalleries,
    publishedPosts,
    draftPosts,
    photoCount,
    filmCount,
  ] = await Promise.all([
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.gallery.count({ where: { published: true } }),
    prisma.gallery.count({ where: { published: false } }),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.blogPost.count({ where: { published: false } }),
    prisma.editorialImage.count({ where: { type: "IMAGE" } }),
    prisma.editorialImage.count({ where: { type: "VIDEO" } }),
  ]);

  const stats = [
    { label: "New Inquiries", value: newMessages, href: "/admin/messages" },
    { label: "Published Galleries", value: publishedGalleries, href: "/admin/galleries" },
    { label: "Draft Galleries", value: draftGalleries, href: "/admin/galleries" },
    { label: "Published Posts", value: publishedPosts, href: "/admin/journal" },
    { label: "Draft Posts", value: draftPosts, href: "/admin/journal" },
    { label: "Photography", value: photoCount, href: "/admin/editorial" },
    { label: "Films", value: filmCount, href: "/admin/editorial" },
  ];

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl text-ink">Dashboard</h1>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-ink/10 bg-paper p-5 transition-colors hover:border-marigold"
          >
            <p className="font-display text-3xl text-ink">{s.value}</p>
            <p className="mt-1 text-sm text-ink-soft">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <Button href="/admin/galleries/new" variant="primary">
          + New Gallery
        </Button>
        <Button href="/admin/journal/new" variant="secondary">
          + New Post
        </Button>
        <Button href="/admin/editorial" variant="secondary">
          + Photo / Film
        </Button>
      </div>
    </div>
  );
}
