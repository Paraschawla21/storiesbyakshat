import { v2 as cloudinary } from "cloudinary";

let configured = false;

/**
 * Configure lazily rather than at module load. A missing env var used to throw
 * on import, which would take down anything that merely *imported* this file.
 * Deferring it means a misconfigured Cloudinary breaks uploads only — with a
 * clear message — while the rest of the site keeps serving.
 */
function ensureConfigured() {
  if (configured) return;

  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
    );
  }

  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  configured = true;
}

/** True when uploads are possible — lets callers fail early with a good message. */
export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Everything the browser needs to upload a file straight to Cloudinary,
 * bypassing our own server entirely for the file bytes themselves.
 *
 * Why: routing uploads through a Next.js API route means the file has to
 * fit inside the hosting platform's request-body limit (Vercel caps this
 * at 4.5MB — far below the size of a real wedding film clip). Signing a
 * short-lived upload request lets the browser POST directly to
 * Cloudinary's endpoint instead, so the only thing that ever touches our
 * server is this tiny signature payload.
 */
export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

export function createUploadSignature(): UploadSignature {
  ensureConfigured();

  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME!;
  const api_key = process.env.CLOUDINARY_API_KEY!;
  const api_secret = process.env.CLOUDINARY_API_SECRET!;
  const folder = "storiesbyakshat";
  const timestamp = Math.round(Date.now() / 1000);

  // Only params that are actually sent to Cloudinary's upload endpoint may
  // be included here — the signature must match exactly or Cloudinary
  // rejects the upload.
  const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, api_secret);

  return { cloudName: cloud_name, apiKey: api_key, timestamp, signature, folder };
}

/**
 * Extracts a Cloudinary `public_id` (including folder) from one of our own
 * `secure_url`s, e.g.
 *   https://res.cloudinary.com/<cloud>/image/upload/v169.../storiesbyakshat/abc123.jpg
 *   -> "storiesbyakshat/abc123"
 *
 * Returns null for anything that doesn't look like a Cloudinary upload URL
 * (e.g. the Unsplash seed/demo images used before Akshat's real content is
 * uploaded) so callers can skip deletion instead of erroring.
 */
export function extractCloudinaryPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+(?:\?.*)?$/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/** Cloudinary needs to know image vs. video to delete the right asset. */
function detectResourceType(url: string): "image" | "video" {
  return url.includes("/video/upload/") ? "video" : "image";
}

/**
 * Best-effort delete of a single asset from Cloudinary. Never throws —
 * a failed/missing Cloudinary delete should never block a DB delete the
 * admin is waiting on. Returns false (and logs) for anything that can't be
 * deleted, e.g. non-Cloudinary URLs (seed data) or an asset already gone.
 */
export async function deleteFromCloudinary(url: string): Promise<boolean> {
  if (!isCloudinaryConfigured()) return false;

  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) return false;

  try {
    ensureConfigured();
    const resource_type = detectResourceType(url);
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type,
      invalidate: true,
    });
    if (result?.result !== "ok" && result?.result !== "not found") {
      console.error(`Cloudinary destroy unexpected result for ${publicId}:`, result);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Cloudinary destroy failed for ${publicId}:`, error);
    return false;
  }
}

/**
 * Deletes multiple assets, tolerating individual failures so one bad URL
 * doesn't stop the rest from being cleaned up. De-dupes identical URLs
 * (e.g. an image kept in place across a reorder should never reach here,
 * but this is a cheap safety net).
 */
export async function deleteManyFromCloudinary(urls: (string | null | undefined)[]): Promise<void> {
  const unique = Array.from(new Set(urls.filter((u): u is string => Boolean(u))));
  await Promise.allSettled(unique.map((url) => deleteFromCloudinary(url)));
}
