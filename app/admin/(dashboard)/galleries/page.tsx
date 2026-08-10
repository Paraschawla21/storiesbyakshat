import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS, CATEGORY_TONES } from "@/lib/content";

export default async function AdminGalleriesPage() {
  const galleries = await prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { images: true } } },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Galleries</h1>
        <Button href="/admin/galleries/new" variant="primary" className="px-5 py-2.5">
          + New Gallery
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {galleries.map((g) => (
          <Link
            key={g.id}
            href={`/admin/galleries/${g.id}`}
            className="flex items-center gap-4 rounded-xl border border-ink/10 bg-paper p-4 hover:border-marigold"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
              <Image src={g.coverImageUrl} alt={g.title} fill sizes="64px" className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-display text-lg text-ink">{g.title}</p>
              <p className="text-sm text-ink-soft">
                {g._count.images} images
                {g.location ? ` · ${g.location}` : ""}
              </p>
            </div>
            <Badge tone={CATEGORY_TONES[g.category]}>{CATEGORY_LABELS[g.category]}</Badge>
            <Badge tone={g.published ? "marigold" : "olive"}>
              {g.published ? "Published" : "Draft"}
            </Badge>
          </Link>
        ))}

        {galleries.length === 0 && (
          <p className="text-ink-soft">No galleries yet. Create your first one.</p>
        )}
      </div>
    </div>
  );
}
