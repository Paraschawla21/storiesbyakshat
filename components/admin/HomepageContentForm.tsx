"use client";

import { useState } from "react";
import { readAdminApiError } from "@/lib/adminApiError";
import Image from "next/image";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUploader from "./ImageUploader";

export interface HomepageContentValues {
  eyebrow: string;
  heroHeading: string;
  heroImageUrl: string;
  heroImageAlt: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  featuredBadge: string;
  featuredHeading: string;
  categoriesHeading: string;
  testimonialsHeading: string;
  closingHeading: string;
  closingSubtext: string;
  closingCtaLabel: string;
}

export default function HomepageContentForm({
  initial,
}: {
  initial: HomepageContentValues;
}) {
  const [values, setValues] = useState<HomepageContentValues>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof HomepageContentValues>(
    key: K,
    value: HomepageContentValues[K]
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
      const res = await fetch("/api/admin/homepage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error(await readAdminApiError(res, "Failed to save homepage content."));
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save homepage content.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      <Input
        id="eyebrow"
        label="Eyebrow"
        value={values.eyebrow}
        onChange={(e) => update("eyebrow", e.target.value)}
      />

      <Textarea
        id="heroHeading"
        label="Hero Heading"
        value={values.heroHeading}
        onChange={(e) => update("heroHeading", e.target.value)}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-ink-soft">Hero Image</p>
        {values.heroImageUrl && (
          <div className="relative mb-3 h-40 w-64 overflow-hidden rounded-xl">
            <Image
              src={values.heroImageUrl}
              alt="Hero"
              fill
              sizes="256px"
              className="object-cover"
            />
          </div>
        )}
        <ImageUploader
          label={values.heroImageUrl ? "Replace hero image" : "Upload hero image"}
          multiple={false}
          onUploaded={([img]) => update("heroImageUrl", img.url)}
        />
      </div>

      <Input
        id="heroImageAlt"
        label="Hero Image Alt Text"
        value={values.heroImageAlt}
        onChange={(e) => update("heroImageAlt", e.target.value)}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="ctaPrimaryLabel"
          label="Primary CTA Label"
          value={values.ctaPrimaryLabel}
          onChange={(e) => update("ctaPrimaryLabel", e.target.value)}
        />
        <Input
          id="ctaSecondaryLabel"
          label="Secondary CTA Label"
          value={values.ctaSecondaryLabel}
          onChange={(e) => update("ctaSecondaryLabel", e.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="featuredBadge"
          label="Featured Badge"
          value={values.featuredBadge}
          onChange={(e) => update("featuredBadge", e.target.value)}
        />
        <Input
          id="featuredHeading"
          label="Featured Heading"
          value={values.featuredHeading}
          onChange={(e) => update("featuredHeading", e.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="categoriesHeading"
          label="Categories Heading"
          value={values.categoriesHeading}
          onChange={(e) => update("categoriesHeading", e.target.value)}
        />
        <Input
          id="testimonialsHeading"
          label="Testimonials Heading"
          value={values.testimonialsHeading}
          onChange={(e) => update("testimonialsHeading", e.target.value)}
        />
      </div>

      <Textarea
        id="closingHeading"
        label="Closing Heading"
        value={values.closingHeading}
        onChange={(e) => update("closingHeading", e.target.value)}
      />

      <Textarea
        id="closingSubtext"
        label="Closing Subtext"
        value={values.closingSubtext}
        onChange={(e) => update("closingSubtext", e.target.value)}
      />

      <Input
        id="closingCtaLabel"
        label="Closing CTA Label"
        value={values.closingCtaLabel}
        onChange={(e) => update("closingCtaLabel", e.target.value)}
      />

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
