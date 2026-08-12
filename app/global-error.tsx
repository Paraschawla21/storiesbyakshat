"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary. This replaces the root layout entirely, so it cannot
 * rely on anything the layout provides — no shared components, no fonts, and
 * critically no Tailwind (a CSS failure is itself a reason we might land here).
 * Everything is inlined so this renders even when the rest of the app cannot.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#faf7f2",
          color: "#2b2622",
          fontFamily: "Georgia, 'Times New Roman', serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "32rem", textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#a8763e",
            }}
          >
            Stories by Akshat
          </p>
          <h1 style={{ margin: "1rem 0 0", fontSize: "1.875rem", fontWeight: 400 }}>
            This frame didn&apos;t develop.
          </h1>
          <p style={{ margin: "1rem 0 0", lineHeight: 1.6, color: "#6b625a" }}>
            Something went wrong while loading the site. Please try again — if it
            keeps happening, email{" "}
            <a href="mailto:storiesbyakshat24@gmail.com" style={{ color: "#a8763e" }}>
              storiesbyakshat24@gmail.com
            </a>
            .
          </p>
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={reset}
              style={{
                cursor: "pointer",
                border: "none",
                padding: "0.75rem 1.5rem",
                backgroundColor: "#a8763e",
                color: "#faf7f2",
                fontSize: "0.875rem",
                letterSpacing: "0.05em",
              }}
            >
              Try again
            </button>
            {/* Deliberately a plain anchor, not next/link: this boundary can be
                reached when the router or layout itself has failed, and a hard
                navigation is the only reliable way out. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                padding: "0.75rem 1.5rem",
                border: "1px solid #cfc5b8",
                color: "#2b2622",
                textDecoration: "none",
                fontSize: "0.875rem",
                letterSpacing: "0.05em",
              }}
            >
              Back home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
