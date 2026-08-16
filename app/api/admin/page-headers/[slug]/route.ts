import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePageHeader } from "@/lib/revalidate";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/page-headers/[slug]">
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await ctx.params;
  const body = await request.json();
  const { badge, heading, subheading } = body;

  const header = await prisma.pageHeader.update({
    where: { slug },
    data: {
      ...(badge !== undefined ? { badge } : {}),
      ...(heading !== undefined ? { heading } : {}),
      ...(subheading !== undefined ? { subheading: subheading || null } : {}),
    },
  });

  revalidatePageHeader(slug);

  return NextResponse.json({ header });
}
