import { prisma } from "../lib/prisma.js";

try {
  await prisma.$executeRawUnsafe("SELECT 1");
  console.log("PRISMA_QUERY_OK");
} catch (error) {
  console.error("PRISMA_QUERY_FAIL", error?.message ?? error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
