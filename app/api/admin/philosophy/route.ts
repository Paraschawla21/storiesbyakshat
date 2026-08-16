import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateAbout } from "@/lib/revalidate";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.philosophyItem.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, body: itemBody } = body;

  if (!title) {
    return NextResponse.json({ error: "title is required." }, { status: 400 });
  }

  const maxOrder = await prisma.philosophyItem.aggregate({ _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const item = await prisma.philosophyItem.create({
    data: {
      title,
      body: itemBody || "",
      order: nextOrder,
    },
  });

  revalidateAbout();

  return NextResponse.json({ item }, { status: 201 });
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
      prisma.philosophyItem.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );

  revalidateAbout();

  return NextResponse.json({ ok: true });
}
