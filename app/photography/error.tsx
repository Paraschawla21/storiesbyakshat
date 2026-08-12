"use client";

import SectionError from "@/components/ui/SectionError";

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SectionError
      {...props}
      title="These photographs didn't load."
      description="We couldn't load the photography selects. Please try again."
    />
  );
}
