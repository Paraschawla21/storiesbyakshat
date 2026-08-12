"use client";

import SectionError from "@/components/ui/SectionError";

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SectionError
      {...props}
      title="This page didn't load."
      description="We couldn't load the about page. Please try again."
    />
  );
}
