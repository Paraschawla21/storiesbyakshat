"use client";

import { useState } from "react";
import { readAdminApiError } from "@/lib/adminApiError";
import Image from "next/image";
import ImageUploader, { UploadedMedia } from "./ImageUploader";
import Badge from "@/components/ui/Badge";

interface EditorialImageItem {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  width: number;
  height: number;
  caption: string | null;
  published: boolean;
  order: number;
}

export default function EditorialManager({
  initialImages,
}: {
  initialImages: EditorialImageItem[];
}) {
  const [images, setImages] = useState(initialImages);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [saving, setSaving] = useState(false);

  const visibleImages =
    filter === "ALL" ? images : images.filter((img) => img.type === filter);

  async function handleUpload(uploaded: UploadedMedia[]) {
    setError(null);
    setSaving(true);
    try {
      for (const media of uploaded) {
        const res = await fetch("/api/admin/editorial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(media),
        });
        if (!res.ok) throw new Error(await readAdminApiError(res, "Failed to save uploaded media."));
        const data = await res.json();
        setImages((prev) => [...prev, data.image]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setSaving(false);
    }
  }

  async function updateImage(id: string, patch: Partial<EditorialImageItem>) {
    const previous = images;
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...patch } : img)));

    try {
      const res = await fetch(`/api/admin/editorial/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(await readAdminApiError(res, "Failed to save change."));
    } catch (err) {
      setImages(previous);
      setError(err instanceof Error ? err.message : "Failed to save change.");
    }
  }

  async function persistOrder(nextImages: EditorialImageItem[]) {
    try {
      const res = await fetch("/api/admin/editorial", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: nextImages.map((img, i) => ({ id: img.id, order: i })),
        }),
      });
      if (!res.ok) throw new Error(await readAdminApiError(res, "Failed to save new order."));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save new order.");
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      persistOrder(next);
      return next;
    });
  }

  async function deleteImage(id: string) {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    const previous = images;
    setImages((prev) => prev.filter((img) => img.id !== id));

    try {
      const res = await fetch(`/api/admin/editorial/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readAdminApiError(res, "Failed to delete item."));
    } catch (err) {
      setImages(previous);
      setError(err instanceof Error ? err.message : "Failed to delete item.");
    }
  }

  return (
    <div>
      <div className="mb-8">
        <ImageUploader
          label="Upload photos or short films"
          multiple
          acceptVideo
          onUploaded={handleUpload}
        />
        <p className="mt-2 text-xs text-ink-soft">
          Photos (JPEG/PNG/WebP/AVIF, up to 10MB) appear on the{" "}
          <span className="font-medium">Photography</span> page. Films
          (MP4/WebM/MOV, up to 100MB) appear on the{" "}
          <span className="font-medium">Films</span> page — keep clips short
          since they autoplay muted.
        </p>
        {error && <p className="mt-2 text-sm text-rosewood">{error}</p>}
        {saving && (
          <p className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/20 border-t-marigold"
            />
            Adding to your library…
          </p>
        )}
      </div>

      <div className="mb-6 flex gap-2">
        {(
          [
            { value: "ALL", label: `All (${images.length})` },
            {
              value: "IMAGE",
              label: `Photography (${images.filter((i) => i.type === "IMAGE").length})`,
            },
            {
              value: "VIDEO",
              label: `Films (${images.filter((i) => i.type === "VIDEO").length})`,
            },
          ] as const
        ).map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? "border-marigold bg-marigold text-linen"
                : "border-ink/15 text-ink hover:border-marigold"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {visibleImages.map((img) => {
          const i = images.findIndex((x) => x.id === img.id);
          return (
          <div
            key={img.id}
            className="flex items-center gap-4 rounded-xl border border-ink/10 bg-paper p-4"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink/5">
              {img.type === "VIDEO" ? (
                <video
                  src={img.url}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
              )}
              {img.type === "VIDEO" && (
                <span className="absolute bottom-0.5 right-0.5 rounded bg-ink/70 px-1 text-[9px] font-medium uppercase text-linen">
                  Video
                </span>
              )}
            </div>

            <input
              type="text"
              placeholder="Caption (optional)"
              defaultValue={img.caption ?? ""}
              onBlur={(e) => updateImage(img.id, { caption: e.target.value })}
              className="flex-1 rounded-lg border border-ink/15 bg-linen px-3 py-2 text-sm"
            />

            <button
              onClick={() => updateImage(img.id, { published: !img.published })}
              className="shrink-0"
            >
              <Badge tone={img.published ? "marigold" : "olive"}>
                {img.published ? "Published" : "Hidden"}
              </Badge>
            </button>

            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => moveImage(i, -1)}
                disabled={i === 0}
                className="rounded px-2 py-1 text-xs text-ink-soft hover:text-marigold-dark disabled:opacity-30"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                onClick={() => moveImage(i, 1)}
                disabled={i === images.length - 1}
                className="rounded px-2 py-1 text-xs text-ink-soft hover:text-marigold-dark disabled:opacity-30"
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                onClick={() => deleteImage(img.id)}
                className="rounded px-2 py-1 text-xs text-rosewood hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
          );
        })}

        {visibleImages.length === 0 && (
          <p className="text-ink-soft">
            {images.length === 0
              ? "Nothing here yet. Upload your first photo or film above."
              : "Nothing in this view."}
          </p>
        )}
      </div>
    </div>
  );
}
