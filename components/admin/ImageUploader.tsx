"use client";

import { useRef, useState } from "react";

export interface UploadedMedia {
  url: string;
  width: number;
  height: number;
  type: "IMAGE" | "VIDEO";
}

function readImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
}

function readVideoDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () =>
      resolve({ width: video.videoWidth, height: video.videoHeight });
    video.onerror = reject;
    video.src = url;
  });
}

const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export default function ImageUploader({
  onUploaded,
  label = "Upload image",
  multiple = false,
  acceptVideo = false,
}: {
  onUploaded: (media: UploadedMedia[]) => void;
  label?: string;
  multiple?: boolean;
  /** Also accept short video files (mp4/webm/mov) for editorial reels/gif-style clips. */
  acceptVideo?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const results: UploadedMedia[] = [];
      for (const file of files) {
        const isVideo = VIDEO_TYPES.has(file.type);

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Upload failed.");
        }

        const data = await res.json();
        const dims = isVideo
          ? await readVideoDimensions(data.url)
          : await readImageDimensions(data.url);
        results.push({
          url: data.url,
          width: dims.width,
          height: dims.height,
          type: isVideo ? "VIDEO" : "IMAGE",
        });
      }

      onUploaded(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const accept = acceptVideo
    ? "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
    : "image/jpeg,image/png,image/webp,image/avif";

  return (
    <div>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink hover:border-marigold hover:text-marigold-dark">
        {uploading ? "Uploading..." : label}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error && <p className="mt-2 text-xs text-rosewood">{error}</p>}
    </div>
  );
}
