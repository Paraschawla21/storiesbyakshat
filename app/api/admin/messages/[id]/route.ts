import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/messages/[id]">
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json();
  const { status } = body;

  if (!["NEW", "READ", "RESPONDED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const message = await prisma.contactMessage.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ message });
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/messages/[id]">
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await prisma.contactMessage.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
