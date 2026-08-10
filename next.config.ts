import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      // The old combined /editorial page was split into /photography and
      // /films — keep existing links, bookmarks, and any indexed URLs working.
      { source: "/editorial", destination: "/photography", permanent: true },
    ];
  },
};

export default nextConfig;
