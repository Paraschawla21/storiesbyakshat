import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { verifyResetTokenHash } from "@/lib/otp";

const schema = z.object({
  email: z.string().email(),
  resetToken: z.string().min(10),
  newPassword: z.string().min(8).max(100),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const { ok } = rateLimit(`reset-password:${ip}`, 10, 15 * 60_000);
  if (!ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request." },
      { status: 400 }
    );
  }

  const { email, resetToken, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
  }

  const record = await prisma.passwordResetOtp.findFirst({
    where: { userId: user.id, verified: true, consumed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record || !record.resetTokenHash || !record.resetTokenExpiresAt) {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
  }

  if (record.resetTokenExpiresAt < new Date()) {
    await prisma.passwordResetOtp.update({
      where: { id: record.id },
      data: { consumed: true },
    });
    return NextResponse.json(
      { error: "This reset session has expired. Please start over." },
      { status: 400 }
    );
  }

  const valid = await verifyResetTokenHash(resetToken, record.resetTokenHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.passwordResetOtp.update({
      where: { id: record.id },
      data: { consumed: true },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
