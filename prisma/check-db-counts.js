import { prisma } from "../lib/prisma.js";

try {
  const scenarios = await prisma.scenario.count();
  const choices = await prisma.choice.count();
  const attempts = await prisma.attempt.count();
  console.log(`DB_COUNTS scenarios=${scenarios} choices=${choices} attempts=${attempts}`);
} catch (error) {
  console.error("DB_COUNT_CHECK_FAIL", error?.message ?? error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
