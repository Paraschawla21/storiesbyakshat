import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateGalleries } from "@/lib/revalidate";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/galleries/[id]">
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const gallery = await prisma.gallery.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });

  if (!gallery) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ gallery });
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/galleries/[id]">
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
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

  const gallery = await prisma.gallery.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(coverImageUrl !== undefined ? { coverImageUrl } : {}),
      ...(coverWidth !== undefined ? { coverWidth } : {}),
      ...(coverHeight !== undefined ? { coverHeight } : {}),
      ...(storyText !== undefined ? { storyText: storyText || null } : {}),
      ...(eventDate !== undefined
        ? { eventDate: eventDate ? new Date(eventDate) : null }
        : {}),
      ...(location !== undefined ? { location: location || null } : {}),
      ...(published !== undefined ? { published: Boolean(published) } : {}),
      ...(images !== undefined
        ? {
            images: {
              deleteMany: {},
              create: images.map(
                (
                  img: {
                    url: string;
                    width: number;
                    height: number;
                    caption?: string;
                  },
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
          }
        : {}),
    },
    include: { images: { orderBy: { order: "asc" } } },
  });

  revalidateGalleries(gallery.slug);

  return NextResponse.json({ gallery });
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/galleries/[id]">
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const removed = await prisma.gallery.delete({ where: { id } });
  revalidateGalleries(removed.slug);

  return NextResponse.json({ ok: true });
}
