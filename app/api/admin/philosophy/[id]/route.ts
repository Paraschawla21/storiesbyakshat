import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateAbout } from "@/lib/revalidate";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/philosophy/[id]">
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json();
  const { title, body: itemBody, order } = body;

  const item = await prisma.philosophyItem.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(itemBody !== undefined ? { body: itemBody } : {}),
      ...(order !== undefined ? { order } : {}),
    },
  });

  revalidateAbout();

  return NextResponse.json({ item });
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/philosophy/[id]">
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await prisma.philosophyItem.delete({ where: { id } });
  revalidateAbout();

  return NextResponse.json({ ok: true });
}
