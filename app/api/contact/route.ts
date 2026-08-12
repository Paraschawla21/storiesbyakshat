import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendContactNotification, sendContactAutoReply } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { validatePhoneNumber } from "@/lib/phone";
import { validateEventDate } from "@/lib/event-date";

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
  eventDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .superRefine((value, ctx) => {
      const result = validateEventDate(value);
      if (!result.valid) {
        ctx.addIssue({ code: "custom", message: result.message });
      }
    }),
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

  // The enquiry has two independent delivery channels: the database (so it
  // shows in the admin inbox) and email (so Akshat is notified). Treat them
  // separately — losing one must not lose the enquiry. We only report failure
  // to the visitor if BOTH channels fail.
  let saved: { id: string } | null = null;
  try {
    saved = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        eventType: eventType || null,
        eventDate: eventDate ? new Date(eventDate) : null,
        message: message || null,
      },
      select: { id: true },
    });
  } catch (err) {
    console.error("[contact] Failed to save message to database:", err);
  }

  // allSettled, not all: the visitor's auto-reply bouncing must not mask the
  // fact that Akshat's notification went through. Only the notification
  // determines whether the enquiry actually reached him.
  let emailed = false;
  const [notification, autoReply] = await Promise.allSettled([
    sendContactNotification({ name, email, phone, eventType, eventDate, message }),
    sendContactAutoReply({ name, email, phone, eventType, eventDate, message }),
  ]);
  if (notification.status === "fulfilled") {
    emailed = true;
  } else {
    console.error("[contact] Failed to send admin notification:", notification.reason);
  }
  if (autoReply.status === "rejected") {
    console.error("[contact] Failed to send auto-reply:", autoReply.reason);
  }

  if (!saved && !emailed) {
    return NextResponse.json(
      {
        error:
          "We couldn't submit your enquiry right now. Please email storiesbyakshat24@gmail.com directly and we'll get straight back to you.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, id: saved?.id ?? null });
}
