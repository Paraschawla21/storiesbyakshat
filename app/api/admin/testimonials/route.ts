import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateHomepage } from "@/lib/revalidate";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ testimonials });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { quote, name, published } = body;

  if (!quote || !name) {
    return NextResponse.json(
      { error: "quote and name are required." },
      { status: 400 }
    );
  }

  const maxOrder = await prisma.testimonial.aggregate({ _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const testimonial = await prisma.testimonial.create({
    data: {
      quote,
      name,
      published: published !== undefined ? Boolean(published) : true,
      order: nextOrder,
    },
  });

  revalidateHomepage();

  return NextResponse.json({ testimonial }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Bulk reorder: [{ id, order }, ...]
  const body = await request.json();
  const { items } = body as { items: { id: string; order: number }[] };

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "items array is required." }, { status: 400 });
  }

  await prisma.$transaction(
    items.map((item) =>
      prisma.testimonial.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );

  revalidateHomepage();

  return NextResponse.json({ ok: true });
}
