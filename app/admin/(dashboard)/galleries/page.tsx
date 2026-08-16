import Button from "@/components/ui/Button";
import GalleriesManager from "@/components/admin/GalleriesManager";
import { prisma } from "@/lib/prisma";

export default async function AdminGalleriesPage() {
  const galleries = await prisma.gallery.findMany({
    orderBy: { order: "asc" },
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

      <GalleriesManager
        initialGalleries={galleries.map((g) => ({
          id: g.id,
          title: g.title,
          slug: g.slug,
          category: g.category,
          coverImageUrl: g.coverImageUrl,
          location: g.location,
          published: g.published,
          order: g.order,
          imageCount: g._count.images,
        }))}
      />
    </div>
  );
}
