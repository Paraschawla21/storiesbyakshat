-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EditorialImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'IMAGE',
    "url" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "caption" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_EditorialImage" ("caption", "createdAt", "height", "id", "order", "published", "url", "width") SELECT "caption", "createdAt", "height", "id", "order", "published", "url", "width" FROM "EditorialImage";
DROP TABLE "EditorialImage";
ALTER TABLE "new_EditorialImage" RENAME TO "EditorialImage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
