import AboutContentForm from "@/components/admin/AboutContentForm";
import PhilosophyManager from "@/components/admin/PhilosophyManager";
import BackLink from "@/components/ui/BackLink";
import { prisma } from "@/lib/prisma";

export default async function AdminAboutContentPage() {
  let content = await prisma.aboutContent.findFirst();
  if (!content) {
    content = await prisma.aboutContent.create({ data: {} });
  }

  const philosophyItems = await prisma.philosophyItem.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <BackLink href="/admin/content" label="Site Content" />
      <h1 className="mb-8 font-display text-3xl text-ink">About Page</h1>
      <AboutContentForm initial={content} />
      <PhilosophyManager initialItems={philosophyItems} />
    </div>
  );
}
