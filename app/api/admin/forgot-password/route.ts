import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetOtp } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { generateOtp, hashOtp, OTP_EXPIRY_MS } from "@/lib/otp";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const { ok } = rateLimit(`forgot-password:${ip}`, 5, 15 * 60_000);
  if (!ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const { email } = parsed.data;
  const genericResponse = NextResponse.json({
    ok: true,
    message: "If an account exists for that email, a code has been sent.",
  });

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return the same generic response so we don't leak whether an
  // account exists for this email.
  if (!user) return genericResponse;

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);

  // Invalidate any previous unconsumed OTPs for this user.
  await prisma.passwordResetOtp.updateMany({
    where: { userId: user.id, consumed: false },
    data: { consumed: true },
  });

  await prisma.passwordResetOtp.create({
    data: {
      userId: user.id,
      otpHash,
      otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    },
  });

  try {
    await sendPasswordResetOtp(email, otp);
  } catch (err) {
    console.error("[forgot-password] Failed to send OTP email:", err);
    // A mail-server failure is not account-dependent, so reporting it leaks
    // nothing about whether this email is registered. Staying silent here
    // would leave Akshat waiting for a code that is never coming.
    return NextResponse.json(
      {
        error:
          "We couldn't send the reset code right now. Please try again shortly.",
      },
      { status: 503 }
    );
  }

  return genericResponse;
}
