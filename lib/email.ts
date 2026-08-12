import nodemailer from "nodemailer";
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

/**
 * Gmail SMTP via Nodemailer, using an App Password
 * (Google Account > Security > 2-Step Verification > App Passwords).
 *
 * Built lazily: reading env vars at module load meant a config change needed
 * a restart, and an import could fail before the app was even serving.
 */
let transport: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "Email is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD."
    );
  }

  if (!transport) {
    transport = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  return transport;
}

/** True when email can be sent — lets callers fail early with a clear message. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

/**
 * Throws when delivery fails or email isn't configured. Callers decide how to
 * react: the contact form swallows it (the enquiry is already saved to the
 * database), while the OTP flow surfaces it — a reset code that silently never
 * arrives is worse than an honest error.
 */
async function sendEmail({ to, subject, text }: SendEmailArgs): Promise<void> {
  const mailer = getTransport();
  const from = `"Stories By Akshat" <${process.env.GMAIL_USER}>`;

  await mailer.sendMail({ from, to, subject, text });
  console.log(`[email] Sent via Gmail SMTP to ${to}: "${subject}"`);
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
