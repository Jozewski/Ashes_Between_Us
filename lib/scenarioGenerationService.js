import { AVATARS } from "./mockData.js";
import { prisma } from "./prisma.js";
import {
  createGeneratedChoiceId,
  createGeneratedScenarioId,
  fallbackGeneratedScenario,
  VALID_BACKGROUND_IMAGES,
} from "./futureSelfService.js";
import { generateAIScenario } from "./aiScenarioService.js";
import { calculateImportance, normalizeStatsPayload } from "./outcomeEngine.js";

const memoryByAvatar = new Map();

let avatarCache = null;
let liveAISuspendedUntil = 0;

function logInfo(message, details = {}) {
  console.log(`[scenarioGeneration] ${message}`, details);
}

function logError(message, error, details = {}) {
  console.error(`[scenarioGeneration] ${message}`, {
    ...details,
    error: error?.message ?? error,
  });
}

function isLiveAIDisabled() {
  return process.env.ENABLE_LIVE_AI_SCENARIOS === "false";
}

function canUseLiveAI() {
  return (
    Boolean(process.env.OPENAI_API_KEY) &&
    !isLiveAIDisabled() &&
    Date.now() >= liveAISuspendedUntil
  );
}

function allowSeededScenarioFallback() {
  return (
    !process.env.OPENAI_API_KEY ||
    isLiveAIDisabled() ||
    process.env.ALLOW_SEEDED_SCENARIO_FALLBACK === "true"
  );
}

function suspendLiveAI(reason, durationMs = 60000) {
  liveAISuspendedUntil = Date.now() + durationMs;
  logInfo("Temporarily suspending live AI", {
    reason,
    durationMs,
    resumeAt: new Date(liveAISuspendedUntil).toISOString(),
  });
}

function getOpenAIScenarioTimeoutMs() {
  const value = Number(process.env.OPENAI_SCENARIO_TIMEOUT_MS);
  if (!Number.isFinite(value) || value <= 0) {
    return 20000;
  }

  return Math.max(1000, Math.min(60000, Math.floor(value)));
}

function isTimeoutError(error) {
  return (
    error?.name === "AbortError" ||
    error?.code === "ETIMEDOUT" ||
    String(error?.message ?? "").toLowerCase().includes("timed out") ||
    String(error?.message ?? "").toLowerCase().includes("timeout")
  );
}

async function withTimeout(promise, timeoutMs, message) {
  let timeoutId;
  let finished = false;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
  });
  const guardedPromise = promise.catch((error) => {
    if (finished) {
      logError("Late async failure after timeout", error);
      return undefined;
    }

    throw error;
  });

  try {
    return await Promise.race([guardedPromise, timeout]);
  } finally {
    finished = true;
    clearTimeout(timeoutId);
  }
}

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

function getDominantPressure(stats) {
  const normalized = normalizeStatsPayload(stats);
  const entries = Object.entries(normalized).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? "hope";
}

function pickBackgroundForStats(stats) {
  const pressure = getDominantPressure(stats);
  const preferred = {
    hope: "forest-safe-zone",
    trust: "radio-tower",
    chaos: "ruined-city",
    humanity: "bunker",
  };
  const match = VALID_BACKGROUND_IMAGES.find((imageUrl) =>
    imageUrl.includes(preferred[pressure] ?? "ruined-city"),
  );

  return match ?? VALID_BACKGROUND_IMAGES[0] ?? "/images/backgrounds/ruined-city.png";
}

function getLocalFallbackChoices({ pressure, attemptCount, stats }) {
  const pressureChoice = {
    hope: {
      text: "Light a visible signal even though it may draw strangers.",
      outcome:
        "The signal brings two exhausted families out of hiding. It may also have told less gentle people where warmth still exists.",
      hopeChange: 7,
      trustChange: 2,
      chaosChange: 5,
      humanityChange: 4,
    },
    trust: {
      text: "Hand the route map to someone outside your inner circle.",
      outcome:
        "The gesture changes the room. A few people relax, and one quiet skeptic begins watching your back instead of your pockets.",
      hopeChange: 2,
      trustChange: 7,
      chaosChange: -2,
      humanityChange: 3,
    },
    chaos: {
      text: "Break formation and move before the argument becomes a riot.",
      outcome:
        "Your sudden command prevents bloodshed, but the group feels the snap of your authority and remembers it.",
      hopeChange: -1,
      trustChange: -4,
      chaosChange: -7,
      humanityChange: -1,
    },
    humanity: {
      text: "Protect the person whose mistake created the danger.",
      outcome:
        "Mercy costs time you do not have. Still, the group sees that survival under you does not require becoming disposable.",
      hopeChange: 3,
      trustChange: 3,
      chaosChange: 3,
      humanityChange: 8,
    },
  };
  const pool = [
    {
      text: "Trade a guarded truth for safe passage.",
      outcome:
        "The bargain opens a route, but the group notices what you chose not to reveal. Survival improves while trust becomes conditional.",
      hopeChange: 3,
      trustChange: -5,
      chaosChange: -3,
      humanityChange: 1,
    },
    {
      text: "Invite the weakest voices into the decision.",
      outcome:
        "The choice slows everyone down, yet the people most often ignored spot a danger the armed scouts missed.",
      hopeChange: 5,
      trustChange: 4,
      chaosChange: 2,
      humanityChange: 6,
    },
    {
      text: "Create a decoy crisis to expose hidden motives.",
      outcome:
        "Your trap works, but manipulation leaves a residue. You learn who would betray you and who now wonders if you would do the same.",
      hopeChange: -2,
      trustChange: -7,
      chaosChange: 7,
      humanityChange: -3,
    },
    {
      text: "Spend scarce supplies to buy one quiet night.",
      outcome:
        "People sleep without flinching for the first time in days. Tomorrow will be harder, but tonight restores enough of them to matter.",
      hopeChange: 6,
      trustChange: 3,
      chaosChange: -4,
      humanityChange: 4,
    },
    {
      text: "Split the group so both urgent problems get answered.",
      outcome:
        "Both teams survive, barely. The success feels useful, but everyone now understands how thin your margin has become.",
      hopeChange: 2,
      trustChange: 1,
      chaosChange: 6,
      humanityChange: -2,
    },
    {
      text: "Refuse the easy alliance until its cost is spoken aloud.",
      outcome:
        "The negotiation turns colder and more honest. You lose speed, but the hidden price no longer owns the room.",
      hopeChange: -2,
      trustChange: 5,
      chaosChange: -2,
      humanityChange: 2,
    },
    {
      text: "Burn a resource cache so raiders cannot inherit it.",
      outcome:
        "Smoke marks your decision for miles. The raiders find nothing, and your people quietly count what safety just cost.",
      hopeChange: -5,
      trustChange: 0,
      chaosChange: 4,
      humanityChange: -6,
    },
  ];
  const signal =
    attemptCount + stats.hope * 3 + stats.trust * 5 + stats.chaos * 7 + stats.humanity;
  const offset = Math.abs(signal) % pool.length;
  const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];
  return [pressureChoice[pressure] ?? pressureChoice.hope, ...rotated].slice(0, 4);
}

function buildLocalGeneratedFallbackScenario({
  avatar,
  currentStats,
  recentChoices,
  attemptCount,
}) {
  const stats = normalizeStatsPayload(currentStats);
  const pressure = getDominantPressure(stats);
  const lastChoice = Array.isArray(recentChoices) ? recentChoices[0] : null;
  const turnLabel = `Turn ${attemptCount + 1}`;
  const pressureTitle = {
    hope: "The Lantern Debt",
    trust: "The Borrowed Signal",
    chaos: "The Smoke Math",
    humanity: "The Mercy Ledger",
  };
  const name = avatar?.name ?? "Your survivor";
  const roleLens = avatar?.trait?.toLowerCase() ?? "survivor";
  const memoryLine = lastChoice?.choiceText
    ? `The last branch still follows you: "${lastChoice.choiceText}".`
    : "This branch begins before the timeline has decided what you are becoming.";
  const futureMsg =
    `${name} remembers this moment because it looked small. It was not. Choose for the future you can live inside, not the one that flatters you right now.`;

  return {
    title: `${pressureTitle[pressure] ?? "The Broken Crossroad"} (${turnLabel})`,
    setting:
      `${name} reaches a junction where old warnings and fresh footprints overlap. ` +
      `Hope ${stats.hope}, trust ${stats.trust}, chaos ${stats.chaos}, and humanity ${stats.humanity} are pulling the group in different directions. ` +
      memoryLine,
    message:
      `The collapse offers no clean route. A ${roleLens} instinct says the obvious answer is probably bait, but waiting too long will become its own decision.`,
    futureMsg,
    futureSelfMessage: futureMsg,
    imageUrl: pickBackgroundForStats(stats),
    consequences: {
      summary:
        "A local narrative fallback kept the timeline moving after live AI was unavailable.",
      source: "local-generated-fallback",
      pressure,
      attemptCount,
    },
    choices: getLocalFallbackChoices({ pressure, attemptCount, stats }),
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
    runId: typeof payload?.runId === "string" ? payload.runId : null,
    username: username || null,
    avatarId: payload.avatarId,
    avatarName: payload?.avatarName ?? avatar?.name ?? null,
    scenarioId: payload.scenarioId,
    scenarioTitle: payload?.scenarioTitle ?? scenario?.title ?? null,
    choiceId: payload.choiceId,
    choiceText: payload?.choiceText ?? matchedChoice?.text ?? null,
    outcome: payload?.outcome ?? matchedChoice?.outcome ?? null,
    hope: payload.hope,
    trust: payload.trust,
    chaos: payload.chaos,
    humanity: payload.humanity,
    statsAfter: payload.statsAfter,
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
  return getRecentMemoriesForAvatarRun(avatarId);
}

async function getRecentMemoriesForAvatarRun(avatarId, runId) {
  const fromDatabase = await prisma.attempt.findMany({
    where: runId ? { avatarId, runId } : { avatarId },
    orderBy: { createdAt: "desc" },
    take: 8,
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
    createdAt: new Date(createdAt),
    ...normalizedPayload,
    hope: statsAfter.hope,
    trust: statsAfter.trust,
    chaos: statsAfter.chaos,
    humanity: statsAfter.humanity,
    statsAfter,
  };

  saveMemory(attempt);

  try {
    const saved = await prisma.attempt.create({ data: attempt });
    logInfo("Prisma attempt create success", {
      attemptId: saved.id,
      avatarId: saved.avatarId,
      scenarioId: saved.scenarioId,
      runId: saved.runId,
    });
    return saved;
  } catch (error) {
    logError("Prisma attempt create failure", error, {
      avatarId: attempt.avatarId,
      scenarioId: attempt.scenarioId,
      runId: attempt.runId,
    });
    throw error;
  }
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

  try {
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

    logInfo("Prisma generated scenario save success", {
      scenarioId: generated.id,
      choiceCount: generated.choices.length,
    });
  } catch (error) {
    logError("Prisma generated scenario save failure", error, {
      scenarioId: generated.id,
      choiceCount: generated.choices.length,
    });
    throw error;
  }

  return generated;
}

async function getGeneratedOrBuiltInFallback({
  avatarId,
  currentStats,
  recentChoices,
  runId,
}) {
  try {
    const avatar = await getAvatarById(avatarId);
    const attemptCount = await prisma.attempt.count({
      where: runId ? { avatarId, runId } : { avatarId },
    });
    const scenario = buildLocalGeneratedFallbackScenario({
      avatar,
      currentStats,
      recentChoices,
      attemptCount,
    });

    logInfo("Saving local generated fallback", {
      avatarId,
      runId,
      attemptCount,
      title: scenario.title,
    });
    return await saveGeneratedScenario(scenario);
  } catch (error) {
    logError("Local fallback save failed; returning unsaved fallback", error, {
      avatarId,
      runId,
    });
    return normalizeScenarioChoices(
      assignGeneratedIds(
        buildLocalGeneratedFallbackScenario({
          avatar: null,
          currentStats,
          recentChoices,
          attemptCount: 0,
        }),
      ),
    );
  }
}

export async function generateScenario({
  avatarId,
  currentStats,
  recentChoices,
  runId,
}) {
  logInfo("Scenario generation requested", {
    avatarId,
    runId,
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    liveAIDisabled: isLiveAIDisabled(),
    liveAISuspended: Date.now() < liveAISuspendedUntil,
    seededFallbackAllowed: allowSeededScenarioFallback(),
  });

  if (!process.env.OPENAI_API_KEY) {
    logInfo("OPENAI_API_KEY missing; using seeded fallback", {
      avatarId,
      runId,
    });
  } else if (isLiveAIDisabled()) {
    logInfo("Live AI disabled by ENABLE_LIVE_AI_SCENARIOS=false; using fallback", {
      avatarId,
      runId,
    });
  }

  if (canUseLiveAI()) {
    const avatar = await getAvatarById(avatarId);
    const internalMemories = await getRecentMemoriesForAvatarRun(avatarId, runId);
    const timeoutMs = getOpenAIScenarioTimeoutMs();
    const combinedRecentChoices = [
      ...internalMemories,
      ...(Array.isArray(recentChoices) ? recentChoices : []),
    ].slice(0, 8);

    let generated;
    let generationError = null;

    try {
      logInfo("OpenAI scenario request start", {
        avatarId,
        runId,
        memoryCount: combinedRecentChoices.length,
        timeoutMs,
      });
      generated = await withTimeout(
        generateAIScenario({
          avatar,
          currentStats,
          recentChoices: combinedRecentChoices,
          timeoutMs,
        }).catch((error) => {
          throw error;
        }),
        timeoutMs + 1000,
        `OpenAI scenario request timed out after ${timeoutMs + 1000}ms`,
      );
    } catch (firstError) {
      generationError = firstError;
      logError("OpenAI scenario request failure with history", firstError, {
        avatarId,
        runId,
      });
      if (!isTimeoutError(firstError)) {
        try {
          logInfo("OpenAI scenario retry start without history", {
            avatarId,
            runId,
            timeoutMs,
          });
          generated = await withTimeout(
            generateAIScenario({
              avatar,
              currentStats,
              recentChoices: [],
              timeoutMs,
            }).catch((error) => {
              throw error;
            }),
            timeoutMs + 1000,
            `OpenAI scenario retry timed out after ${timeoutMs + 1000}ms`,
          );
        } catch (secondError) {
          generationError = secondError;
          logError("OpenAI scenario retry failure", secondError, {
            avatarId,
            runId,
          });
          if (isTimeoutError(secondError)) {
            suspendLiveAI("scenario_retry_timeout");
          }
        }
      } else {
        suspendLiveAI("scenario_timeout");
        logInfo("Skipping OpenAI retry after timeout", {
          avatarId,
          runId,
        });
      }
    }

    if (generated) {
      logInfo("OpenAI scenario request success", {
        avatarId,
        runId,
        title: generated.title,
        choiceCount: generated.choices?.length ?? 0,
      });
      try {
        return await saveGeneratedScenario(generated);
      } catch (error) {
        logError("Generated scenario save failed; falling back", error, {
          avatarId,
          runId,
          title: generated.title,
        });
      }
    }

    if (generationError) {
      logError("OpenAI unavailable; fallback will be used", generationError, {
        avatarId,
        runId,
        seededFallbackAllowed: allowSeededScenarioFallback(),
      });
    }
  }

  if (allowSeededScenarioFallback()) {
    try {
      const seededScenario = await getSeededScenarioForAvatar({
        avatarId,
        currentStats,
        runId,
      });

      if (seededScenario) {
        logInfo("Returning seeded scenario fallback", {
          avatarId,
          runId,
          scenarioId: seededScenario.id,
        });
        return seededScenario;
      }
    } catch (error) {
      logError("Seeded scenario fallback failed", error, {
        avatarId,
        runId,
      });
    }
  } else {
    logInfo("Skipping seeded scenario fallback in live AI mode", {
      avatarId,
      runId,
    });
  }

  return getGeneratedOrBuiltInFallback({
    avatarId,
    currentStats,
    recentChoices,
    runId,
  });
}

export async function generateFallbackScenario() {
  return saveGeneratedScenario(fallbackGeneratedScenario());
}
