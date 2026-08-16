import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateHomepage } from "@/lib/revalidate";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let content = await prisma.homepageContent.findFirst();
  if (!content) {
    content = await prisma.homepageContent.create({ data: {} });
  }

  return NextResponse.json({ content });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    eyebrow,
    heroHeading,
    heroImageUrl,
    heroImageAlt,
    ctaPrimaryLabel,
    ctaSecondaryLabel,
    featuredBadge,
    featuredHeading,
    categoriesHeading,
    testimonialsHeading,
    closingHeading,
    closingSubtext,
    closingCtaLabel,
  } = body;

  const data = {
    ...(eyebrow !== undefined ? { eyebrow } : {}),
    ...(heroHeading !== undefined ? { heroHeading } : {}),
    ...(heroImageUrl !== undefined ? { heroImageUrl } : {}),
    ...(heroImageAlt !== undefined ? { heroImageAlt } : {}),
    ...(ctaPrimaryLabel !== undefined ? { ctaPrimaryLabel } : {}),
    ...(ctaSecondaryLabel !== undefined ? { ctaSecondaryLabel } : {}),
    ...(featuredBadge !== undefined ? { featuredBadge } : {}),
    ...(featuredHeading !== undefined ? { featuredHeading } : {}),
    ...(categoriesHeading !== undefined ? { categoriesHeading } : {}),
    ...(testimonialsHeading !== undefined ? { testimonialsHeading } : {}),
    ...(closingHeading !== undefined ? { closingHeading } : {}),
    ...(closingSubtext !== undefined ? { closingSubtext } : {}),
    ...(closingCtaLabel !== undefined ? { closingCtaLabel } : {}),
  };

  const existing = await prisma.homepageContent.findFirst();
  const content = existing
    ? await prisma.homepageContent.update({ where: { id: existing.id }, data })
    : await prisma.homepageContent.create({ data });

  revalidateHomepage();

  if (
    heroImageUrl !== undefined &&
    existing?.heroImageUrl &&
    heroImageUrl !== existing.heroImageUrl
  ) {
    void deleteFromCloudinary(existing.heroImageUrl);
  }

  return NextResponse.json({ content });
}
