// scripts/reassignScenarioImages.js
//
// One-time utility: gives every avatar's 10 scenarios a DISTINCT background
// image, drawn from the full library of scene art (backgrounds + skyscapes +
// outcome "future" images). Images are partitioned into mutually-exclusive,
// mood-aligned pools keyed by progression band, so:
//   - distinctness within an avatar is guaranteed (pools are disjoint and each
//     band assigns by a rotating index), and
//   - different avatars get different selections (per-avatar rotation offset).
//
// Run with:  node scripts/reassignScenarioImages.js
// Then reseed the DB:  npm run db:seed

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SEED_PACK_DIR = path.join(process.cwd(), "data", "seed-packs");

// Mutually-exclusive image pools (13 images total). Pool sizes are chosen to
// cover the maximum number of scenarios any avatar has in each band.
const IMAGE_POOLS = {
  early: [
    "/images/backgrounds/ruined-city.png",
    "/images/backgrounds/desert-highway.png",
    "/images/backgrounds/bunker.png",
  ],
  mid: [
    "/images/backgrounds/radio-tower.png",
    "/images/backgrounds/forest-safe-zone.png",
    "/images/skyscapes/aurora-mountain-storm.png",
    "/images/skyscapes/aurora-winter-forest.png",
  ],
  any: [
    "/images/skyscapes/aurora-lake-sunset.png",
    "/images/skyscapes/aurora-coastal-beacon.png",
  ],
  late: [
    "/images/outcomes/ending-rebuilding-future.png",
    "/images/outcomes/ending-balanced-future.png",
    "/images/outcomes/ending-chaotic-future.png",
    "/images/outcomes/ending-broken-future.png",
  ],
};

// Stable per-avatar rotation offset so avatars don't all pick the same images.
const AVATAR_ORDER = [
  "diplomat",
  "engineer",
  "guardian",
  "medic",
  "scavenger",
  "scout",
];

function offsetForAvatar(avatarId) {
  const idx = AVATAR_ORDER.indexOf(avatarId);
  return idx >= 0 ? idx : 0;
}

function bandOf(scenario) {
  const band = scenario?.progressionBand;
  return ["early", "mid", "late", "any"].includes(band) ? band : "any";
}

async function run() {
  const files = (await readdir(SEED_PACK_DIR)).filter((f) =>
    f.endsWith(".seed.json"),
  );

  let totalScenarios = 0;
  const report = [];

  for (const file of files) {
    const full = path.join(SEED_PACK_DIR, file);
    const pack = JSON.parse(await readFile(full, "utf8"));
    const avatars = Array.isArray(pack.avatars) ? pack.avatars : [];

    for (const avatar of avatars) {
      const avatarId = avatar.avatarId;
      const offset = offsetForAvatar(avatarId);
      const scenarios = Array.isArray(avatar.scenarios) ? avatar.scenarios : [];
      const counters = { early: 0, mid: 0, any: 0, late: 0 };
      const assigned = [];

      for (const scenario of scenarios) {
        const band = bandOf(scenario);
        const pool = IMAGE_POOLS[band];
        const i = counters[band]++;
        if (i >= pool.length) {
          throw new Error(
            `Avatar "${avatarId}" has more "${band}" scenarios (${i + 1}) ` +
              `than images in that pool (${pool.length}). Rebalance pools.`,
          );
        }
        const img = pool[(i + offset) % pool.length];
        scenario.imageUrl = img;
        assigned.push(img);
        totalScenarios++;
      }

      const unique = new Set(assigned).size;
      report.push(
        `  ${avatarId.padEnd(10)} ${assigned.length} scenarios, ${unique} unique images` +
          (unique === assigned.length ? "" : "  <-- NOT ALL UNIQUE!"),
      );
    }

    await writeFile(full, JSON.stringify(pack, null, 2) + "\n", "utf8");
    report.push(`Updated ${file}`);
  }

  console.log(report.join("\n"));
  console.log(`\nDone. Reassigned images for ${totalScenarios} scenarios.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
