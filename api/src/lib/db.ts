import { PrismaClient } from "@prisma/client";

// Singleton Prisma client for the process
let prisma: PrismaClient | undefined;

export function getDb(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}
