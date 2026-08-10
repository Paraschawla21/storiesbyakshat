import nodemailer from "nodemailer";
import { Resend } from "resend";
import { formatDateLong, formatDateTimeLong } from "@/lib/format";

interface ContactEmailPayload {
  name: string;
  email: string;
  phone?: string;
  eventType?: string;
  eventDate?: string;
  message?: string;
}

interface SendEmailArgs {
  to: string;
  subject: string;
  text: string;
}

const FROM =
  process.env.EMAIL_FROM || "Stories by Akshat <onboarding@resend.dev>";

// --- Gmail SMTP (via Nodemailer) ---
// Simplest path for local dev / early production before a custom domain is
// verified with Resend: sends as your own Gmail account using an "App
// Password" (Google Account > Security > 2-Step Verification > App
// Passwords). Unlike Resend's sandbox sender, this can deliver to *any*
// recipient, not just your own verified address.
const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

const gmailTransport =
  gmailUser && gmailAppPassword
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailAppPassword },
      })
    : null;

// --- Resend (for production, once a custom domain is verified) ---
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Explicitly choose the provider via EMAIL_PROVIDER=gmail|resend.
 * If unset, prefer Gmail when configured (easiest zero-setup path for
 * local dev), otherwise fall back to Resend.
 */
const provider =
  process.env.EMAIL_PROVIDER || (gmailTransport ? "gmail" : "resend");

async function sendEmail({ to, subject, text }: SendEmailArgs): Promise<void> {
  if (provider === "gmail" && gmailTransport && gmailUser) {
    await gmailTransport.sendMail({
      from: `"Stories By Akshat" <${gmailUser}>`,
      to,
      subject,
      text,
    });
    console.log(`[email] Sent via Gmail SMTP to ${to}: "${subject}"`);
    return;
  }

  if (resend) {
    const result = await resend.emails.send({ from: FROM, to, subject, text });
    if (result.error) {
      throw new Error(result.error.message);
    }
    console.log(
      `[email] Sent via Resend to ${to}, id=${result.data?.id}: "${subject}"`
    );
    return;
  }

  console.warn(
    `[email] No email provider configured (set GMAIL_USER/GMAIL_APP_PASSWORD or RESEND_API_KEY) — would have sent "${subject}" to ${to}`
  );
}

export async function sendContactNotification(payload: ContactEmailPayload) {
  if (!process.env.ADMIN_EMAIL) {
    console.warn("[email] ADMIN_EMAIL not set — skipping admin notification email.");
    return;
  }

  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `New inquiry: ${payload.name} (${payload.eventType ?? "General"})`,
    text: [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      payload.phone ? `Phone: ${payload.phone}` : null,
      payload.eventType ? `Event Type: ${payload.eventType}` : null,
      payload.eventDate ? `Event Date: ${formatDateLong(payload.eventDate)}` : null,
      "",
      "Message:",
      payload.message?.trim() || "(no message provided)",
      "",
      `Received: ${formatDateTimeLong(new Date())}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export async function sendPasswordResetOtp(email: string, otp: string) {
  try {
    await sendEmail({
      to: email,
      subject: "Your password reset code — Stories by Akshat",
      text: `Your one-time password reset code is: ${otp}\n\nThis code expires in 10 minutes. If you didn't request a password reset, you can safely ignore this email.`,
    });
  } catch (err) {
    console.error("[email] Failed to send OTP email:", err);
    throw err;
  }
}

export async function sendContactAutoReply(payload: ContactEmailPayload) {
  // Echo back what they told us, so a mistyped date or wrong event type is
  // easy for them to spot and correct in a reply.
  const details = [
    payload.eventType ? `Event: ${payload.eventType}` : null,
    payload.eventDate ? `Date: ${formatDateLong(payload.eventDate)}` : null,
  ].filter(Boolean);

  const summary = details.length
    ? `\n\nHere's what you sent us:\n${details.join("\n")}\nIf anything looks wrong, just reply to this email.`
    : "";

  await sendEmail({
    to: payload.email,
    subject: "Thanks for reaching out — Stories by Akshat",
    text:
      `Hi ${payload.name},\n\n` +
      `Thanks for reaching out! Akshat will get back to you within 2-3 days.` +
      summary +
      `\n\nIn the meantime, feel free to browse the portfolio at ${
        process.env.NEXT_PUBLIC_SITE_URL ?? ""
      }/portfolio.\n\nWarmly,\nStories by Akshat`,
  });
}
