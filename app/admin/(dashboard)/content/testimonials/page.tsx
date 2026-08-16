import TestimonialsManager from "@/components/admin/TestimonialsManager";
import BackLink from "@/components/ui/BackLink";
import { prisma } from "@/lib/prisma";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <BackLink href="/admin/content" label="Site Content" />
      <h1 className="mb-8 font-display text-3xl text-ink">Testimonials</h1>
      <TestimonialsManager initialItems={testimonials} />
    </div>
  );
}
