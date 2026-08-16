import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import EditorialGrid from "@/components/gallery/EditorialGrid";
import { getPublishedEditorialImages, getPageHeader } from "@/lib/content";

export const metadata: Metadata = {
  title: "Photography | Stories By Akshat",
  description:
    "A curated stream of editorial and fine-art photographs from shoots across weddings, portraits, and beyond.",
};

export default async function PhotographyPage() {
  const [images, header] = await Promise.all([
    getPublishedEditorialImages("IMAGE"),
    getPageHeader("photography"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Reveal>
        <Badge tone="olive" className="mb-4">
          {header?.badge}
        </Badge>
        <h1 className="mb-4 font-display text-3xl leading-tight text-ink md:text-4xl">
          {header?.heading}
        </h1>
        {header?.subheading && (
          <p className="mb-10 max-w-xl text-lg text-ink-soft">
            {header.subheading}
          </p>
        )}
      </Reveal>

      {images.length > 0 ? (
        <EditorialGrid images={images} />
      ) : (
        <p className="text-ink-soft">Nothing here yet — check back soon.</p>
      )}
    </div>
  );
}
