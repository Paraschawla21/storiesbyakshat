"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
// Type-only import: pulls in the video plugin's SlideVideo type augmentation
// without registering the plugin itself (we render video slides ourselves).
import type {} from "yet-another-react-lightbox/plugins/video";
import type { Slide, SlideVideo } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import MasonryGrid from "./MasonryGrid";
import DevelopingImage from "./DevelopingImage";
import { useUrlLightbox } from "@/lib/useUrlLightbox";
import { withUprightHyphens } from "@/components/ui/UprightHyphen";

interface EditorialItemData {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  width: number;
  height: number;
  caption?: string | null;
}

// The lightbox library's built-in video slide (from the `video` plugin) caps
// its container to the media's stored pixel width, which leaves
// small/modest-resolution videos stranded as a tiny box in the middle of the
// fullscreen black backdrop. We skip that plugin entirely and render videos
// ourselves so they fill as much of the viewport as they can, matching how
// image slides already behave — and pause playback on non-active slides.
export function VideoLightboxSlide({ slide, offset }: { slide: SlideVideo; offset: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (offset === 0) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [offset]);

  // Thumbnails already succeeded by the time a user opens the lightbox, but
  // a stale/rotated Cloudinary URL or an unsupported codec in this playback
  // mode can still fail here — without this, a broken video would just be a
  // blank black box in fullscreen with no explanation.
  if (failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-8 w-8 text-linen/50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        >
          <rect x="3" y="6" width="13" height="12" rx="2" />
          <path d="m16 12 5-3v9l-5-3z" />
        </svg>
        <span className="text-sm uppercase tracking-[0.18em] text-linen/70">
          Video unavailable
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center px-4 pb-4 pt-16 sm:px-8 sm:pb-8 sm:pt-16">
      <video
        ref={videoRef}
        autoPlay={slide.autoPlay}
        muted={slide.muted}
        loop={slide.loop}
        controls={slide.controls}
        playsInline
        onError={() => setFailed(true)}
        className="h-full max-h-[88vh] w-full max-w-[94vw] rounded-lg object-contain shadow-2xl"
      >
        {slide.sources?.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
      </video>
    </div>
  );
}

export function videoMimeType(url: string): string {
  const ext = url.split(".").pop()?.toLowerCase();
  if (ext === "webm") return "video/webm";
  if (ext === "mov") return "video/quicktime";
  return "video/mp4";
}

export function EditorialVideo({
  src,
  width,
  height,
  className = "",
  controls = false,
}: {
  src: string;
  width: number;
  height: number;
  className?: string;
  /** Show native play/pause/seek/volume/fullscreen controls on the thumbnail itself. */
  controls?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // A codec the browser can't decode, a deleted file or a dropped connection
  // would otherwise leave this permanently at opacity-0 — an invisible hole
  // in the grid. Fall back to a labelled placeholder that holds its space.
  if (failed || !src?.trim()) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-paper ${className}`}
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-6 w-6 text-ink-soft/40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
          >
            <rect x="3" y="6" width="13" height="12" rx="2" />
            <path d="m16 12 5-3v9l-5-3z" />
          </svg>
          <span className="text-[11px] uppercase tracking-[0.18em] text-ink-soft/60">
            Film unavailable
          </span>
        </div>
      </div>
    );
  }

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
        controls={controls}
        preload="metadata"
        onLoadedData={() => setLoaded(true)}
        onError={() => setFailed(true)}
        onStalled={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-700 ease-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      {!controls && (
        <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-ink/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-linen">
          Video
        </span>
      )}
    </div>
  );
}

function EditorialGridInner({ images }: { images: EditorialItemData[] }) {
  const { index, open, goTo, close } = useUrlLightbox();

  const slides: Slide[] = images.map((item) =>
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
              <p className="mt-2 font-accent text-lg text-ink-soft">{withUprightHyphens(item.caption)}</p>
            )}
          </button>
        ))}
      </MasonryGrid>

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

export default function EditorialGrid(props: { images: EditorialItemData[] }) {
  return (
    <Suspense fallback={null}>
      <EditorialGridInner {...props} />
    </Suspense>
  );
}
