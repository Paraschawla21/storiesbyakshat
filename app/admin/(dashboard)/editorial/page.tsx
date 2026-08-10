import EditorialManager from "@/components/admin/EditorialManager";
import { prisma } from "@/lib/prisma";

export default async function AdminEditorialPage() {
  const images = await prisma.editorialImage.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl text-ink">Photography &amp; Films</h1>
      <EditorialManager initialImages={images} />
    </div>
  );
}
