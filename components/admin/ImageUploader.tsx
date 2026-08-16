"use client";

import { useRef, useState } from "react";

export interface UploadedMedia {
  url: string;
  width: number;
  height: number;
  type: "IMAGE" | "VIDEO";
}

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

/** Cloudinary's own Free-plan per-asset limits (confirmed via the account's
 *  /usage API) — enforced here too so a rejection is instant and friendly
 *  instead of round-tripping to Cloudinary first. */
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

interface CloudinarySignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

let cachedSignature: { value: CloudinarySignature; fetchedAt: number } | null = null;

/** Signatures are timestamped and Cloudinary only accepts them for a short
 *  window, so we don't cache for long — just enough to dedupe simultaneous
 *  requests when uploading several files back-to-back in one batch. */
async function getUploadSignature(): Promise<CloudinarySignature> {
  if (cachedSignature && Date.now() - cachedSignature.fetchedAt < 30_000) {
    return cachedSignature.value;
  }
  const res = await fetch("/api/admin/upload-signature");
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Could not start upload.");
  }
  const value = (await res.json()) as CloudinarySignature;
  cachedSignature = { value, fetchedAt: Date.now() };
  return value;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  width?: number;
  height?: number;
  resource_type: "image" | "video" | "raw";
}

/**
 * Uploads a single file straight to Cloudinary from the browser, with real
 * progress reporting. This deliberately never touches our own server with
 * the file bytes — Vercel caps request bodies at 4.5MB, which a wedding
 * film clip blows past instantly. Only the small signature request above
 * goes through our server; the actual upload goes directly to Cloudinary.
 */
async function uploadWithProgress(file: File, onProgress: (pct: number) => void): Promise<UploadedMedia> {
  const isVideo = file.type.startsWith("video/");
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    throw new Error(
      `File too large (max ${isVideo ? "100MB for films" : "10MB for photos"}).`
    );
  }

  const sig = await getUploadSignature();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sig.apiKey);
    formData.append("timestamp", String(sig.timestamp));
    formData.append("signature", sig.signature);
    formData.append("folder", sig.folder);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as CloudinaryUploadResponse;
          resolve({
            url: data.secure_url,
            width: data.width ?? 0,
            height: data.height ?? 0,
            type: data.resource_type === "video" ? "VIDEO" : "IMAGE",
          });
        } catch {
          reject(new Error("Unexpected response from Cloudinary."));
        }
        return;
      }
      let message = "Upload failed.";
      try {
        const data = JSON.parse(xhr.responseText);
        if (data?.error?.message) message = data.error.message;
      } catch {
        // response wasn't JSON — keep the default message
      }
      reject(new Error(message));
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed. Check your connection.")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled.")));

    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`);
    xhr.send(formData);
  });
}

function FileTypeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 text-ink-soft/50"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="m16 12 5-3v9l-5-3z" />
    </svg>
  );
}

export default function ImageUploader({
  onUploaded,
  label = "Upload image",
  multiple = false,
  acceptVideo = false,
}: {
  onUploaded: (media: UploadedMedia[]) => void;
  label?: string;
  multiple?: boolean;
  /** Also accept short video files (mp4/webm/mov) for films. */
  acceptVideo?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);

  const uploading = items.some((item) => item.status === "pending" || item.status === "uploading");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const newItems: UploadItem[] = files.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      progress: 0,
      status: "pending",
    }));

    setItems(newItems);
    if (inputRef.current) inputRef.current.value = "";

    const results: UploadedMedia[] = [];

    for (const item of newItems) {
      setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: "uploading" } : p)));

      try {
        const media = await uploadWithProgress(item.file, (pct) => {
          setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, progress: pct } : p)));
        });
        results.push(media);
        setItems((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, status: "done", progress: 100 } : p))
        );
      } catch (err) {
        setItems((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? {
                  ...p,
                  status: "error",
                  error: err instanceof Error ? err.message : "Upload failed.",
                }
              : p
          )
        );
      }
    }

    if (results.length > 0) onUploaded(results);

    // Keep the finished list visible for a moment so it reads as "done"
    // rather than flickering away, then clear it for the next batch.
    setTimeout(() => {
      setItems((prev) => {
        for (const p of prev) {
          if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
        }
        return [];
      });
    }, 2000);
  }

  const accept = acceptVideo
    ? "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
    : "image/jpeg,image/png,image/webp,image/avif";

  return (
    <div>
      <label
        className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-marigold hover:text-marigold-dark ${
          uploading ? "pointer-events-none opacity-60" : ""
        }`}
      >
        {uploading ? (
          <>
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/20 border-t-marigold"
            />
            Uploading…
          </>
        ) : (
          label
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-ink/10 bg-paper/60 px-3 py-2"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-ink/5">
                {item.previewUrl ? (
                  // Local blob preview only — not the final hosted image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <FileTypeIcon />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-ink">{item.file.name}</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                  <div
                    className={`h-full rounded-full transition-[width] duration-200 ease-out ${
                      item.status === "error" ? "bg-rosewood" : "bg-marigold"
                    }`}
                    style={{ width: `${item.status === "error" ? 100 : item.progress}%` }}
                  />
                </div>
                {item.status === "error" && (
                  <p className="mt-1 text-[11px] text-rosewood">{item.error}</p>
                )}
              </div>

              <div className="w-9 shrink-0 text-right">
                {item.status === "done" && (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="ml-auto h-4 w-4 text-marigold-dark"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
                {item.status === "error" && (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="ml-auto h-4 w-4 text-rosewood"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                )}
                {(item.status === "uploading" || item.status === "pending") && (
                  <span className="text-[11px] tabular-nums text-ink-soft">{item.progress}%</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
