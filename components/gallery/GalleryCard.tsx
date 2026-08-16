import Link from "next/link";
import DevelopingImage from "./DevelopingImage";
import Badge from "@/components/ui/Badge";
import { CATEGORY_LABELS, CATEGORY_TONES, type Category } from "@/lib/content";

interface GalleryCardData {
  slug: string;
  title: string;
  coverImageUrl: string;
  coverWidth: number;
  coverHeight: number;
  location?: string | null;
  category: Category;
}

export default function GalleryCard({
  gallery,
  priority = false,
}: {
  gallery: GalleryCardData;
  /** Set true for above-the-fold cards (e.g. first row of a grid) to improve LCP. */
  priority?: boolean;
}) {
  return (
    <Link
      href={`/portfolio/${gallery.slug}`}
      className="group block transition-transform duration-500 ease-out focus-visible:scale-[1.02]"
    >
      <div className="relative overflow-hidden rounded-2xl">
        <div className="transition-transform duration-700 ease-out group-hover:scale-[1.06]">
          <DevelopingImage
            src={gallery.coverImageUrl}
            alt={gallery.title}
            width={gallery.coverWidth}
            height={gallery.coverHeight}
            priority={priority}
          />
        </div>

        {/* Warm golden wash that blooms in on hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-marigold/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent p-4 opacity-0 transition-[opacity,transform] duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <span className="font-accent text-xl text-linen">
            {gallery.location ?? CATEGORY_LABELS[gallery.category]}
          </span>
        </div>

        <Badge
          tone={CATEGORY_TONES[gallery.category]}
          className="absolute left-3 top-3 bg-linen/90 backdrop-blur-sm transition-transform duration-500 ease-out group-hover:-translate-y-0.5"
        >
          {CATEGORY_LABELS[gallery.category]}
        </Badge>
      </div>

      <div className="pt-3">
        <h3 className="font-display text-lg leading-snug text-ink transition-colors duration-300 group-hover:text-marigold-dark">
          {gallery.title}
        </h3>
      </div>
    </Link>
  );
}
