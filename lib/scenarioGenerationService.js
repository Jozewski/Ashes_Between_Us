import { AVATARS } from "./mockData.js";
import { prisma } from "./prisma.js";
import {
  createGeneratedChoiceId,
  createGeneratedScenarioId,
  fallbackGeneratedScenario,
} from "./futureSelfService.js";
import { generateAIScenario } from "./aiScenarioService.js";
import { calculateImportance, normalizeStatsPayload } from "./outcomeEngine.js";

const memoryByAvatar = new Map();
const LIVE_AI_ENABLED = process.env.ENABLE_LIVE_AI_SCENARIOS === "true";

let avatarCache = null;

function mapAvatarRow(row) {
  return {
    id: row.id,
    name: row.name,
    trait: row.trait,
    description: row.description,
    backstory: row.backstory,
    imageUrl: row.imageUrl,
    futureImageUrl: row.futureImageUrl,
    futureImageByState: row.futureImageByState,
    startingStats: row.startingStats,
  };
}

async function loadAvatars() {
  if (avatarCache) return avatarCache;

  try {
    const rows = await prisma.avatar.findMany({
      orderBy: { sortOrder: "asc" },
    });

    if (rows.length > 0) {
      avatarCache = rows.map(mapAvatarRow);
      return avatarCache;
    }
  } catch (error) {
    console.error("Failed to load avatars from DB, using mock data:", error);
  }

  return AVATARS;
}

function getProgressionBand(attemptCount) {
  if (attemptCount <= 2) return "early";
  if (attemptCount <= 6) return "mid";
  return "late";
}

function extractSeedMeta(scenario) {
  const seedMeta =
    scenario?.consequences && typeof scenario.consequences === "object"
      ? scenario.consequences.seedMeta
      : null;

  return seedMeta && typeof seedMeta === "object" ? seedMeta : null;
}

function scenarioBandMatches(scenario, progressionBand) {
  const seedMeta = extractSeedMeta(scenario);
  if (!seedMeta) return false;
  if (seedMeta.progressionBand === "any") return true;
  return seedMeta.progressionBand === progressionBand;
}

function computeScenarioPickIndex({ attemptCount, currentStats, size }) {
  const stats = normalizeStatsPayload(currentStats);
  const signal =
    stats.hope * 3 + stats.trust * 5 + stats.chaos * 7 + stats.humanity * 11;
  return Math.abs(signal + attemptCount) % size;
}

function pickScenarioBySignal({ candidates, attemptCount, currentStats }) {
  if (!candidates.length) {
    return null;
  }

  const weighted = candidates.flatMap((scenario) => {
    const seedMeta = extractSeedMeta(scenario);
    const weight = Number(seedMeta?.weight ?? 1);
    const normalizedWeight = Number.isFinite(weight)
      ? Math.max(1, Math.min(10, Math.floor(weight)))
      : 1;
    return Array.from({ length: normalizedWeight }, () => scenario);
  });

  const index = computeScenarioPickIndex({
    attemptCount,
    currentStats,
    size: weighted.length,
  });

  return weighted[index];
}

async function getSeededScenarioForAvatar({ avatarId, currentStats, runId }) {
  const attemptWhere = runId ? { avatarId, runId } : { avatarId };

  const [attemptCount, scenarios, attempts] = await Promise.all([
    prisma.attempt.count({ where: attemptWhere }),
    prisma.scenario.findMany({
      where: {
        id: {
          startsWith: `seed-${avatarId}-`,
        },
      },
      include: { choices: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.attempt.findMany({
      where: attemptWhere,
      select: { scenarioId: true },
    }),
  ]);

  if (!scenarios.length) {
    return null;
  }

  const progressionBand = getProgressionBand(attemptCount);
  const usedScenarioIds = new Set(attempts.map((attempt) => attempt.scenarioId));

  const preferredBand = scenarios.filter((scenario) =>
    scenarioBandMatches(scenario, progressionBand),
  );

  const preferredUnseen = preferredBand.filter(
    (scenario) => !usedScenarioIds.has(scenario.id),
  );
  const anyUnseen = scenarios.filter((scenario) => !usedScenarioIds.has(scenario.id));

  const candidatePool =
    preferredUnseen.length > 0
      ? preferredUnseen
      : anyUnseen.length > 0
        ? anyUnseen
        : preferredBand.length > 0
          ? preferredBand
          : scenarios;

  const picked = pickScenarioBySignal({
    candidates: candidatePool,
    attemptCount,
    currentStats,
  });

  return picked ? normalizeScenarioChoices(picked) : null;
}

function normalizeScenarioChoices(scenario) {
  if (!scenario || !Array.isArray(scenario.choices)) {
    return scenario;
  }

  return {
    ...scenario,
    choices: scenario.choices.slice(0, 6),
  };
}

async function getAvatarById(avatarId) {
  const avatars = await loadAvatars();
  return avatars.find((avatar) => avatar.id === avatarId) ?? avatars[0];
}

async function getLatestGeneratedScenario() {
  return prisma.scenario.findFirst({
    where: {
      id: {
        startsWith: "generated-",
      },
    },
    include: { choices: true },
    orderBy: { createdAt: "desc" },
  });
}

function assignGeneratedIds(scenario) {
  const baseId = scenario.id?.startsWith("generated-")
    ? scenario.id
    : createGeneratedScenarioId();

  return {
    ...scenario,
    id: baseId,
    choices: scenario.choices.map((choice, index) => ({
      ...choice,
      id: choice.id?.startsWith("generated-choice-")
        ? choice.id
        : createGeneratedChoiceId(index, baseId),
    })),
  };
}

function buildInternalMemory(avatarId, payload) {
  const statsAfter = normalizeStatsPayload(payload);
  return {
    avatarId,
    scenarioTitle:
      payload.scenarioTitle ??
      payload.scenario_id ??
      payload.scenarioId ??
      null,
    choiceText: payload.choiceText ?? payload.text ?? null,
    outcome: payload.outcome ?? null,
    statsAfter,
    importance: calculateImportance(statsAfter),
  };
}

async function normalizeAttemptPayload(payload) {
  const scenario = payload?.scenarioId
    ? await findScenarioById(payload.scenarioId)
    : null;
  const matchedChoice =
    scenario?.choices?.find((choice) => choice.id === payload?.choiceId) ?? null;
  const avatar = payload?.avatarId ? await getAvatarById(payload.avatarId) : null;

  const username =
    typeof payload?.username === "string" ? payload.username.trim() : "";

  return {
    ...payload,
    runId: typeof payload?.runId === "string" ? payload.runId : null,
    username: username || null,
    avatarName: payload?.avatarName ?? avatar?.name ?? null,
    scenarioTitle: payload?.scenarioTitle ?? scenario?.title ?? null,
    choiceText: payload?.choiceText ?? matchedChoice?.text ?? null,
    outcome: payload?.outcome ?? matchedChoice?.outcome ?? null,
  };
}

export async function getAvatars() {
  return loadAvatars();
}

export async function getAllScenarios() {
  const scenarios = await prisma.scenario.findMany({
    include: { choices: true },
    orderBy: { createdAt: "asc" },
  });

  return scenarios.map(normalizeScenarioChoices);
}

export async function findScenarioById(id) {
  return prisma.scenario.findUnique({
    where: { id },
    include: { choices: true },
  });
}

export async function getRecentMemoriesForAvatar(avatarId) {
  const fromDatabase = await prisma.attempt.findMany({
    where: { avatarId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (fromDatabase.length > 0) {
    return fromDatabase.map((item) => buildInternalMemory(avatarId, item));
  }

  return memoryByAvatar.get(avatarId) ?? [];
}

export async function getAttemptHistory(runId) {
  return prisma.attempt.findMany({
    where: runId ? { runId } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export function saveMemory(payload) {
  if (!payload?.avatarId) {
    return null;
  }

  const memory = buildInternalMemory(payload.avatarId, payload);
  if (!memory.scenarioTitle || !memory.choiceText || !memory.outcome) {
    return memory;
  }

  const list = memoryByAvatar.get(memory.avatarId) ?? [];
  const next = [memory, ...list].slice(0, 5);
  memoryByAvatar.set(memory.avatarId, next);
  return memory;
}

export async function saveAttempt(payload) {
  const createdAt = new Date().toISOString();
  const normalizedPayload = await normalizeAttemptPayload(payload);
  const statsAfter = normalizeStatsPayload(normalizedPayload);
  const attempt = {
    id: `attempt-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`,
    createdAt,
    ...normalizedPayload,
    hope: statsAfter.hope,
    trust: statsAfter.trust,
    chaos: statsAfter.chaos,
    humanity: statsAfter.humanity,
    statsAfter,
  };

  saveMemory(attempt);
  return prisma.attempt.create({ data: attempt });
}

export async function saveGeneratedScenario(scenario) {
  const generated = normalizeScenarioChoices(assignGeneratedIds(scenario));

  const scenarioData = {
    title: generated.title,
    setting: generated.setting,
    message: generated.message ?? generated.setting,
    futureMsg: generated.futureMsg,
    futureSelfMessage: generated.futureSelfMessage ?? generated.futureMsg,
    imageUrl: generated.imageUrl,
    consequences: generated.consequences ?? null,
  };

  const existing = await prisma.scenario.findUnique({
    where: { id: generated.id },
    select: { id: true },
  });

  if (existing) {
    await prisma.scenario.update({
      where: { id: generated.id },
      data: scenarioData,
    });
  } else {
    await prisma.scenario.create({
      data: {
        id: generated.id,
        ...scenarioData,
      },
    });
  }

  await prisma.choice.deleteMany({
    where: { scenarioId: generated.id },
  });

  const choicesData = generated.choices.map((choice) => ({
    id: choice.id,
    scenarioId: generated.id,
    text: choice.text,
    outcome: choice.outcome,
    hopeChange: Number(choice.hopeChange ?? 0),
    trustChange: Number(choice.trustChange ?? 0),
    chaosChange: Number(choice.chaosChange ?? 0),
    humanityChange: Number(choice.humanityChange ?? 0),
    requiredRole: choice.requiredRole ?? null,
    roleBonus: choice.roleBonus ?? null,
  }));

  if (choicesData.length > 0) {
    await prisma.choice.createMany({ data: choicesData });
  }

  return generated;
}

export async function generateScenario({
  avatarId,
  currentStats,
  recentChoices,
  runId,
}) {
  const seededScenario = await getSeededScenarioForAvatar({
    avatarId,
    currentStats,
    runId,
  });

  if (seededScenario) {
    return seededScenario;
  }

  if (!LIVE_AI_ENABLED) {
    const latestGenerated = await getLatestGeneratedScenario();
    if (latestGenerated) {
      return normalizeScenarioChoices(latestGenerated);
    }

    const anyScenario = await prisma.scenario.findFirst({
      include: { choices: true },
      orderBy: { createdAt: "asc" },
    });
    if (anyScenario) {
      return normalizeScenarioChoices(anyScenario);
    }

    throw new Error(
      "No seeded scenarios found. Run npm run db:seed or add data/seed-packs JSON files.",
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const avatar = await getAvatarById(avatarId);
  const internalMemories = await getRecentMemoriesForAvatar(avatarId);
  const combinedRecentChoices = [
    ...internalMemories,
    ...(Array.isArray(recentChoices) ? recentChoices : []),
  ].slice(-5);

  let generated;
  let generationError = null;

  try {
    generated = await generateAIScenario({
      avatar,
      currentStats,
      recentChoices: combinedRecentChoices,
    });
  } catch (firstError) {
    generationError = firstError;
    try {
      generated = await generateAIScenario({
        avatar,
        currentStats,
        recentChoices: [],
      });
    } catch (secondError) {
      generationError = secondError;
    }
  }

  if (!generated) {
    const latestGenerated = await getLatestGeneratedScenario();
    if (latestGenerated) {
      return normalizeScenarioChoices(latestGenerated);
    }

    const anyScenario = await prisma.scenario.findFirst({
      include: { choices: true },
      orderBy: { createdAt: "asc" },
    });
    if (anyScenario) {
      return normalizeScenarioChoices(anyScenario);
    }

    if (generationError) {
      throw generationError;
    }

    throw new Error("Failed to generate scenario.");
  }

  return saveGeneratedScenario(generated);
}

export async function generateFallbackScenario() {
  return saveGeneratedScenario(fallbackGeneratedScenario());
}
