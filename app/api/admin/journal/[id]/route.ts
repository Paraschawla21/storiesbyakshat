import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateJournal } from "@/lib/revalidate";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/journal/[id]">
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const post = await prisma.blogPost.findUnique({ where: { id } });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ post });
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/journal/[id]">
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
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

  const current = await prisma.blogPost.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nowPublishing = published === true && !current.published;

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(coverImageUrl !== undefined ? { coverImageUrl } : {}),
      ...(coverWidth !== undefined ? { coverWidth } : {}),
      ...(coverHeight !== undefined ? { coverHeight } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(excerpt !== undefined ? { excerpt: excerpt || null } : {}),
      ...(tags !== undefined
        ? { tags: Array.isArray(tags) ? tags.join(",") : tags }
        : {}),
      ...(published !== undefined ? { published: Boolean(published) } : {}),
      ...(nowPublishing ? { publishedAt: new Date() } : {}),
    },
  });

  revalidateJournal(post.slug);

  return NextResponse.json({ post });
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/journal/[id]">
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const removed = await prisma.blogPost.delete({ where: { id } });
  revalidateJournal(removed.slug);

  return NextResponse.json({ ok: true });
}
