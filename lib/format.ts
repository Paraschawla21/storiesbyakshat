/**
 * Date formatting helpers.
 *
 * These deliberately pin BOTH the locale and the time zone. Without them,
 * `toLocaleDateString()` falls back to the runtime's own settings — which
 * differ between the server (often UTC / en-US) and the visitor's browser
 * (e.g. en-IN, Asia/Kolkata). That mismatch produces React hydration
 * errors like "8/6/2026" on the server vs "06/08/2026" on the client.
 *
 * Pinning to Asia/Kolkata also means dates always read as the studio's
 * local date, which is the correct frame of reference for shoot dates and
 * enquiry timestamps.
 */
const LOCALE = "en-IN";
const TIME_ZONE = "Asia/Kolkata";

/** e.g. "14 November 2025" — used for public-facing dates. */
export function formatDateLong(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  });
}

/** e.g. "14 Nov 2025" — compact and unambiguous, for admin lists. */
export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  });
}

/**
 * e.g. "14 November 2025, 4:30 pm IST" — for timestamps in notification
 * emails, where the reader needs to know when something arrived and in
 * which zone.
 */
export function formatDateTimeLong(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleString(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TIME_ZONE,
    timeZoneName: "short",
  });
}

/**
 * Current year in the studio's time zone. Pinning the zone matters here
 * too: around New Year, a UTC server and an IST browser would otherwise
 * disagree (e.g. 31 Dec UTC is already 1 Jan in Kolkata), which would
 * surface as a hydration mismatch in the footer copyright line.
 */
export function getCurrentYear(): number {
  return Number(
    new Date().toLocaleString("en-US", { year: "numeric", timeZone: TIME_ZONE })
  );
}
