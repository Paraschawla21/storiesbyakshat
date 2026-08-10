import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendContactNotification, sendContactAutoReply } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { validatePhoneNumber } from "@/lib/phone";

const contactSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z.string().max(50).superRefine((value, ctx) => {
    const result = validatePhoneNumber(value);
    if (!result.valid) {
      ctx.addIssue({ code: "custom", message: result.message });
    }
  }),
  eventType: z.string().max(50).optional(),
  eventDate: z.string().optional().or(z.literal("")),
  message: z.string().max(5000).optional().or(z.literal("")),
  // honeypot — bots tend to fill every field
  company: z.string().max(0).optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  const { ok } = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid form data.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Honeypot tripped — silently pretend success so bots don't learn.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  const { name, email, phone, eventType, eventDate, message } = parsed.data;

  const saved = await prisma.contactMessage.create({
    data: {
      name,
      email,
      phone: phone || null,
      eventType: eventType || null,
      eventDate: eventDate ? new Date(eventDate) : null,
      message: message || null,
    },
  });

  try {
    await Promise.all([
      sendContactNotification({ name, email, phone, eventType, eventDate, message }),
      sendContactAutoReply({ name, email, phone, eventType, eventDate, message }),
    ]);
  } catch (err) {
    // Don't fail the request if email delivery fails — the message is already saved.
    console.error("[contact] Failed to send email:", err);
  }

  return NextResponse.json({ ok: true, id: saved.id });
}
