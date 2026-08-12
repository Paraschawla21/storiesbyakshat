"use client";

import SectionError from "@/components/ui/SectionError";

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SectionError
      {...props}
      title="The journal is closed."
      description="We couldn't load the journal just now. Please try again."
    />
  );
}
