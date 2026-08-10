import path from "path";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// prisma.config.ts resolves DATABASE_URL ("file:./dev.db") relative to the
// project root, so we mirror that here for the runtime client too.
const dbPath = path.join(process.cwd(), "dev.db");

const adapter = new PrismaBetterSqlite3({
  url: `file://${dbPath}`,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
