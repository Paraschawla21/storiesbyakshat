import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  verifyOtpHash,
  generateResetToken,
  hashResetToken,
  MAX_OTP_ATTEMPTS,
  RESET_TOKEN_EXPIRY_MS,
} from "@/lib/otp";

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const { ok } = rateLimit(`verify-otp:${ip}`, 10, 15 * 60_000);
  if (!ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { email, otp } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  const record = await prisma.passwordResetOtp.findFirst({
    where: { userId: user.id, consumed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  if (record.otpExpiresAt < new Date()) {
    await prisma.passwordResetOtp.update({
      where: { id: record.id },
      data: { consumed: true },
    });
    return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 });
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.passwordResetOtp.update({
      where: { id: record.id },
      data: { consumed: true },
    });
    return NextResponse.json(
      { error: "Too many incorrect attempts. Please request a new code." },
      { status: 400 }
    );
  }

  const valid = await verifyOtpHash(otp, record.otpHash);

  if (!valid) {
    await prisma.passwordResetOtp.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
  }

  // OTP verified — issue a short-lived reset token for the final step.
  const resetToken = generateResetToken();
  const resetTokenHash = await hashResetToken(resetToken);

  await prisma.passwordResetOtp.update({
    where: { id: record.id },
    data: {
      verified: true,
      resetTokenHash,
      resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS),
    },
  });

  return NextResponse.json({ ok: true, resetToken });
}
