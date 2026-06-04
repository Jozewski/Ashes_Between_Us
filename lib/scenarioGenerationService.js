import { AVATARS, MOCK_SCENARIOS } from "./mockData.js";
import { prisma } from "./prisma.js";
import {
  createGeneratedChoiceId,
  createGeneratedScenarioId,
  fallbackGeneratedScenario,
} from "./futureSelfService.js";
import { generateAIScenario } from "./aiScenarioService.js";
import { calculateImportance, normalizeStatsPayload } from "./outcomeEngine.js";

const generatedScenarios = [];
const memoryByAvatar = new Map();
const attempts = [];

function getAvatarById(avatarId) {
  return AVATARS.find((avatar) => avatar.id === avatarId) ?? AVATARS[0];
}

function isPrismaModelAvailable(modelName) {
  return prisma && typeof prisma[modelName]?.create === "function";
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

export function getAvatars() {
  return AVATARS;
}

export function getAllScenarios() {
  return [...MOCK_SCENARIOS, ...generatedScenarios];
}

export function findScenarioById(id) {
  return getAllScenarios().find((scenario) => scenario.id === id) ?? null;
}

export function getRecentMemoriesForAvatar(avatarId) {
  return memoryByAvatar.get(avatarId) ?? [];
}

export function getAttemptHistory() {
  return [...attempts];
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
  const attempt = {
    id: `attempt-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`,
    createdAt,
    ...payload,
    statsAfter: normalizeStatsPayload(payload),
  };

  attempts.unshift(attempt);
  if (attempts.length > 200) {
    attempts.length = 200;
  }

  saveMemory(attempt);

  if (isPrismaModelAvailable("attempt")) {
    try {
      const dbAttempt = await prisma.attempt.create({ data: attempt });
      return dbAttempt;
    } catch {
      // ignore schema or database issues in this branch
    }
  }

  return attempt;
}

export async function saveGeneratedScenario(scenario) {
  const generated = assignGeneratedIds(scenario);
  generatedScenarios.unshift(generated);
  if (generatedScenarios.length > 50) {
    generatedScenarios.length = 50;
  }

  if (isPrismaModelAvailable("scenario")) {
    try {
      await prisma.scenario.create({ data: generated });
    } catch {
      // ignore database issues in this branch
    }
  }

  return generated;
}

export async function generateScenario({
  avatarId,
  currentStats,
  recentChoices,
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const avatar = getAvatarById(avatarId);
  const internalMemories = getRecentMemoriesForAvatar(avatarId);
  const combinedRecentChoices = [
    ...internalMemories,
    ...(Array.isArray(recentChoices) ? recentChoices : []),
  ].slice(-5);

  const generated = await generateAIScenario({
    avatar,
    currentStats,
    recentChoices: combinedRecentChoices,
  });

  return saveGeneratedScenario(generated);
}

export async function generateFallbackScenario() {
  return saveGeneratedScenario(fallbackGeneratedScenario());
}
