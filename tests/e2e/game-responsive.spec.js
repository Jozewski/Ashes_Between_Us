import { expect, test } from "@playwright/test";

const avatar = {
  id: "engineer",
  name: "The Engineer",
  trait: "Practical",
  description: "Rebuilds systems under pressure.",
  imageUrl: "/images/avatars/avatar-engineer.png",
  futureImageUrl: "/images/futures/future-engineer-balanced.png",
  futureImageByState: {
    balanced: "/images/futures/future-engineer-balanced.png",
    broken: "/images/futures/future-engineer-broken.png",
    chaotic: "/images/futures/future-engineer-chaotic.png",
    rebuilding: "/images/futures/future-engineer-rebuilding.png",
  },
  startingStats: {
    hope: 60,
    trust: 50,
    chaos: 30,
    humanity: 40,
  },
};

const scenario = {
  id: "responsive-scenario",
  title: "Bridge Restoration Project",
  setting:
    "A damaged bridge is the last direct route between the clinic district and the water pumps. Crews can repair it, but the convoy behind you is already running out of daylight.",
  futureMsg:
    "Future-you remembers this repair because it decided who could still reach help before winter. Keep the bridge useful, but do not let urgency turn every worker into a sacrifice. The people waiting past the river will remember whether your crew built a crossing or a monument to panic.",
  imageUrl: "/images/scenarios/engineer/avatar-engineer-bridge-restoration-project.png",
  choices: [
    {
      id: "choice-a",
      text: "Stabilize the central span before sending anyone across.",
      outcome: "The delay frustrates the convoy, but the bridge holds through the night.",
      hopeChange: 4,
      trustChange: 8,
      chaosChange: -6,
      humanityChange: 3,
    },
    {
      id: "choice-b",
      text: "Send a light team across now while the supports are still shifting.",
      outcome: "The team gets through, but the structure loses another support beam.",
      hopeChange: 8,
      trustChange: -4,
      chaosChange: 10,
      humanityChange: -2,
    },
    {
      id: "choice-c",
      text: "Close the bridge and reroute everyone through the flood plain.",
      outcome: "No one falls, but the long route strands several vehicles after sunset.",
      hopeChange: -3,
      trustChange: 2,
      chaosChange: 4,
      humanityChange: 1,
    },
    {
      id: "choice-d",
      text: "Split the repair crew between the bridge deck, pump relay, and convoy escort.",
      outcome: "The work moves quickly, but every team is stretched thin.",
      hopeChange: 3,
      trustChange: -2,
      chaosChange: 5,
      humanityChange: 0,
    },
    {
      id: "choice-e",
      text: "Ask the convoy to unload supplies and help reinforce the failing lower truss.",
      outcome: "The shared labor slows the convoy but gives the bridge a real chance.",
      hopeChange: 2,
      trustChange: 7,
      chaosChange: -3,
      humanityChange: 4,
    },
    {
      id: "choice-f",
      text: "Use the last fuel reserve to run floodlights and keep the repair going after dark.",
      outcome: "The bridge crew works safely through the night, but the convoy loses range.",
      hopeChange: 5,
      trustChange: -1,
      chaosChange: 2,
      humanityChange: -3,
    },
  ],
};

async function mockGameApis(page) {
  await page.route("**/api/avatars**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([avatar]),
    });
  });

  await page.route("**/api/scenarios/generate**", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(scenario),
    });
  });

  await page.route("**/api/attempts**", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        id: "attempt-responsive",
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        choiceId: "choice-a",
        choiceText: scenario.choices[0].text,
        outcome: scenario.choices[0].outcome,
        avatarId: avatar.id,
        avatarName: avatar.name,
        hope: 64,
        trust: 58,
        chaos: 24,
        humanity: 43,
        createdAt: new Date("2026-06-09T12:00:00.000Z").toISOString(),
      }),
    });
  });
}

async function openScenario(page, viewport) {
  await page.setViewportSize(viewport);
  await mockGameApis(page);

  await page.goto("/game");
  await page.locator("button").filter({ hasText: "The Engineer" }).click({ force: true });
  await expect(page.getByText("Bridge Restoration Project", { exact: false })).toBeVisible();
  await expect(page.getByText("Future signal")).toBeVisible();
}

test.describe("game scenario responsive layout", () => {
  const desktopViewports = [
    { width: 2560, height: 1440 },
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
    { width: 1366, height: 768 },
  ];

  for (const viewport of desktopViewports) {
    test(`keeps the future signal visible on desktop ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await openScenario(page, viewport);

      const futureSignalEnd = page.getByText("The Engineer - Future Self", { exact: false });
      const box = await futureSignalEnd.boundingBox();

      expect(box).not.toBeNull();
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    });
  }

  test("crops scenario contact-sheet borders out of the visible image frame", async ({ page }) => {
    await openScenario(page, { width: 1920, height: 1080 });

    const image = page.getByAltText(scenario.title);
    await expect(image).toBeVisible();

    const className = await image.getAttribute("class");
    await expect(image).toHaveCSS("object-fit", "cover");
    expect(className).toContain("scale-[1.035]");
  });

  test("balances scenario panel height with the choice stack on desktop", async ({ page }) => {
    await openScenario(page, { width: 1920, height: 1080 });

    const scenarioPanel = page.getByTestId("scenario-media-copy");
    const firstChoice = page.getByRole("button", { name: /A Stabilize/ });
    const lastChoice = page.getByRole("button", { name: /F Use the last fuel reserve/ });

    const scenarioBox = await scenarioPanel.boundingBox();
    const firstChoiceBox = await firstChoice.boundingBox();
    const lastChoiceBox = await lastChoice.boundingBox();

    expect(scenarioBox).not.toBeNull();
    expect(firstChoiceBox).not.toBeNull();
    expect(lastChoiceBox).not.toBeNull();

    const choiceStackTop = firstChoiceBox.y;
    const choiceStackBottom = lastChoiceBox.y + lastChoiceBox.height;
    const choiceStackHeight = choiceStackBottom - choiceStackTop;

    expect(Math.abs(scenarioBox.height - choiceStackHeight)).toBeLessThanOrEqual(56);
  });

  test("keeps the scenario flow usable on mobile", async ({ page }) => {
    await openScenario(page, { width: 390, height: 844 });

    await expect(page.getByText("Choose your action")).toBeVisible();
    await expect(page.getByText("Future signal")).toBeVisible();
    await expect(page.getByAltText(scenario.title)).toBeVisible();
  });
});
