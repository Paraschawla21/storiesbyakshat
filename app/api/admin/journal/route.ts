import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateJournal } from "@/lib/revalidate";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    title,
    coverImageUrl,
    coverWidth,
    coverHeight,
    content,
    excerpt,
    tags,
    published,
  } = body;

  if (!title || !coverImageUrl || !content) {
    return NextResponse.json(
      { error: "title, coverImageUrl, and content are required." },
      { status: 400 }
    );
  }

  let slug = slugify(title);
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      coverImageUrl,
      coverWidth: coverWidth ?? 1400,
      coverHeight: coverHeight ?? 1050,
      content,
      excerpt: excerpt || null,
      tags: Array.isArray(tags) ? tags.join(",") : tags || "",
      published: Boolean(published),
      publishedAt: published ? new Date() : null,
    },
  });

  revalidateJournal(post.slug);

  return NextResponse.json({ post }, { status: 201 });
}
