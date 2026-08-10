"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input, Textarea, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUploader from "./ImageUploader";
import { CATEGORY_LABELS, ALL_CATEGORIES, type Category } from "@/lib/categories";

export interface GalleryImageDraft {
  id?: string;
  url: string;
  width: number;
  height: number;
  caption?: string;
}

export interface GalleryFormValues {
  id?: string;
  title: string;
  category: Category;
  coverImageUrl: string;
  coverWidth: number;
  coverHeight: number;
  storyText: string;
  eventDate: string;
  location: string;
  published: boolean;
  images: GalleryImageDraft[];
}

const emptyValues: GalleryFormValues = {
  title: "",
  category: "WEDDING",
  coverImageUrl: "",
  coverWidth: 1200,
  coverHeight: 1500,
  storyText: "",
  eventDate: "",
  location: "",
  published: false,
  images: [],
};

export default function GalleryForm({
  initial,
}: {
  initial?: Partial<GalleryFormValues> & { id?: string };
}) {
  const router = useRouter();
  const [values, setValues] = useState<GalleryFormValues>({
    ...emptyValues,
    ...initial,
    images: initial?.images ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(values.id);

  function update<K extends keyof GalleryFormValues>(key: K, value: GalleryFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setValues((v) => {
      const images = [...v.images];
      const target = index + direction;
      if (target < 0 || target >= images.length) return v;
      [images[index], images[target]] = [images[target], images[index]];
      return { ...v, images };
    });
  }

  function removeImage(index: number) {
    setValues((v) => ({ ...v, images: v.images.filter((_, i) => i !== index) }));
  }

  function updateCaption(index: number, caption: string) {
    setValues((v) => {
      const images = [...v.images];
      images[index] = { ...images[index], caption };
      return { ...v, images };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const endpoint = isEditing
        ? `/api/admin/galleries/${values.id}`
        : "/api/admin/galleries";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save gallery.");
      }

      router.push("/admin/galleries");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save gallery.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!values.id) return;
    if (!confirm("Delete this gallery? This cannot be undone.")) return;

    setSaving(true);
    const res = await fetch(`/api/admin/galleries/${values.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/galleries");
      router.refresh();
    } else {
      setError("Failed to delete gallery.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="title"
          label="Title"
          required
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
        />
        <Select
          id="category"
          label="Category"
          value={values.category}
          onChange={(e) => update("category", e.target.value as GalleryFormValues["category"])}
        >
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="location"
          label="Location"
          value={values.location}
          onChange={(e) => update("location", e.target.value)}
        />
        <Input
          id="eventDate"
          type="date"
          label="Event Date"
          value={values.eventDate?.slice(0, 10) ?? ""}
          onChange={(e) => update("eventDate", e.target.value)}
        />
      </div>

      <Textarea
        id="storyText"
        label="Story Text"
        value={values.storyText}
        onChange={(e) => update("storyText", e.target.value)}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-ink-soft">Cover Image</p>
        {values.coverImageUrl && (
          <div className="relative mb-3 h-40 w-64 overflow-hidden rounded-xl">
            <Image src={values.coverImageUrl} alt="Cover" fill sizes="256px" className="object-cover" />
          </div>
        )}
        <ImageUploader
          label={values.coverImageUrl ? "Replace cover image" : "Upload cover image"}
          onUploaded={([img]) => {
            update("coverImageUrl", img.url);
            update("coverWidth", img.width);
            update("coverHeight", img.height);
          }}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-ink-soft">Gallery Images</p>
        <div className="mb-3 flex flex-col gap-3">
          {values.images.map((img, i) => (
            <div
              key={img.id ?? img.url}
              className="flex items-center gap-3 rounded-xl border border-ink/10 bg-paper p-3"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
              </div>
              <input
                type="text"
                placeholder="Caption (optional)"
                value={img.caption ?? ""}
                onChange={(e) => updateCaption(i, e.target.value)}
                className="flex-1 rounded-lg border border-ink/15 bg-linen px-3 py-2 text-sm"
              />
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => moveImage(i, -1)}
                  disabled={i === 0}
                  className="rounded px-2 py-1 text-xs text-ink-soft hover:text-marigold-dark disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(i, 1)}
                  disabled={i === values.images.length - 1}
                  className="rounded px-2 py-1 text-xs text-ink-soft hover:text-marigold-dark disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="rounded px-2 py-1 text-xs text-rosewood hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <ImageUploader
          label="Add gallery images"
          multiple
          onUploaded={(imgs) =>
            setValues((v) => ({ ...v, images: [...v.images, ...imgs] }))
          }
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input
          type="checkbox"
          checked={values.published}
          onChange={(e) => update("published", e.target.checked)}
          className="h-4 w-4 rounded border-ink/20"
        />
        Published
      </label>

      {error && <p className="text-sm text-rosewood">{error}</p>}

      <div className="flex items-center gap-4">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Gallery"}
        </Button>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="text-sm font-medium text-rosewood hover:underline"
          >
            Delete Gallery
          </button>
        )}
      </div>
    </form>
  );
}
