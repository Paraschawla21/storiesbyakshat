import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateEditorial } from "@/lib/revalidate";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/editorial/[id]">
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json();
  const { caption, published, order } = body;

  const image = await prisma.editorialImage.update({
    where: { id },
    data: {
      ...(caption !== undefined ? { caption: caption || null } : {}),
      ...(published !== undefined ? { published: Boolean(published) } : {}),
      ...(order !== undefined ? { order } : {}),
    },
  });

  revalidateEditorial();

  return NextResponse.json({ image });
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/editorial/[id]">
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await prisma.editorialImage.delete({ where: { id } });
  revalidateEditorial();

  return NextResponse.json({ ok: true });
}
