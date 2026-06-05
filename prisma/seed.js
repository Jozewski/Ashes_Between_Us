import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { MOCK_SCENARIOS } from "../lib/mockData.js";
import { prisma } from "../lib/prisma.js";

const SEED_PACK_DIR = path.join(process.cwd(), "data", "seed-packs");

function sanitizeId(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function ensureString(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid ${label}: expected a non-empty string.`);
  }

  return value.trim();
}

function normalizeSeedChoice(choice, index, scenarioId) {
  const choiceIdCore = sanitizeId(choice?.id || `choice-${index + 1}`);
  if (!choiceIdCore) {
    throw new Error(`Invalid choices[${index}].id for scenario ${scenarioId}.`);
  }

  return {
    id: `seed-choice-${scenarioId}-${choiceIdCore}`,
    text: ensureString(choice?.text, `choices[${index}].text for ${scenarioId}`),
    outcome: ensureString(
      choice?.outcome,
      `choices[${index}].outcome for ${scenarioId}`,
    ),
    hopeChange: Number(choice?.hopeChange ?? 0),
    trustChange: Number(choice?.trustChange ?? 0),
    chaosChange: Number(choice?.chaosChange ?? 0),
    humanityChange: Number(choice?.humanityChange ?? 0),
    requiredRole: choice?.requiredRole ?? null,
    roleBonus: choice?.roleBonus ?? null,
  };
}

function normalizeSeedScenario({ scenario, avatarId, packId }) {
  const scenarioIdCore = sanitizeId(scenario?.id || scenario?.title);
  if (!scenarioIdCore) {
    throw new Error(`Scenario id/title missing in pack ${packId} for avatar ${avatarId}.`);
  }

  const scenarioId = `seed-${avatarId}-${scenarioIdCore}`;
  const choices = Array.isArray(scenario?.choices) ? scenario.choices : [];
  if (choices.length < 6) {
    throw new Error(`${scenarioId} requires exactly 6 choices (A-F).`);
  }

  const progressionBand = ["early", "mid", "late", "any"].includes(
    scenario?.progressionBand,
  )
    ? scenario.progressionBand
    : "any";

  return {
    id: scenarioId,
    title: ensureString(scenario?.title, `title for ${scenarioId}`),
    setting: ensureString(scenario?.setting, `setting for ${scenarioId}`),
    message:
      typeof scenario?.message === "string" && scenario.message.trim()
        ? scenario.message.trim()
        : ensureString(scenario?.setting, `setting for ${scenarioId}`),
    futureMsg: ensureString(scenario?.futureMsg, `futureMsg for ${scenarioId}`),
    futureSelfMessage:
      typeof scenario?.futureSelfMessage === "string" &&
      scenario.futureSelfMessage.trim()
        ? scenario.futureSelfMessage.trim()
        : ensureString(scenario?.futureMsg, `futureMsg for ${scenarioId}`),
    imageUrl: ensureString(scenario?.imageUrl, `imageUrl for ${scenarioId}`),
    consequences: {
      ...(scenario?.consequences && typeof scenario.consequences === "object"
        ? scenario.consequences
        : {}),
      seedMeta: {
        type: "seed-pack",
        packId,
        avatarId,
        progressionBand,
        weight: Number(scenario?.weight ?? 1),
      },
    },
    choices: choices.slice(0, 6).map((choice, index) =>
      normalizeSeedChoice(choice, index, scenarioId),
    ),
  };
}

async function upsertScenarioWithChoices(scenario) {
  const scenarioData = {
    title: scenario.title,
    setting: scenario.setting,
    message: scenario.message,
    futureMsg: scenario.futureMsg,
    futureSelfMessage: scenario.futureSelfMessage,
    imageUrl: scenario.imageUrl,
    consequences: scenario.consequences ?? null,
  };

  const existing = await prisma.scenario.findUnique({
    where: { id: scenario.id },
    select: { id: true },
  });

  if (existing) {
    await prisma.scenario.update({
      where: { id: scenario.id },
      data: scenarioData,
    });
  } else {
    await prisma.scenario.create({
      data: {
        id: scenario.id,
        ...scenarioData,
      },
    });
  }

  await prisma.choice.deleteMany({
    where: { scenarioId: scenario.id },
  });

  if (scenario.choices.length > 0) {
    await prisma.choice.createMany({
      data: scenario.choices.map((choice) => ({
        ...choice,
        scenarioId: scenario.id,
      })),
    });
  }
}

async function readSeedPackFiles() {
  let entries = [];
  try {
    entries = await readdir(SEED_PACK_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  const jsonFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .filter((name) => !name.endsWith(".schema.json"));

  const packs = [];
  for (const fileName of jsonFiles) {
    const fullPath = path.join(SEED_PACK_DIR, fileName);
    const raw = await readFile(fullPath, "utf8");
    const parsed = JSON.parse(raw);
    packs.push({
      fileName,
      pack: parsed,
    });
  }

  return packs;
}

async function seedScenariosFromSeedPacks() {
  const packs = await readSeedPackFiles();
  if (packs.length === 0) {
    return { imported: 0, usedSeedPack: false };
  }

  let imported = 0;
  for (const entry of packs) {
    const packId = ensureString(entry.pack?.packId, `${entry.fileName} packId`);
    const avatars = Array.isArray(entry.pack?.avatars) ? entry.pack.avatars : [];

    for (const avatarEntry of avatars) {
      const avatarId = ensureString(
        avatarEntry?.avatarId,
        `${entry.fileName} avatarId`,
      ).toLowerCase();
      const scenarios = Array.isArray(avatarEntry?.scenarios)
        ? avatarEntry.scenarios
        : [];

      for (const scenario of scenarios) {
        const normalized = normalizeSeedScenario({
          scenario,
          avatarId,
          packId,
        });
        await upsertScenarioWithChoices(normalized);
        imported += 1;
      }
    }
  }

  return { imported, usedSeedPack: true };
}

async function seedScenariosFromLegacyMockData() {
  let imported = 0;

  for (const scenario of MOCK_SCENARIOS) {
    const normalizedChoices = (scenario.choices ?? []).slice(0, 6).map((choice) => ({
      id: choice.id,
      text: choice.text,
      outcome: choice.outcome,
      hopeChange: Number(choice.hopeChange ?? 0),
      trustChange: Number(choice.trustChange ?? 0),
      chaosChange: Number(choice.chaosChange ?? 0),
      humanityChange: Number(choice.humanityChange ?? 0),
      requiredRole: choice.requiredRole ?? null,
      roleBonus: choice.roleBonus ?? null,
    }));

    await upsertScenarioWithChoices({
      id: scenario.id,
      title: scenario.title,
      setting: scenario.setting ?? scenario.message ?? "",
      message: scenario.message ?? scenario.setting ?? null,
      futureMsg: scenario.futureMsg ?? scenario.futureSelfMessage ?? "",
      futureSelfMessage: scenario.futureSelfMessage ?? scenario.futureMsg ?? null,
      imageUrl: scenario.imageUrl,
      consequences: scenario.consequences ?? null,
      choices: normalizedChoices,
    });

    imported += 1;
  }

  return { imported, usedSeedPack: false };
}

async function purgeScenariosAndChoices() {
  const deletedChoices = await prisma.choice.deleteMany({});
  const deletedScenarios = await prisma.scenario.deleteMany({});
  console.log(
    `Purged ${deletedScenarios.count} scenarios and ${deletedChoices.count} choices.`,
  );
}

async function main() {
  await purgeScenariosAndChoices();

  const result = await seedScenariosFromSeedPacks();
  if (!result.usedSeedPack) {
    const fallbackResult = await seedScenariosFromLegacyMockData();
    console.log(`Seeded ${fallbackResult.imported} scenarios from legacy mock data.`);
    return;
  }

  console.log(`Seeded ${result.imported} scenarios from seed packs.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
