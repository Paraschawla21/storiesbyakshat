import { ImageResponse } from "next/og";
import { apertureBloomPaths } from "@/lib/logo-mark";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const paths = apertureBloomPaths(100, 100, 84);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#F6EEE1",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 56,
          }}
        >
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: "absolute" }}>
            {paths.map((d, i) => (
              <path key={i} d={d} fill="#C98A3B" />
            ))}
            <circle cx="100" cy="100" r="32" fill="#F6EEE1" />
          </svg>
          <div
            style={{
              position: "absolute",
              display: "flex",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: 44,
              color: "#A85C4E",
              transform: "translateY(-4px)",
            }}
          >
            S
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
            fontSize: 56,
            color: "#A85C4E",
          }}
        >
          stories by
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 700,
            letterSpacing: 10,
            fontSize: 34,
            color: "#2B1B12",
            marginTop: 4,
          }}
        >
          AKSHAT
        </div>
      </div>
    ),
    { ...size }
  );
}
