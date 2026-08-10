-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "eventType" TEXT,
    "eventDate" DATETIME,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ContactMessage" ("createdAt", "email", "eventDate", "eventType", "id", "message", "name", "phone", "status") SELECT "createdAt", "email", "eventDate", "eventType", "id", "message", "name", "phone", "status" FROM "ContactMessage";
DROP TABLE "ContactMessage";
ALTER TABLE "new_ContactMessage" RENAME TO "ContactMessage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
