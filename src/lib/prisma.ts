import { PrismaClient } from "@prisma/client";
import { getPrismaDatabaseUrl } from "@/lib/database";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: getPrismaDatabaseUrl() },
    },
  });

globalForPrisma.prisma = prisma;
