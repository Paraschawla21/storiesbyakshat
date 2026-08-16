import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createUploadSignature, isCloudinaryConfigured } from "@/lib/cloudinary";

/**
 * Issues a short-lived signature so the browser can upload a file directly
 * to Cloudinary (see lib/cloudinary.ts for why). This response is tiny —
 * only the actual file upload that follows needs to avoid our server, not
 * this request.
 */
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    console.error("[upload-signature] Cloudinary env vars missing.");
    return NextResponse.json(
      { error: "Image hosting isn't configured. Please contact your developer." },
      { status: 503 }
    );
  }

  try {
    const signature = createUploadSignature();
    return NextResponse.json(signature);
  } catch (err) {
    console.error("[upload-signature] Failed to create signature:", err);
    return NextResponse.json({ error: "Could not start upload." }, { status: 500 });
  }
}
