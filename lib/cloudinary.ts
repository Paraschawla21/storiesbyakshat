import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export interface UploadResult {
  url: string;
  width: number;
  height: number;
  type: "IMAGE" | "VIDEO";
}

/**
 * Uploads a file buffer to Cloudinary and returns the hosted URL plus its
 * real dimensions — so neither the browser nor the server has to measure
 * the file itself.
 *
 * `resource_type: "auto"` lets Cloudinary detect images vs. video.
 */
export function uploadToCloudinary(buffer: Buffer): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "storiesbyakshat",
        resource_type: "auto",
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }
        resolve({
          url: result.secure_url,
          width: result.width,
          height: result.height,
          type: result.resource_type === "video" ? "VIDEO" : "IMAGE",
        });
      }
    );

    stream.end(buffer);
  });
}

export { cloudinary };
