// prisma/check-scenario-images.js
//
// Audits audio coverage for every scenario background image. Confirms that
// each image used in the live DB (and each AI-selectable image) resolves to a
// music track whose file actually exists on disk — so no scenario can ever be
// silent, whether the image came from seed data or AI generation.
//
// Run with:  node prisma/check-scenario-images.js

import { existsSync } from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma.js";
import { trackKeyForImage } from "../lib/sceneAudioMap.js";
import { MUSIC_TRACKS } from "../lib/audioTracks.js";
import { VALID_BACKGROUND_IMAGES } from "../lib/futureSelfService.js";

const PUBLIC_DIR = path.join(process.cwd(), "public");

function trackFileExists(trackKey) {
  const src = MUSIC_TRACKS[trackKey]?.src;
  if (!src) return false;
  return existsSync(path.join(PUBLIC_DIR, src.replace(/^\//, "")));
}

function describe(imageUrl) {
  const trackKey = trackKeyForImage(imageUrl);
  const dedicated = trackKey !== "default";
  const fileOk = trackFileExists(trackKey);
  return { trackKey, dedicated, fileOk };
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

  console.log("SEED/DB SCENARIO IMAGES -> TRACK");
  for (const [url, n] of [...counts.entries()].sort()) {
    const { trackKey, dedicated, fileOk } = describe(url);
    const flag = !fileOk
      ? "  x MISSING TRACK FILE"
      : dedicated
        ? ""
        : "  (default loop)";
    if (!fileOk) problems++;
    console.log(`  ${String(n).padStart(2)}  ${url}  ->  ${trackKey}${flag}`);
  }

  console.log("\nAI-SELECTABLE IMAGES -> TRACK");
  for (const url of VALID_BACKGROUND_IMAGES) {
    const { trackKey, dedicated, fileOk } = describe(url);
    const flag = !fileOk
      ? "  x MISSING TRACK FILE"
      : dedicated
        ? ""
        : "  x NO DEDICATED TRACK";
    if (!fileOk || !dedicated) problems++;
    console.log(`      ${url}  ->  ${trackKey}${flag}`);
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
