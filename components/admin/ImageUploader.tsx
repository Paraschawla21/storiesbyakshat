"use client";

import { useRef, useState } from "react";

export interface UploadedMedia {
  url: string;
  width: number;
  height: number;
  type: "IMAGE" | "VIDEO";
}

export default function ImageUploader({
  onUploaded,
  label = "Upload image",
  multiple = false,
  acceptVideo = false,
}: {
  onUploaded: (media: UploadedMedia[]) => void;
  label?: string;
  multiple?: boolean;
  /** Also accept short video files (mp4/webm/mov) for films. */
  acceptVideo?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setProgress({ done: 0, total: files.length });

    try {
      const results: UploadedMedia[] = [];

      for (const file of files) {
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

        // The API returns the hosted URL plus real dimensions.
        results.push((await res.json()) as UploadedMedia);
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      }

      onUploaded(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      setProgress({ done: 0, total: 0 });
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const accept = acceptVideo
    ? "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
    : "image/jpeg,image/png,image/webp,image/avif";

  const buttonLabel = uploading
    ? progress.total > 1
      ? `Uploading ${progress.done + 1} of ${progress.total}...`
      : "Uploading..."
    : label;

  return (
    <div>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-marigold hover:text-marigold-dark">
        {buttonLabel}
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
