import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 60 * 1024 * 1024; // 60MB — short reel/gif-style clips
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    console.error("[upload] Cloudinary env vars missing.");
    return NextResponse.json(
      { error: "Image hosting isn't configured. Please contact your developer." },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    console.error("[upload] Could not parse form data:", err);
    return NextResponse.json(
      { error: "Upload was interrupted. Please try again." },
      { status: 400 }
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        error:
          "Unsupported file type. Use JPEG, PNG, WebP or AVIF for photos, or MP4/WebM/MOV for films.",
      },
      { status: 400 }
    );
  }

  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File too large (max ${isVideo ? "60MB for films" : "10MB for photos"}).` },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    // Cloudinary reports the real dimensions, so the browser doesn't have
    // to load the file a second time just to measure it.
    const result = await uploadToCloudinary(buffer);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[upload] Cloudinary upload failed:", err);
    const timedOut = err instanceof Error && err.message.includes("timed out");
    return NextResponse.json(
      {
        error: timedOut
          ? "Upload timed out. Check your connection and try a smaller file."
          : "Upload failed. Please try again.",
      },
      { status: timedOut ? 504 : 500 }
    );
  }
}
