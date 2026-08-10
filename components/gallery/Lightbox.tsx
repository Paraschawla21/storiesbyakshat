"use client";

import { Suspense } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import DevelopingImage from "./DevelopingImage";
import { useUrlLightbox } from "@/lib/useUrlLightbox";

interface LightboxImage {
  id: string;
  url: string;
  width: number;
  height: number;
  caption?: string | null;
}

function StoryLightboxInner({ images }: { images: LightboxImage[] }) {
  const { index, open, goTo, close } = useUrlLightbox();

  const slides = images.map((img) => ({
    src: img.url,
    width: img.width,
    height: img.height,
    alt: img.caption ?? "",
  }));

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.map((image, i) => (
          <button
            key={image.id}
            onClick={() => open(i)}
            className="group text-left"
            aria-label={`Open image ${i + 1} of ${images.length}`}
          >
            <DevelopingImage
              src={image.url}
              alt={image.caption ?? ""}
              width={image.width}
              height={image.height}
              className="rounded-xl transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
            {image.caption && (
              <p className="mt-2 font-accent text-lg text-ink-soft">
                {image.caption}
              </p>
            )}
          </button>
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        close={close}
        index={Math.max(index, 0)}
        slides={slides}
        on={{ view: ({ index: i }) => goTo(i) }}
      />
    </>
  );
}

export default function StoryLightbox(props: { images: LightboxImage[] }) {
  return (
    <Suspense fallback={null}>
      <StoryLightboxInner {...props} />
    </Suspense>
  );
}
