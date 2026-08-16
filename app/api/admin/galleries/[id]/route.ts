import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateGalleries } from "@/lib/revalidate";
import { deleteManyFromCloudinary } from "@/lib/cloudinary";

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

  const current = await prisma.gallery.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

  // Clean up Cloudinary assets that are no longer referenced by this
  // gallery — the replaced cover image, and any gallery images dropped or
  // swapped out by the images array replace above. Best-effort: never
  // blocks the response, since the DB is already the source of truth.
  const orphaned: (string | null | undefined)[] = [];
  if (coverImageUrl !== undefined && coverImageUrl !== current.coverImageUrl) {
    orphaned.push(current.coverImageUrl);
  }
  if (images !== undefined) {
    const keptUrls = new Set(
      (images as { url: string }[]).map((img) => img.url)
    );
    for (const oldImage of current.images) {
      if (!keptUrls.has(oldImage.url)) orphaned.push(oldImage.url);
    }
  }
  if (orphaned.length > 0) void deleteManyFromCloudinary(orphaned);

  return NextResponse.json({ gallery });
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/galleries/[id]">
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const removed = await prisma.gallery.delete({
    where: { id },
    include: { images: true },
  });
  revalidateGalleries(removed.slug);

  void deleteManyFromCloudinary([
    removed.coverImageUrl,
    ...removed.images.map((img) => img.url),
  ]);

  return NextResponse.json({ ok: true });
}
