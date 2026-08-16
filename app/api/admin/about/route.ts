import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateAbout } from "@/lib/revalidate";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let content = await prisma.aboutContent.findFirst();
  if (!content) {
    content = await prisma.aboutContent.create({ data: {} });
  }

  return NextResponse.json({ content });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    badge,
    heading,
    bioParagraph1,
    bioParagraph2,
    bioParagraph3,
    photoUrl,
    photoAlt,
    ctaLabel,
    philosophyHeading,
  } = body;

  const data = {
    ...(badge !== undefined ? { badge } : {}),
    ...(heading !== undefined ? { heading } : {}),
    ...(bioParagraph1 !== undefined ? { bioParagraph1 } : {}),
    ...(bioParagraph2 !== undefined ? { bioParagraph2 } : {}),
    ...(bioParagraph3 !== undefined ? { bioParagraph3 } : {}),
    ...(photoUrl !== undefined ? { photoUrl } : {}),
    ...(photoAlt !== undefined ? { photoAlt } : {}),
    ...(ctaLabel !== undefined ? { ctaLabel } : {}),
    ...(philosophyHeading !== undefined ? { philosophyHeading } : {}),
  };

  const existing = await prisma.aboutContent.findFirst();
  const content = existing
    ? await prisma.aboutContent.update({ where: { id: existing.id }, data })
    : await prisma.aboutContent.create({ data });

  revalidateAbout();

  if (
    photoUrl !== undefined &&
    existing?.photoUrl &&
    photoUrl !== existing.photoUrl
  ) {
    void deleteFromCloudinary(existing.photoUrl);
  }

  return NextResponse.json({ content });
}
