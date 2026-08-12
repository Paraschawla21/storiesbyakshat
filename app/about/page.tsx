import SafeImage from "@/components/ui/SafeImage";
import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About | Stories by Akshat",
  description:
    "Meet Akshat — wedding and portrait photographer telling stories in golden-hour light.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <Reveal direction="right" className="md:order-2">
        <div className="group relative aspect-4/5 overflow-hidden rounded-2xl">
          <SafeImage
            src="https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1000&q=80"
            alt="Akshat, photographer"
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
            About
          </Badge>
          <h1 className="mb-6 font-display text-4xl leading-tight text-ink md:text-5xl">
            Hi, I&apos;m Akshat.
          </h1>
          <p className="mb-4 text-lg leading-relaxed text-ink-soft">
            I&apos;ve spent the last decade photographing weddings, portraits,
            and the small, unrepeatable moments in between. I started with a
            borrowed film camera at a cousin&apos;s wedding and never really
            put it down.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-ink-soft">
            My approach is simple: stay out of the way, watch closely, and
            wait for the light to do most of the work. I&apos;m drawn to
            golden hour, unscripted laughter, and the quiet minutes before a
            ceremony begins &mdash; the parts most people forget to notice
            until they see the photos.
          </p>
          <p className="mb-8 text-lg leading-relaxed text-ink-soft">
            When I&apos;m not shooting, I&apos;m usually developing film in a
            makeshift darkroom, scouting new locations, or getting
            embarrassingly emotional at other people&apos;s weddings.
          </p>
          <Button href="/contact" variant="primary">
            Work With Me
          </Button>
        </div>
        </Reveal>
      </div>

      <div className="mt-24">
        <Reveal>
          <h2 className="mb-8 font-display text-3xl text-ink">
            My Philosophy
          </h2>
        </Reveal>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              title: "Presence over performance",
              body: "I photograph what's actually happening, not a staged version of it.",
            },
            {
              title: "Light first, always",
              body: "Every shoot is planned around the light, not squeezed around a schedule.",
            },
            {
              title: "The story, not just the shot",
              body: "Every gallery is sequenced to be read like a story from start to finish.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.1}>
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
