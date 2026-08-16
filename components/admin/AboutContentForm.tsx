"use client";

import { useState } from "react";
import { readAdminApiError } from "@/lib/adminApiError";
import Image from "next/image";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUploader from "./ImageUploader";

export interface AboutContentValues {
  badge: string;
  heading: string;
  bioParagraph1: string;
  bioParagraph2: string;
  bioParagraph3: string;
  photoUrl: string;
  photoAlt: string;
  ctaLabel: string;
  philosophyHeading: string;
}

export default function AboutContentForm({
  initial,
}: {
  initial: AboutContentValues;
}) {
  const [values, setValues] = useState<AboutContentValues>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof AboutContentValues>(
    key: K,
    value: AboutContentValues[K]
  ) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/admin/about", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error(await readAdminApiError(res, "Failed to save about content."));
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save about content.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="badge"
          label="Badge"
          value={values.badge}
          onChange={(e) => update("badge", e.target.value)}
        />
        <Input
          id="heading"
          label="Heading"
          value={values.heading}
          onChange={(e) => update("heading", e.target.value)}
        />
      </div>

      <Textarea
        id="bioParagraph1"
        label="Bio Paragraph 1"
        value={values.bioParagraph1}
        onChange={(e) => update("bioParagraph1", e.target.value)}
      />
      <Textarea
        id="bioParagraph2"
        label="Bio Paragraph 2"
        value={values.bioParagraph2}
        onChange={(e) => update("bioParagraph2", e.target.value)}
      />
      <Textarea
        id="bioParagraph3"
        label="Bio Paragraph 3"
        value={values.bioParagraph3}
        onChange={(e) => update("bioParagraph3", e.target.value)}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-ink-soft">Photo</p>
        {values.photoUrl && (
          <div className="relative mb-3 h-40 w-64 overflow-hidden rounded-xl">
            <Image
              src={values.photoUrl}
              alt="Photo"
              fill
              sizes="256px"
              className="object-cover"
            />
          </div>
        )}
        <ImageUploader
          label={values.photoUrl ? "Replace photo" : "Upload photo"}
          multiple={false}
          onUploaded={([img]) => update("photoUrl", img.url)}
        />
      </div>

      <Input
        id="photoAlt"
        label="Photo Alt Text"
        value={values.photoAlt}
        onChange={(e) => update("photoAlt", e.target.value)}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="ctaLabel"
          label="CTA Label"
          value={values.ctaLabel}
          onChange={(e) => update("ctaLabel", e.target.value)}
        />
        <Input
          id="philosophyHeading"
          label="Philosophy Heading"
          value={values.philosophyHeading}
          onChange={(e) => update("philosophyHeading", e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-rosewood">{error}</p>}
      {saved && !error && <p className="text-sm text-marigold-dark">Saved.</p>}

      <div>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
