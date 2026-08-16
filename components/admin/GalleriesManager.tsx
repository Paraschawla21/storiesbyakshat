"use client";

import { useState } from "react";
import { readAdminApiError } from "@/lib/adminApiError";
import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { CATEGORY_LABELS, CATEGORY_TONES, type Category } from "@/lib/categories";

interface GalleryItem {
  id: string;
  title: string;
  slug: string;
  category: Category;
  coverImageUrl: string;
  location: string | null;
  published: boolean;
  order: number;
  imageCount: number;
}

export default function GalleriesManager({
  initialGalleries,
}: {
  initialGalleries: GalleryItem[];
}) {
  const [galleries, setGalleries] = useState(initialGalleries);
  const [error, setError] = useState<string | null>(null);

  async function persistOrder(next: GalleryItem[]) {
    try {
      const res = await fetch("/api/admin/galleries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: next.map((g, i) => ({ id: g.id, order: i })),
        }),
      });
      if (!res.ok) throw new Error(await readAdminApiError(res, "Failed to save new order."));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save new order.");
    }
  }

  function moveGallery(index: number, direction: -1 | 1) {
    setGalleries((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      persistOrder(next);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-rosewood">{error}</p>}

      {galleries.map((g, i) => (
        <div
          key={g.id}
          className="flex items-center gap-4 rounded-xl border border-ink/10 bg-paper p-4 transition-colors hover:border-marigold"
        >
          <Link href={`/admin/galleries/${g.id}`} className="flex flex-1 items-center gap-4 min-w-0">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
              <Image src={g.coverImageUrl} alt={g.title} fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg text-ink">{g.title}</p>
              <p className="text-sm text-ink-soft">
                {g.imageCount} images
                {g.location ? ` · ${g.location}` : ""}
              </p>
            </div>
            <Badge tone={CATEGORY_TONES[g.category]}>{CATEGORY_LABELS[g.category]}</Badge>
            <Badge tone={g.published ? "marigold" : "olive"}>
              {g.published ? "Published" : "Draft"}
            </Badge>
          </Link>

          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => moveGallery(i, -1)}
              disabled={i === 0}
              className="rounded px-2 py-1 text-xs text-ink-soft hover:text-marigold-dark disabled:opacity-30"
              aria-label="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveGallery(i, 1)}
              disabled={i === galleries.length - 1}
              className="rounded px-2 py-1 text-xs text-ink-soft hover:text-marigold-dark disabled:opacity-30"
              aria-label="Move down"
            >
              ↓
            </button>
          </div>
        </div>
      ))}

      {galleries.length === 0 && (
        <p className="text-ink-soft">No galleries yet. Create your first one.</p>
      )}
    </div>
  );
}
