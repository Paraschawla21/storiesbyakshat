import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const images = await prisma.editorialImage.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ images });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { type, url, width, height, caption, published } = body;

  if (!url || !width || !height) {
    return NextResponse.json(
      { error: "url, width, and height are required." },
      { status: 400 }
    );
  }

  const maxOrder = await prisma.editorialImage.aggregate({ _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const image = await prisma.editorialImage.create({
    data: {
      type: type === "VIDEO" ? "VIDEO" : "IMAGE",
      url,
      width,
      height,
      caption: caption || null,
      published: published !== undefined ? Boolean(published) : true,
      order: nextOrder,
    },
  });

  return NextResponse.json({ image }, { status: 201 });
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
      prisma.editorialImage.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
