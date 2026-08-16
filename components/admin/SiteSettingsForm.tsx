"use client";

import { useState } from "react";
import { readAdminApiError } from "@/lib/adminApiError";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export interface SiteSettingsValues {
  siteTitle: string;
  siteDescription: string;
  footerTagline: string;
  footerSignature: string;
  instagramUrl: string;
}

export default function SiteSettingsForm({
  initial,
}: {
  initial: SiteSettingsValues;
}) {
  const [values, setValues] = useState<SiteSettingsValues>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof SiteSettingsValues>(key: K, value: SiteSettingsValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error(await readAdminApiError(res, "Failed to save site settings."));
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save site settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      <Input
        id="siteTitle"
        label="Site Title"
        value={values.siteTitle}
        onChange={(e) => update("siteTitle", e.target.value)}
      />

      <Textarea
        id="siteDescription"
        label="Site Description"
        value={values.siteDescription}
        onChange={(e) => update("siteDescription", e.target.value)}
      />

      <Textarea
        id="footerTagline"
        label="Footer Tagline"
        value={values.footerTagline}
        onChange={(e) => update("footerTagline", e.target.value)}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="footerSignature"
          label="Footer Signature"
          value={values.footerSignature}
          onChange={(e) => update("footerSignature", e.target.value)}
        />
        <Input
          id="instagramUrl"
          label="Instagram URL"
          value={values.instagramUrl}
          onChange={(e) => update("instagramUrl", e.target.value)}
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
