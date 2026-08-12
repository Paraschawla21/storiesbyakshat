/**
 * Event-date rules, shared by the contact form and the API route so the two
 * can't drift apart.
 *
 * Everything is compared as "YYYY-MM-DD" strings rather than Date objects.
 * ISO date strings sort lexicographically, which sidesteps the usual
 * timezone bugs entirely.
 *
 * "Today" is always resolved in Asia/Kolkata. Vercel runs in UTC, so a
 * client in India selecting today's date any time before 05:30 IST would be
 * rejected by a naive server-side check — the UTC clock still reads
 * yesterday. Pinning both sides to the studio's timezone removes that class
 * of bug.
 */
const TIME_ZONE = "Asia/Kolkata";

const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today in the studio's timezone, as YYYY-MM-DD. */
export function todayKey(now: Date = new Date()): string {
  // en-CA already formats as YYYY-MM-DD.
  return formatter.format(now);
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface EventDateResult {
  valid: boolean;
  message?: string;
}

/**
 * The field is optional, so an empty value is valid. A supplied value must
 * be a real calendar date and must not be in the past.
 */
export function validateEventDate(value?: string | null): EventDateResult {
  if (!value) return { valid: true };

  if (!DATE_PATTERN.test(value)) {
    return { valid: false, message: "Please choose a valid date." };
  }

  const [y, m, d] = value.split("-").map(Number);
  const parsed = new Date(y, m - 1, d);
  // Rejects impossible dates that still match the pattern, e.g. 2026-02-31,
  // which JavaScript would silently roll forward into March.
  if (
    parsed.getFullYear() !== y ||
    parsed.getMonth() !== m - 1 ||
    parsed.getDate() !== d
  ) {
    return { valid: false, message: "Please choose a valid date." };
  }

  if (value < todayKey()) {
    return { valid: false, message: "Please choose today or a future date." };
  }

  return { valid: true };
}
