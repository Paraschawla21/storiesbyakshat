import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateGalleries } from "@/lib/revalidate";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const galleries = await prisma.gallery.findMany({
    orderBy: { order: "asc" },
    include: { images: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ galleries });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    title,
    category,
    coverImageUrl,
    coverWidth,
    coverHeight,
    storyText,
    eventDate,
    location,
    published,
    images,
  } = body;

  if (!title || !category || !coverImageUrl) {
    return NextResponse.json(
      { error: "title, category, and coverImageUrl are required." },
      { status: 400 }
    );
  }

  let slug = slugify(title);
  const existing = await prisma.gallery.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const maxOrder = await prisma.gallery.aggregate({ _max: { order: true } });

  const gallery = await prisma.gallery.create({
    data: {
      title,
      slug,
      category,
      coverImageUrl,
      coverWidth: coverWidth ?? 1200,
      coverHeight: coverHeight ?? 1500,
      storyText: storyText || null,
      eventDate: eventDate ? new Date(eventDate) : null,
      location: location || null,
      published: Boolean(published),
      order: (maxOrder._max.order ?? -1) + 1,
      images: {
        create: (images ?? []).map(
          (
            img: { url: string; width: number; height: number; caption?: string },
            i: number
          ) => ({
            url: img.url,
            width: img.width,
            height: img.height,
            caption: img.caption || null,
            order: i,
          })
        ),
      },
    },
    include: { images: true },
  });

  revalidateGalleries(gallery.slug);

  return NextResponse.json({ gallery }, { status: 201 });
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
      prisma.gallery.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );

  revalidateGalleries();

  return NextResponse.json({ ok: true });
}
