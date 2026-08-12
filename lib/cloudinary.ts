import { v2 as cloudinary } from "cloudinary";

export interface UploadResult {
  url: string;
  width: number;
  height: number;
  type: "IMAGE" | "VIDEO";
}

/** Uploads that hang longer than this are abandoned so the admin UI can recover. */
const UPLOAD_TIMEOUT_MS = 60_000;

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
 * Uploads a file buffer to Cloudinary and returns the hosted URL plus its
 * real dimensions — so neither the browser nor the server has to measure
 * the file itself.
 *
 * `resource_type: "auto"` lets Cloudinary detect images vs. video.
 */
export function uploadToCloudinary(buffer: Buffer): Promise<UploadResult> {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("Cloudinary upload timed out."));
    }, UPLOAD_TIMEOUT_MS);

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "storiesbyakshat",
        resource_type: "auto",
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          finish(() => reject(error ?? new Error("Cloudinary upload failed.")));
          return;
        }
        finish(() =>
          resolve({
            url: result.secure_url,
            width: result.width,
            height: result.height,
            type: result.resource_type === "video" ? "VIDEO" : "IMAGE",
          })
        );
      }
    );

    stream.on("error", (err) => finish(() => reject(err)));
    stream.end(buffer);
  });
}
