"use client";

import SectionError from "@/components/ui/SectionError";

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SectionError
      {...props}
      title="This story didn't load."
      description="We couldn't open this gallery. It may have moved, or the connection dropped."
    />
  );
}
