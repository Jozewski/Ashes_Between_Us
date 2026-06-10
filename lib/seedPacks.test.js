import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { getImageMatchAliases, getImageSlug } from "./imageAssetCatalog.js";
import { pickBestImageFromPrompt } from "./futureSelfService.js";

const SEED_PACK_DIR = path.join(process.cwd(), "data", "seed-packs");

function loadSeedPacks() {
  return fs
    .readdirSync(SEED_PACK_DIR)
    .filter((fileName) => fileName.endsWith(".seed.json"))
    .map((fileName) => {
      const filePath = path.join(SEED_PACK_DIR, fileName);
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    });
}

function publicImageExists(imageUrl) {
  return fs.existsSync(path.join(process.cwd(), "public", imageUrl.replace(/^\//, "")));
}

describe("seed packs", () => {
  test("provide 20 polished scenarios per avatar with 6 choices each", () => {
    for (const pack of loadSeedPacks()) {
      for (const avatar of pack.avatars) {
        expect(avatar.scenarios, avatar.avatarId).toHaveLength(20);

        for (const scenario of avatar.scenarios) {
          expect(scenario.title.trim(), scenario.id).not.toBe("");
          expect(scenario.setting.trim().split(/\s+/).length, scenario.id).toBeGreaterThan(20);
          expect(scenario.futureMsg.trim().split(/\s+/).length, scenario.id).toBeGreaterThan(8);
          expect(scenario.imageUrl.startsWith("/images/"), scenario.id).toBe(true);
          expect(scenario.imageKeywords, scenario.id).toEqual(
            expect.arrayContaining([getImageSlug(scenario.imageUrl).replaceAll("-", " ")]),
          );
          expect(scenario.choices, scenario.id).toHaveLength(6);
        }
      }
    }
  });

  test("each avatar has 20 unique explicit scenario images", () => {
    for (const pack of loadSeedPacks()) {
      for (const avatar of pack.avatars) {
        const imageUrls = avatar.scenarios.map((scenario) => scenario.imageUrl);

        expect(new Set(imageUrls).size, avatar.avatarId).toBe(20);
        for (const imageUrl of imageUrls) {
          expect(publicImageExists(imageUrl), `${avatar.avatarId}: ${imageUrl}`).toBe(true);
        }
      }
    }
  });

  test("scenario image keywords point back to the assigned image catalog entry", () => {
    for (const pack of loadSeedPacks()) {
      for (const avatar of pack.avatars) {
        for (const scenario of avatar.scenarios) {
          const expectedTerms = [
            getImageSlug(scenario.imageUrl).replaceAll("-", " "),
            ...getImageMatchAliases(scenario.imageUrl),
          ];
          const keywordText = scenario.imageKeywords.join(" ").toLowerCase();

          expect(
            expectedTerms.some((term) => keywordText.includes(term.toLowerCase())),
            `${scenario.id}: ${scenario.imageUrl}`,
          ).toBe(true);
          expect(pickBestImageFromPrompt(scenario, [], avatar.avatarId), scenario.id).toBe(
            scenario.imageUrl,
          );
        }
      }
    }
  });
});
