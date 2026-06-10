import { expect, test } from "@playwright/test";
import {
  SCENARIO_IMAGES_BY_AVATAR,
  getAvatarScenarioImages,
} from "../../lib/imageAssetCatalog.js";

const avatars = {
  scout: {
    id: "scout",
    name: "The Scout",
    trait: "Observant",
    description: "Sees danger before others do.",
    imageUrl: "/images/avatars/avatar-scout.png",
    futureImageUrl: "/images/futures/future-scout-balanced.png",
    futureImageByState: { balanced: "/images/futures/future-scout-balanced.png" },
    startingStats: { hope: 50, trust: 60, chaos: 30, humanity: 50 },
  },
  medic: {
    id: "medic",
    name: "The Medic",
    trait: "Compassionate",
    description: "Fights to keep people alive.",
    imageUrl: "/images/avatars/avatar-medic.png",
    futureImageUrl: "/images/futures/future-medic-balanced.png",
    futureImageByState: { balanced: "/images/futures/future-medic-balanced.png" },
    startingStats: { hope: 60, trust: 50, chaos: 20, humanity: 70 },
  },
  engineer: {
    id: "engineer",
    name: "The Engineer",
    trait: "Practical",
    description: "Rebuilds systems under pressure.",
    imageUrl: "/images/avatars/avatar-engineer.png",
    futureImageUrl: "/images/futures/future-engineer-balanced.png",
    futureImageByState: { balanced: "/images/futures/future-engineer-balanced.png" },
    startingStats: { hope: 60, trust: 50, chaos: 30, humanity: 40 },
  },
  guardian: {
    id: "guardian",
    name: "The Guardian",
    trait: "Protective",
    description: "Stands between danger and the vulnerable.",
    imageUrl: "/images/avatars/avatar-guardian.png",
    futureImageUrl: "/images/futures/future-guardian-balanced.png",
    futureImageByState: { balanced: "/images/futures/future-guardian-balanced.png" },
    startingStats: { hope: 40, trust: 60, chaos: 50, humanity: 40 },
  },
  diplomat: {
    id: "diplomat",
    name: "The Diplomat",
    trait: "Persuasive",
    description: "Builds alliances before battles.",
    imageUrl: "/images/avatars/avatar-diplomat.png",
    futureImageUrl: "/images/futures/future-diplomat-balanced.png",
    futureImageByState: { balanced: "/images/futures/future-diplomat-balanced.png" },
    startingStats: { hope: 70, trust: 50, chaos: 20, humanity: 60 },
  },
  scavenger: {
    id: "scavenger",
    name: "The Scavenger",
    trait: "Resourceful",
    description: "Finds value in the ruins.",
    imageUrl: "/images/avatars/avatar-scavenger.png",
    futureImageUrl: "/images/futures/future-scavenger-balanced.png",
    futureImageByState: { balanced: "/images/futures/future-scavenger-balanced.png" },
    startingStats: { hope: 30, trust: 60, chaos: 40, humanity: 40 },
  },
};

const choices = Array.from({ length: 6 }, (_, index) => ({
  id: `choice-${index + 1}`,
  text: `Test choice ${index + 1} for image rendering.`,
  outcome: "The test records the choice without changing the visual target.",
  hopeChange: index === 0 ? 1 : 0,
  trustChange: index === 1 ? 1 : 0,
  chaosChange: index === 2 ? 1 : 0,
  humanityChange: index === 3 ? 1 : 0,
}));

function scenarioFor(imageUrl) {
  const slug =
    imageUrl
      .split("/")
      .pop()
      ?.replace(".png", "")
      .replace(/^avatar-[a-z]+-/, "") ?? "scenario-image";

  return {
    id: `image-render-${slug}`,
    title: slug.replaceAll("-", " "),
    setting:
      "This mocked scenario renders a cataloged scenario image through the real game layout before database seeding.",
    futureMsg:
      "This future signal is intentionally long enough to keep the scenario screen honest while image sizing is validated.",
    imageUrl,
    choices,
  };
}

async function mockGameApis(page, avatarId, imageUrl) {
  await page.route("**/api/avatars**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([avatars[avatarId]]),
    });
  });

  await page.route("**/api/scenarios/generate**", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(scenarioFor(imageUrl)),
    });
  });

  await page.route("**/api/attempts**", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ id: "image-render-attempt", createdAt: new Date(0).toISOString() }),
    });
  });
}

async function openImageScenario(page, avatarId, imageUrl, viewport) {
  await page.setViewportSize(viewport);
  await mockGameApis(page, avatarId, imageUrl);
  await page.goto("/game");
  await page.locator("button").filter({ hasText: avatars[avatarId].name }).click({ force: true });
  const scenarioImage = page.getByAltText(scenarioFor(imageUrl).title);
  await expect(scenarioImage).toBeVisible();
  await expect
    .poll(async () => scenarioImage.evaluate((img) => img.complete && img.naturalWidth > 0))
    .toBe(true);
}

async function getRenderedImageMetrics(page, imageUrl) {
  return page.getByAltText(scenarioFor(imageUrl).title).evaluate((img) => {
    const imageBox = img.getBoundingClientRect();
    const frameBox = img.parentElement?.getBoundingClientRect();
    const style = window.getComputedStyle(img);

    return {
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      imageWidth: imageBox.width,
      imageHeight: imageBox.height,
      frameWidth: frameBox?.width ?? 0,
      frameHeight: frameBox?.height ?? 0,
      objectFit: style.objectFit,
      objectPosition: style.objectPosition,
    };
  });
}

test.describe("scenario image catalog", () => {
  for (const avatarId of Object.keys(SCENARIO_IMAGES_BY_AVATAR)) {
    test(`${avatarId} catalog has ten renderable scenario image files`, async ({ request }) => {
      const imageUrls = getAvatarScenarioImages(avatarId);
      expect(imageUrls).toHaveLength(10);

      for (const imageUrl of imageUrls) {
        const response = await request.get(imageUrl);
        expect(response.ok(), `${imageUrl} should exist`).toBe(true);
        expect(response.headers()["content-type"], `${imageUrl} should be a PNG`).toContain("image/png");
      }
    });
  }
});

test.describe("scenario image rendering", () => {
  const desktop = { width: 1366, height: 768 };
  const mobile = { width: 390, height: 844 };

  for (const avatarId of Object.keys(SCENARIO_IMAGES_BY_AVATAR)) {
    for (const imageUrl of getAvatarScenarioImages(avatarId)) {
      test(`${avatarId}: ${imageUrl.split("/").pop()} fills the scenario frame on desktop`, async ({ page }) => {
        await openImageScenario(page, avatarId, imageUrl, desktop);
        const metrics = await getRenderedImageMetrics(page, imageUrl);

        expect(metrics.naturalWidth, `${imageUrl} optimized width`).toBeGreaterThan(0);
        expect(metrics.naturalHeight, `${imageUrl} optimized height`).toBeGreaterThan(0);
        expect(metrics.objectFit).toBe("cover");
        expect(metrics.objectPosition).toMatch(/(?:center|50%)/);
        expect(metrics.imageWidth).toBeGreaterThanOrEqual(metrics.frameWidth - 1);
        expect(metrics.imageHeight).toBeGreaterThanOrEqual(metrics.frameHeight - 1);
      });
    }
  }

  for (const avatarId of Object.keys(SCENARIO_IMAGES_BY_AVATAR)) {
    const imageUrl = getAvatarScenarioImages(avatarId)[0];

    test(`${avatarId}: first scenario image remains usable on mobile`, async ({ page }) => {
      await openImageScenario(page, avatarId, imageUrl, mobile);
      const metrics = await getRenderedImageMetrics(page, imageUrl);

      expect(metrics.imageWidth).toBeGreaterThanOrEqual(metrics.frameWidth - 1);
      expect(metrics.imageHeight).toBeGreaterThanOrEqual(metrics.frameHeight - 1);
      await expect(page.getByText("Choose your action")).toBeVisible();
    });
  }
});
