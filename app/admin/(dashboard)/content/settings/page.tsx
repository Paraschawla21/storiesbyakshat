import SiteSettingsForm from "@/components/admin/SiteSettingsForm";
import BackLink from "@/components/ui/BackLink";
import { prisma } from "@/lib/prisma";

export default async function AdminSiteSettingsPage() {
  let content = await prisma.siteSettings.findFirst();
  if (!content) {
    content = await prisma.siteSettings.create({ data: {} });
  }

  return (
    <div>
      <BackLink href="/admin/content" label="Site Content" />
      <h1 className="mb-8 font-display text-3xl text-ink">Site Settings</h1>
      <SiteSettingsForm initial={content} />
    </div>
  );
}
