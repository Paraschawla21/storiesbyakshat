import PageHeaderForm from "@/components/admin/PageHeaderForm";
import BackLink from "@/components/ui/BackLink";
import { prisma } from "@/lib/prisma";

const DISPLAY_NAMES: Record<string, string> = {
  photography: "Photography",
  portfolio: "Portfolio",
  films: "Films",
  journal: "Journal",
  contact: "Contact",
};

const ORDER = ["photography", "portfolio", "films", "journal", "contact"];

export default async function AdminPageHeadersPage() {
  const headers = await prisma.pageHeader.findMany();
  const sorted = [...headers].sort(
    (a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug)
  );

  return (
    <div>
      <BackLink href="/admin/content" label="Site Content" />
      <h1 className="mb-8 font-display text-3xl text-ink">Page Headers</h1>
      <div className="flex flex-col gap-6">
        {sorted.map((header) => (
          <PageHeaderForm
            key={header.slug}
            title={DISPLAY_NAMES[header.slug] ?? header.slug}
            initial={{
              slug: header.slug,
              badge: header.badge,
              heading: header.heading,
              subheading: header.subheading ?? "",
            }}
          />
        ))}
      </div>
    </div>
  );
}
