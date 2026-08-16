"use client";

import { useState } from "react";
import { readAdminApiError } from "@/lib/adminApiError";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export interface PageHeaderValues {
  slug: string;
  badge: string;
  heading: string;
  subheading: string;
}

export default function PageHeaderForm({
  initial,
  title,
}: {
  initial: PageHeaderValues;
  title: string;
}) {
  const [values, setValues] = useState<PageHeaderValues>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof PageHeaderValues>(key: K, value: PageHeaderValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/page-headers/${values.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          badge: values.badge,
          heading: values.heading,
          subheading: values.subheading,
        }),
      });

      if (!res.ok) {
        throw new Error(await readAdminApiError(res, "Failed to save page header."));
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save page header.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-paper p-6">
      <h2 className="mb-4 font-display text-lg text-ink">{title}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id={`${values.slug}-badge`}
            label="Badge"
            value={values.badge}
            onChange={(e) => update("badge", e.target.value)}
          />
          <Input
            id={`${values.slug}-heading`}
            label="Heading"
            value={values.heading}
            onChange={(e) => update("heading", e.target.value)}
          />
        </div>

        <Textarea
          id={`${values.slug}-subheading`}
          label="Subheading (optional)"
          value={values.subheading}
          onChange={(e) => update("subheading", e.target.value)}
        />

        {error && <p className="text-sm text-rosewood">{error}</p>}
        {saved && !error && <p className="text-sm text-marigold-dark">Saved.</p>}

        <div>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
