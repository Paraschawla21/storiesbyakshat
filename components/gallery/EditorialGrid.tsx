"use client";

import { Suspense, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import MasonryGrid from "./MasonryGrid";
import DevelopingImage from "./DevelopingImage";
import { useUrlLightbox } from "@/lib/useUrlLightbox";

interface EditorialItemData {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  width: number;
  height: number;
  caption?: string | null;
}

function videoMimeType(url: string): string {
  const ext = url.split(".").pop()?.toLowerCase();
  if (ext === "webm") return "video/webm";
  if (ext === "mov") return "video/quicktime";
  return "video/mp4";
}

function EditorialVideo({
  src,
  width,
  height,
  className = "",
}: {
  src: string;
  width: number;
  height: number;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-paper ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-700 ease-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-ink/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-linen">
        Video
      </span>
    </div>
  );
}

function EditorialGridInner({ images }: { images: EditorialItemData[] }) {
  const { index, open, goTo, close } = useUrlLightbox();

  const slides = images.map((item) =>
    item.type === "VIDEO"
      ? {
          type: "video" as const,
          width: item.width,
          height: item.height,
          autoPlay: true,
          muted: true,
          loop: true,
          controls: true,
          sources: [{ src: item.url, type: videoMimeType(item.url) }],
        }
      : {
          src: item.url,
          width: item.width,
          height: item.height,
          alt: item.caption ?? "",
        }
  );

  return (
    <>
      <MasonryGrid>
        {images.map((item, i) => (
          <button
            key={item.id}
            onClick={() => open(i)}
            className="group block w-full text-left"
            aria-label={`Open ${item.type === "VIDEO" ? "video" : "image"} ${i + 1} of ${images.length}`}
          >
            <div className="overflow-hidden rounded-xl transition-transform duration-500 ease-out group-hover:scale-[1.02]">
              {item.type === "VIDEO" ? (
                <EditorialVideo src={item.url} width={item.width} height={item.height} />
              ) : (
                <DevelopingImage
                  src={item.url}
                  alt={item.caption ?? ""}
                  width={item.width}
                  height={item.height}
                  priority={i < 3}
                />
              )}
            </div>
            {item.caption && (
              <p className="mt-2 font-accent text-lg text-ink-soft">{item.caption}</p>
            )}
          </button>
        ))}
      </MasonryGrid>

      <Lightbox
        open={index >= 0}
        close={close}
        index={Math.max(index, 0)}
        slides={slides}
        plugins={[Video]}
        on={{ view: ({ index: i }) => goTo(i) }}
      />
    </>
  );
}

export default function EditorialGrid(props: { images: EditorialItemData[] }) {
  return (
    <Suspense fallback={null}>
      <EditorialGridInner {...props} />
    </Suspense>
  );
}
