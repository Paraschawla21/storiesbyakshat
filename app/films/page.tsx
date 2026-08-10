import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import EditorialGrid from "@/components/gallery/EditorialGrid";
import { getPublishedEditorialImages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Films | Stories By Akshat",
  description:
    "Short wedding films and motion pieces by Akshat — moments that needed movement and sound to tell properly.",
};

export default async function FilmsPage() {
  const films = await getPublishedEditorialImages("VIDEO");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Reveal>
        <Badge tone="rosewood" className="mb-4">
          Films
        </Badge>
        <h1 className="mb-4 font-display text-3xl leading-tight text-ink md:text-4xl">
          Some moments need movement.
        </h1>
        <p className="mb-10 max-w-xl text-lg text-ink-soft">
          Short films and motion pieces — the stories that a still frame
          couldn&apos;t quite hold.
        </p>
      </Reveal>

      {films.length > 0 ? (
        <EditorialGrid images={films} />
      ) : (
        <p className="text-ink-soft">No films published yet — check back soon.</p>
      )}
    </div>
  );
}
