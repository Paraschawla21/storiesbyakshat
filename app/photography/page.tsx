import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import EditorialGrid from "@/components/gallery/EditorialGrid";
import { getPublishedEditorialImages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Photography | Stories By Akshat",
  description:
    "A curated stream of editorial and fine-art photographs from shoots across weddings, portraits, and beyond.",
};

export default async function PhotographyPage() {
  const images = await getPublishedEditorialImages("IMAGE");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Reveal>
        <Badge tone="olive" className="mb-4">
          Photography
        </Badge>
        <h1 className="mb-4 font-display text-3xl leading-tight text-ink md:text-4xl">
          Frames worth lingering on.
        </h1>
        <p className="mb-10 max-w-xl text-lg text-ink-soft">
          A rotating stream of favourite photographs — the ones that live
          outside any single story.
        </p>
      </Reveal>

      {images.length > 0 ? (
        <EditorialGrid images={images} />
      ) : (
        <p className="text-ink-soft">Nothing here yet — check back soon.</p>
      )}
    </div>
  );
}
