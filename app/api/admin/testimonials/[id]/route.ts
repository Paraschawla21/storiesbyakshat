import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateHomepage } from "@/lib/revalidate";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/testimonials/[id]">
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json();
  const { quote, name, published, order } = body;

  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: {
      ...(quote !== undefined ? { quote } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(published !== undefined ? { published: Boolean(published) } : {}),
      ...(order !== undefined ? { order } : {}),
    },
  });

  revalidateHomepage();

  return NextResponse.json({ testimonial });
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/testimonials/[id]">
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await prisma.testimonial.delete({ where: { id } });
  revalidateHomepage();

  return NextResponse.json({ ok: true });
}
