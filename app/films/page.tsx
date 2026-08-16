import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import FilmsGrid from "@/components/gallery/FilmsGrid";
import { getPublishedEditorialImages, getPageHeader } from "@/lib/content";

export const metadata: Metadata = {
  title: "Films | Stories By Akshat",
  description:
    "Short wedding films and motion pieces by Akshat — moments that needed movement and sound to tell properly.",
};

export default async function FilmsPage() {
  const [films, header] = await Promise.all([
    getPublishedEditorialImages("VIDEO"),
    getPageHeader("films"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Reveal>
        <Badge tone="rosewood" className="mb-4">
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

      {films.length > 0 ? (
        <FilmsGrid films={films} />
      ) : (
        <p className="text-ink-soft">No films published yet — check back soon.</p>
      )}
    </div>
  );
}
