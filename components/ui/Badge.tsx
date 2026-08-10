import { ReactNode } from "react";

type Tone = "marigold" | "rosewood" | "olive";

const tones: Record<Tone, string> = {
  marigold: "bg-marigold/15 text-marigold-dark border-marigold/30",
  rosewood: "bg-rosewood/15 text-rosewood border-rosewood/30",
  olive: "bg-olive/15 text-olive border-olive/30",
};

export default function Badge({
  children,
  tone = "olive",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
