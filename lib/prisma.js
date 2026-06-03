// lib/prisma.js
// Singleton Prisma client — prevents connection exhaustion in dev.
// Your partner owns this file on the backend branch.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["query"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
