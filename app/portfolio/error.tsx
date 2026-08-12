"use client";

import SectionError from "@/components/ui/SectionError";

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SectionError
      {...props}
      title="This gallery wall is bare."
      description="We couldn't load the portfolio just now. Please try again."
    />
  );
}
