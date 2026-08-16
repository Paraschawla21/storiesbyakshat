import HomepageContentForm from "@/components/admin/HomepageContentForm";
import BackLink from "@/components/ui/BackLink";
import { prisma } from "@/lib/prisma";

export default async function AdminHomepageContentPage() {
  let content = await prisma.homepageContent.findFirst();
  if (!content) {
    content = await prisma.homepageContent.create({ data: {} });
  }

  return (
    <div>
      <BackLink href="/admin/content" label="Site Content" />
      <h1 className="mb-8 font-display text-3xl text-ink">Homepage</h1>
      <HomepageContentForm initial={content} />
    </div>
  );
}
