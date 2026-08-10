import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-accent text-3xl text-marigold-dark">404</p>
      <h1 className="mt-3 font-display text-3xl text-ink md:text-4xl">
        This page never made it into the album.
      </h1>
      <p className="mt-4 text-ink-soft">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Button href="/" variant="primary">
          Back home
        </Button>
        <Button href="/portfolio" variant="secondary">
          View Portfolio
        </Button>
      </div>
      <Link href="/contact" className="mt-6 text-sm text-ink-soft hover:text-marigold-dark">
        Or get in touch
      </Link>
    </div>
  );
}
