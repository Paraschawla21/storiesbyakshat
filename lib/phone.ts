export interface CountryCode {
  code: string;
  name: string;
  dial: string; // e.g. "+91"
  /** Expected length(s) of the national number, digits only (no dial code). */
  minDigits: number;
  maxDigits: number;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: "IN", name: "India", dial: "+91", minDigits: 10, maxDigits: 10 },
  { code: "US", name: "United States", dial: "+1", minDigits: 10, maxDigits: 10 },
  { code: "CA", name: "Canada", dial: "+1", minDigits: 10, maxDigits: 10 },
  { code: "GB", name: "United Kingdom", dial: "+44", minDigits: 10, maxDigits: 10 },
  { code: "AE", name: "UAE", dial: "+971", minDigits: 9, maxDigits: 9 },
  { code: "AU", name: "Australia", dial: "+61", minDigits: 9, maxDigits: 9 },
  { code: "SG", name: "Singapore", dial: "+65", minDigits: 8, maxDigits: 8 },
  { code: "DE", name: "Germany", dial: "+49", minDigits: 10, maxDigits: 11 },
  { code: "FR", name: "France", dial: "+33", minDigits: 9, maxDigits: 9 },
  { code: "IT", name: "Italy", dial: "+39", minDigits: 9, maxDigits: 10 },
  { code: "ES", name: "Spain", dial: "+34", minDigits: 9, maxDigits: 9 },
  { code: "NL", name: "Netherlands", dial: "+31", minDigits: 9, maxDigits: 9 },
  { code: "SA", name: "Saudi Arabia", dial: "+966", minDigits: 9, maxDigits: 9 },
  { code: "PK", name: "Pakistan", dial: "+92", minDigits: 10, maxDigits: 10 },
  { code: "BD", name: "Bangladesh", dial: "+880", minDigits: 10, maxDigits: 10 },
  { code: "NP", name: "Nepal", dial: "+977", minDigits: 10, maxDigits: 10 },
  { code: "LK", name: "Sri Lanka", dial: "+94", minDigits: 9, maxDigits: 9 },
  { code: "ID", name: "Indonesia", dial: "+62", minDigits: 9, maxDigits: 12 },
  { code: "MY", name: "Malaysia", dial: "+60", minDigits: 9, maxDigits: 10 },
  { code: "PH", name: "Philippines", dial: "+63", minDigits: 10, maxDigits: 10 },
  { code: "JP", name: "Japan", dial: "+81", minDigits: 10, maxDigits: 10 },
  { code: "CN", name: "China", dial: "+86", minDigits: 11, maxDigits: 11 },
  { code: "ZA", name: "South Africa", dial: "+27", minDigits: 9, maxDigits: 9 },
  { code: "NG", name: "Nigeria", dial: "+234", minDigits: 10, maxDigits: 10 },
  { code: "BR", name: "Brazil", dial: "+55", minDigits: 10, maxDigits: 11 },
];

export const DEFAULT_DIAL = "+91";

/** Sorted by dial length descending so "+971" isn't matched as "+9". */
const DIAL_CODES_BY_LENGTH = [...new Set(COUNTRY_CODES.map((c) => c.dial))].sort(
  (a, b) => b.length - a.length
);

/** Parses a stored value like "+91 9876543210" into { dial, digits }. */
export function parsePhoneValue(value: string | undefined | null) {
  if (!value) return { dial: DEFAULT_DIAL, digits: "" };

  const trimmed = value.trim();
  const matchedDial = DIAL_CODES_BY_LENGTH.find((dial) => trimmed.startsWith(dial));

  if (!matchedDial) {
    return { dial: DEFAULT_DIAL, digits: trimmed.replace(/\D/g, "") };
  }

  const digits = trimmed.slice(matchedDial.length).replace(/\D/g, "");
  return { dial: matchedDial, digits };
}

export function formatPhoneValue(dial: string, digits: string) {
  return digits ? `${dial} ${digits}` : "";
}

export function getCountryByDial(dial: string): CountryCode {
  return COUNTRY_CODES.find((c) => c.dial === dial) ?? COUNTRY_CODES[0];
}

export interface PhoneValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Validates a stored phone value ("+91 9876543210") against the expected
 * digit count for its country code. Used both client-side (Zod refine) and
 * server-side (API route) so the rule can never be bypassed.
 */
export function validatePhoneNumber(value: string | undefined | null): PhoneValidationResult {
  if (!value || !value.trim()) {
    return { valid: false, message: "Phone number is required." };
  }

  const { dial, digits } = parsePhoneValue(value);
  const country = getCountryByDial(dial);

  if (!digits) {
    return { valid: false, message: "Phone number is required." };
  }

  if (!/^\d+$/.test(digits)) {
    return { valid: false, message: "Please enter a valid phone number." };
  }

  if (digits.length < country.minDigits || digits.length > country.maxDigits) {
    return { valid: false, message: "Please enter a valid phone number." };
  }

  return { valid: true };
}
