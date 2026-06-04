// lib/prisma.js
// Singleton Prisma client — prevents connection exhaustion in dev.
// Your partner owns this file on the backend branch.

let prismaClient = null;

try {
  const { PrismaClient } = await import("@prisma/client");
  const globalForPrisma = globalThis;
  prismaClient = globalForPrisma.prisma ?? new PrismaClient({ log: ["query"] });
  if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = prismaClient;
} catch (error) {
  prismaClient = null;
}

export const prisma = prismaClient;
