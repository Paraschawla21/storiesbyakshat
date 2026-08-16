"use client";

import { Suspense } from "react";
import Lightbox from "yet-another-react-lightbox";
import type {} from "yet-another-react-lightbox/plugins/video";
import type { Slide } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { EditorialVideo, VideoLightboxSlide, videoMimeType } from "./EditorialGrid";
import { useUrlLightbox } from "@/lib/useUrlLightbox";
import { withUprightHyphens } from "@/components/ui/UprightHyphen";

interface FilmItemData {
  id: string;
  url: string;
  width: number;
  height: number;
  caption?: string | null;
}

/**
 * Films are few and meant to be watched, not skimmed like a photo wall — an
 * equal-width masonry column (great for dozens of photo thumbnails) squashes
 * a portrait film down to a sliver and makes it feel like an afterthought.
 * Instead: a 3-column grid pairs a landscape clip (2 parts — wide, cinematic)
 * with a portrait clip (1 part) side by side in the same row, giving each
 * orientation a size proportional to its shape. `grid-auto-flow: dense` lets
 * mixed sequences (two landscapes in a row, two portraits in a row, etc.)
 * pack cleanly without leaving gaps. Each thumbnail gets real native video
 * controls (play/pause/seek/volume/fullscreen); a small expand button in the
 * corner opens the large lightbox.
 */
function FilmsGridInner({ films }: { films: FilmItemData[] }) {
  const { index, open, goTo, close } = useUrlLightbox();

  const slides: Slide[] = films.map((item) => ({
    type: "video" as const,
    width: item.width,
    height: item.height,
    autoPlay: true,
    muted: true,
    loop: true,
    controls: true,
    sources: [{ src: item.url, type: videoMimeType(item.url) }],
  }));

  return (
    <>
      <div className="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-3 lg:[grid-auto-flow:dense] lg:gap-x-8 lg:gap-y-14">
        {films.map((item, i) => {
          const isLandscape = item.width >= item.height;
          return (
            <div
              key={item.id}
              className={`group relative block text-left ${
                isLandscape ? "lg:col-span-2" : "lg:col-span-1"
              }`}
            >
              <div className="relative mx-auto overflow-hidden rounded-xl shadow-[0_24px_60px_-28px_rgba(43,27,18,0.4)]">
                <EditorialVideo
                  src={item.url}
                  width={item.width}
                  height={item.height}
                  controls
                  className={isLandscape ? "" : "mx-auto max-h-[70vh] w-auto"}
                />
                <button
                  onClick={() => open(i)}
                  aria-label={`Open video ${i + 1} of ${films.length} in fullscreen`}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink/60 text-linen opacity-0 transition-opacity duration-200 hover:bg-ink/80 focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                </button>
              </div>
              {item.caption && (
                <p className="mt-3 text-center font-accent text-xl text-ink-soft lg:text-left">
                  {withUprightHyphens(item.caption)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Lightbox
        open={index >= 0}
        close={close}
        index={Math.max(index, 0)}
        slides={slides}
        on={{ view: ({ index: i }) => goTo(i) }}
        render={{
          slide: ({ slide, offset }) =>
            slide.type === "video" ? <VideoLightboxSlide slide={slide} offset={offset} /> : undefined,
        }}
      />
    </>
  );
}

export default function FilmsGrid(props: { films: FilmItemData[] }) {
  return (
    <Suspense fallback={null}>
      <FilmsGridInner {...props} />
    </Suspense>
  );
}

