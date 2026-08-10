"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUploader from "./ImageUploader";
import RichTextEditor from "./RichTextEditor";

export interface BlogPostFormValues {
  id?: string;
  title: string;
  coverImageUrl: string;
  coverWidth: number;
  coverHeight: number;
  content: string;
  excerpt: string;
  tags: string; // comma-separated
  published: boolean;
}

const emptyValues: BlogPostFormValues = {
  title: "",
  coverImageUrl: "",
  coverWidth: 1400,
  coverHeight: 1050,
  content: "",
  excerpt: "",
  tags: "",
  published: false,
};

export default function BlogPostForm({
  initial,
}: {
  initial?: Partial<BlogPostFormValues> & { id?: string };
}) {
  const router = useRouter();
  const [values, setValues] = useState<BlogPostFormValues>({
    ...emptyValues,
    ...initial,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  const isEditing = Boolean(values.id);

  function update<K extends keyof BlogPostFormValues>(key: K, value: BlogPostFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const endpoint = isEditing ? `/api/admin/journal/${values.id}` : "/api/admin/journal";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          tags: values.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save post.");
      }

      router.push("/admin/journal");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!values.id) return;
    if (!confirm("Delete this post? This cannot be undone.")) return;

    setSaving(true);
    const res = await fetch(`/api/admin/journal/${values.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/journal");
      router.refresh();
    } else {
      setError("Failed to delete post.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-6">
      <Input
        id="title"
        label="Title"
        required
        value={values.title}
        onChange={(e) => update("title", e.target.value)}
      />

      <Textarea
        id="excerpt"
        label="Excerpt"
        value={values.excerpt}
        onChange={(e) => update("excerpt", e.target.value)}
      />

      <Input
        id="tags"
        label="Tags (comma-separated)"
        value={values.tags}
        onChange={(e) => update("tags", e.target.value)}
        placeholder="Wedding Story, Advice"
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
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-ink-soft">Content</p>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="text-xs font-medium text-marigold-dark hover:underline"
          >
            {preview ? "Back to editor" : "Live preview"}
          </button>
        </div>
        {preview ? (
          <div
            className="rounded-xl border border-ink/15 bg-linen p-4 prose-like"
            dangerouslySetInnerHTML={{ __html: values.content }}
          />
        ) : (
          <RichTextEditor
            content={values.content}
            onChange={(html) => update("content", html)}
          />
        )}
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
          {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Post"}
        </Button>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="text-sm font-medium text-rosewood hover:underline"
          >
            Delete Post
          </button>
        )}
      </div>
    </form>
  );
}
