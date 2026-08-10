import type { Category } from "@/lib/generated/prisma/enums";

export type { Category };

/**
 * Single source of truth for category display labels and badge tones.
 * Deliberately has zero dependency on Prisma/server code so client
 * components (like admin forms) can import it without pulling the
 * database client into the browser bundle.
 */
export const CATEGORY_LABELS: Record<Category, string> = {
  WEDDING: "Wedding",
  PRE_WEDDING: "Pre-Wedding",
  PORTRAIT: "Portrait",
  EVENT: "Event",
};

export const CATEGORY_TONES: Record<Category, "marigold" | "rosewood" | "olive"> = {
  WEDDING: "marigold",
  PRE_WEDDING: "rosewood",
  PORTRAIT: "rosewood",
  EVENT: "olive",
};

export const ALL_CATEGORIES: Category[] = ["WEDDING", "PRE_WEDDING", "PORTRAIT", "EVENT"];
