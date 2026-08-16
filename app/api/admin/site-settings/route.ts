import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateSiteSettings } from "@/lib/revalidate";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let content = await prisma.siteSettings.findFirst();
  if (!content) {
    content = await prisma.siteSettings.create({ data: {} });
  }

  return NextResponse.json({ content });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { siteTitle, siteDescription, footerTagline, footerSignature, instagramUrl } = body;

  const data = {
    ...(siteTitle !== undefined ? { siteTitle } : {}),
    ...(siteDescription !== undefined ? { siteDescription } : {}),
    ...(footerTagline !== undefined ? { footerTagline } : {}),
    ...(footerSignature !== undefined ? { footerSignature } : {}),
    ...(instagramUrl !== undefined ? { instagramUrl } : {}),
  };

  const existing = await prisma.siteSettings.findFirst();
  const content = existing
    ? await prisma.siteSettings.update({ where: { id: existing.id }, data })
    : await prisma.siteSettings.create({ data });

  revalidateSiteSettings();

  return NextResponse.json({ content });
}
