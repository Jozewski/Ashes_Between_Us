import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const sql = neon(connectionString);

const statements = [
  `
  CREATE TABLE IF NOT EXISTS "Avatar" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "trait" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "backstory" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "futureImageUrl" TEXT NOT NULL,
    "futureImageByState" JSONB NOT NULL,
    "startingStats" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
  `,
  `CREATE INDEX IF NOT EXISTS "Avatar_sortOrder_idx" ON "Avatar"("sortOrder")`,
  `
  CREATE TABLE IF NOT EXISTS "Scenario" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "setting" TEXT NOT NULL,
    "message" TEXT,
    "futureMsg" TEXT NOT NULL,
    "futureSelfMessage" TEXT,
    "imageUrl" TEXT NOT NULL,
    "consequences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
  `,
  `CREATE INDEX IF NOT EXISTS "Scenario_createdAt_idx" ON "Scenario"("createdAt")`,
  `
  CREATE TABLE IF NOT EXISTS "Choice" (
    "id" TEXT PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "hopeChange" INTEGER NOT NULL,
    "trustChange" INTEGER NOT NULL,
    "chaosChange" INTEGER NOT NULL,
    "humanityChange" INTEGER NOT NULL,
    "requiredRole" TEXT,
    "roleBonus" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Choice_scenarioId_fkey"
      FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  )
  `,
  `CREATE INDEX IF NOT EXISTS "Choice_scenarioId_idx" ON "Choice"("scenarioId")`,
  `
  CREATE TABLE IF NOT EXISTS "Attempt" (
    "id" TEXT PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT,
    "avatarId" TEXT NOT NULL,
    "avatarName" TEXT,
    "scenarioId" TEXT NOT NULL,
    "scenarioTitle" TEXT,
    "choiceId" TEXT NOT NULL,
    "choiceText" TEXT,
    "outcome" TEXT,
    "hope" INTEGER NOT NULL,
    "trust" INTEGER NOT NULL,
    "chaos" INTEGER NOT NULL,
    "humanity" INTEGER NOT NULL,
    "statsAfter" JSONB
  )
  `,
  `CREATE INDEX IF NOT EXISTS "Attempt_avatarId_createdAt_idx" ON "Attempt"("avatarId", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "Attempt_scenarioId_idx" ON "Attempt"("scenarioId")`,
  `ALTER TABLE "Attempt" ADD COLUMN IF NOT EXISTS "runId" TEXT`,
  `CREATE INDEX IF NOT EXISTS "Attempt_runId_idx" ON "Attempt"("runId")`,
];

for (const statement of statements) {
  await sql(statement);
}

console.log("NEON_SCHEMA_BOOTSTRAPPED");
