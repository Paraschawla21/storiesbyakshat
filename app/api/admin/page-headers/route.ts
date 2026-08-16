import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const headers = await prisma.pageHeader.findMany({ orderBy: { slug: "asc" } });
  return NextResponse.json({ headers });
}
