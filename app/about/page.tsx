import SafeImage from "@/components/ui/SafeImage";
import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { getAboutContent, getPhilosophyItems } from "@/lib/content";

export const metadata: Metadata = {
  title: "About | Stories by Akshat",
  description:
    "Meet Akshat — wedding and portrait photographer telling stories in golden-hour light.",
};

export default async function AboutPage() {
  const [about, philosophyItems] = await Promise.all([
    getAboutContent(),
    getPhilosophyItems(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <Reveal direction="right" className="md:order-2">
        <div className="group relative aspect-4/5 overflow-hidden rounded-2xl">
          <SafeImage
            src={about.photoUrl}
            alt={about.photoAlt}
            fill
            priority
            sizes="(min-width: 768px) 500px, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        </Reveal>
        <Reveal direction="left" className="md:order-1">
        <div>
          <Badge tone="marigold" className="mb-4">
            {about.badge}
          </Badge>
          <h1 className="mb-6 font-display text-4xl leading-tight text-ink md:text-5xl">
            {about.heading}
          </h1>
          <p className="mb-4 text-lg leading-relaxed text-ink-soft">
            {about.bioParagraph1}
          </p>
          <p className="mb-4 text-lg leading-relaxed text-ink-soft">
            {about.bioParagraph2}
          </p>
          <p className="mb-8 text-lg leading-relaxed text-ink-soft">
            {about.bioParagraph3}
          </p>
          <Button href="/contact" variant="primary">
            {about.ctaLabel}
          </Button>
        </div>
        </Reveal>
      </div>

      <div className="mt-24">
        <Reveal>
          <h2 className="mb-8 font-display text-3xl text-ink">
            {about.philosophyHeading}
          </h2>
        </Reveal>
        <div className="grid gap-8 sm:grid-cols-3">
          {philosophyItems.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.1}>
              <h3 className="mb-2 font-display text-xl text-marigold-dark">
                {item.title}
              </h3>
              <p className="text-ink-soft">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
