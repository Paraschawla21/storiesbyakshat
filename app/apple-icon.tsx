import { ImageResponse } from "next/og";
import { apertureBloomPaths } from "@/lib/logo-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const paths = apertureBloomPaths(90, 90, 76);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "#2B1B12",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: "absolute" }}>
          {paths.map((d, i) => (
            <path key={i} d={d} fill="#C98A3B" />
          ))}
          <circle cx="90" cy="90" r="29" fill="#F6EEE1" />
        </svg>
        <div
          style={{
            position: "absolute",
            display: "flex",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
            fontSize: 40,
            color: "#A85C4E",
            transform: "translateY(-4px)",
          }}
        >
          S
        </div>
      </div>
    ),
    { ...size }
  );
}
