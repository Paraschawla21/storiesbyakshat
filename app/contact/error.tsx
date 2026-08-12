"use client";

import SectionError from "@/components/ui/SectionError";

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SectionError
      {...props}
      title="The enquiry form didn't load."
      description="You can still reach us directly at storiesbyakshat24@gmail.com."
    />
  );
}
