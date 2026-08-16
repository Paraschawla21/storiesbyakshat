import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [
      {
        // Basic hardening headers on every response. No CSP for now — the
        // site uses inline styles/scripts from Next.js internals and
        // third-party embeds could break under a strict policy without
        // careful tuning; revisit once the domain is finalized.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Next's own optimized image responses (photos proxied through
        // /_next/image from Cloudinary/Unsplash). These are cached at the
        // CDN/edge for `images.minimumCacheTTL` below regardless, but we
        // also want the *browser* to hold onto them for the same window
        // instead of re-validating on every reload — content here rarely
        // changes (a new upload gets a new URL), so a long max-age is safe.
        source: "/_next/image",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // Next.js hashed static build assets (JS/CSS chunks) are content-
        // addressed — the filename changes whenever the content does — so
        // they're safe to cache forever. Next already sets this by default,
        // but we set it explicitly so the policy is visible/intentional
        // rather than implicit framework behavior.
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Static files served directly from /public (favicon, etc.). These
        // don't have content-hashed filenames, so we use a shorter-but-still
        // long cache with revalidation rather than "immutable".
        source: "/:path*(svg|png|jpg|jpeg|ico|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Galleries/journal photos almost never change once published (a new
    // upload gets a brand-new Cloudinary URL rather than overwriting the
    // old one), so it's safe to let Next's image optimizer cache the
    // transformed output for a long time instead of the 60s framework
    // default. 30 days; content updates still show instantly because the
    // underlying URL changes, not because this cache expires.
    minimumCacheTTL: 2592000,
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
