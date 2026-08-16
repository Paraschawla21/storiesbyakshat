import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SafeImage from "@/components/ui/SafeImage";
import Badge from "@/components/ui/Badge";
import BackLink from "@/components/ui/BackLink";
import { formatDateLong } from "@/lib/format";
import StoryLightbox from "@/components/gallery/Lightbox";
import { getAllGallerySlugs, getGalleryBySlug, CATEGORY_LABELS, CATEGORY_TONES } from "@/lib/content";

export async function generateStaticParams() {
  const slugs = await getAllGallerySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/portfolio/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const gallery = await getGalleryBySlug(slug);
  if (!gallery) return {};

  return {
    title: `${gallery.title} | Stories by Akshat`,
    description: gallery.storyText ?? undefined,
    openGraph: {
      images: [{ url: gallery.coverImageUrl }],
    },
  };
}

export default async function GalleryStoryPage(
  props: PageProps<"/portfolio/[slug]">
) {
  const { slug } = await props.params;
  const gallery = await getGalleryBySlug(slug);

  if (!gallery) notFound();

  const formattedDate = formatDateLong(gallery.eventDate);

  return (
    <article>
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <BackLink href="/portfolio" label="Back to Portfolio" />
      </div>

      <div className="relative mt-6 h-[60svh] min-h-[420px] w-full">
        <SafeImage
          src={gallery.coverImageUrl}
          alt={gallery.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-12">
          <Badge tone={CATEGORY_TONES[gallery.category]} className="mb-4 w-fit bg-linen/90">
            {CATEGORY_LABELS[gallery.category]}
          </Badge>
          <h1 className="max-w-3xl font-display text-4xl leading-tight text-linen md:text-5xl">
            {gallery.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-accent text-xl text-linen/90">
            {gallery.location && <span>{gallery.location}</span>}
            {formattedDate && <span>{formattedDate}</span>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-14">
        <p className="font-display text-xl leading-relaxed text-ink-soft">
          {gallery.storyText}
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-20">
        <StoryLightbox images={gallery.images} />
      </div>
    </article>
  );
}
