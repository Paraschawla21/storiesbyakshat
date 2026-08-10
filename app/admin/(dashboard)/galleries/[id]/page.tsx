import { notFound } from "next/navigation";
import GalleryForm from "@/components/admin/GalleryForm";
import { prisma } from "@/lib/prisma";

export default async function EditGalleryPage(
  props: PageProps<"/admin/galleries/[id]">
) {
  const { id } = await props.params;
  const gallery = await prisma.gallery.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });

  if (!gallery) notFound();

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl text-ink">{gallery.title}</h1>
      <GalleryForm
        initial={{
          id: gallery.id,
          title: gallery.title,
          category: gallery.category,
          coverImageUrl: gallery.coverImageUrl,
          coverWidth: gallery.coverWidth,
          coverHeight: gallery.coverHeight,
          storyText: gallery.storyText ?? "",
          eventDate: gallery.eventDate ? gallery.eventDate.toISOString() : "",
          location: gallery.location ?? "",
          published: gallery.published,
          images: gallery.images.map((img) => ({
            id: img.id,
            url: img.url,
            width: img.width,
            height: img.height,
            caption: img.caption ?? "",
          })),
        }}
      />
    </div>
  );
}
