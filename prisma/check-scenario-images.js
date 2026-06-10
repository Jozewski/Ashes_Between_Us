// prisma/check-scenario-images.js
//
// Audits scenario image coverage. Confirms that each image used in the live DB
// and each AI-selectable image exists on disk.
//
// Run with: node prisma/check-scenario-images.js

import { existsSync } from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma.js";
import { VALID_BACKGROUND_IMAGES } from "../lib/futureSelfService.js";

const PUBLIC_DIR = path.join(process.cwd(), "public");

function imageFileExists(imageUrl) {
  if (typeof imageUrl !== "string" || !imageUrl) return false;
  return existsSync(path.join(PUBLIC_DIR, imageUrl.replace(/^\//, "")));
}

let problems = 0;

try {
  const scenarios = await prisma.scenario.findMany({
    select: { imageUrl: true },
  });

  const counts = new Map();
  for (const { imageUrl } of scenarios) {
    const key = imageUrl ?? "(null)";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  console.log("SEED/DB SCENARIO IMAGES");
  for (const [url, n] of [...counts.entries()].sort()) {
    const fileOk = imageFileExists(url);
    const flag = fileOk ? "" : "  x MISSING IMAGE FILE";
    if (!fileOk) problems++;
    console.log(`  ${String(n).padStart(2)}  ${url}${flag}`);
  }

  console.log("\nAI-SELECTABLE IMAGES");
  for (const url of VALID_BACKGROUND_IMAGES) {
    const fileOk = imageFileExists(url);
    const flag = fileOk ? "" : "  x MISSING IMAGE FILE";
    if (!fileOk) problems++;
    console.log(`      ${url}${flag}`);
  }

  console.log(
    `\nTOTAL scenarios=${scenarios.length} distinctImages=${counts.size} problems=${problems}`,
  );
  if (problems > 0) process.exitCode = 1;
} catch (error) {
  console.error("SCENARIO_IMAGE_CHECK_FAIL", error?.message ?? error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
