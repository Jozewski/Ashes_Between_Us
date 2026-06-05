import { AVATARS } from "./mockData.js";
import { prisma } from "./prisma.js";
import { generateAIScenario } from "./aiScenarioService.js";
import {
  createGeneratedChoiceId,
  createGeneratedScenarioId,
} from "./futureSelfService.js";

const DEFAULT_STATS = {
  hope: 50,
  trust: 50,
  chaos: 50,
  humanity: 50,
};

function createRunId() {
  return `run-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
}

function clampStat(value) {
  return Math.max(0, Math.min(100, Number(value ?? 0)));
}

function normalizeStats(stats) {
  return {
    hope: clampStat(stats?.hope ?? DEFAULT_STATS.hope),
    trust: clampStat(stats?.trust ?? DEFAULT_STATS.trust),
    chaos: clampStat(stats?.chaos ?? DEFAULT_STATS.chaos),
    humanity: clampStat(stats?.humanity ?? DEFAULT_STATS.humanity),
  };
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

async function loadAvatar(avatarId) {
  console.log("[gameEngine] avatarId received", { avatarId });

  try {
    const row = await prisma.avatar.findUnique({ where: { id: avatarId } });
    if (row) {
      console.log("[gameEngine] avatar loaded", { avatarId: row.id });
      return mapAvatarRow(row);
    }
  } catch (error) {
    console.error("[gameEngine] avatar Prisma lookup failed", {
      avatarId,
      error: error?.message ?? error,
    });
  }

  const fallback =
    AVATARS.find((avatar) => avatar.id === avatarId) ?? AVATARS[0] ?? null;
  if (!fallback) {
    throw new Error("Avatar not found.");
  }

  console.log("[gameEngine] fallback avatar loaded", { avatarId: fallback.id });
  return fallback;
}

function getImagePrompt(scenario) {
  return scenario?.imagePrompt ?? scenario?.consequences?.imagePrompt ?? "";
}

function normalizeScenarioForClient(scenario) {
  const imagePrompt = getImagePrompt(scenario);

  return {
    id: scenario.id,
    title: scenario.title,
    setting: scenario.setting,
    message: scenario.message ?? scenario.setting,
    futureMsg: scenario.futureMsg ?? scenario.futureSelfMessage,
    futureSelfMessage: scenario.futureSelfMessage ?? scenario.futureMsg,
    imageUrl: scenario.imageUrl,
    imagePrompt,
    choices: (scenario.choices ?? []).map((choice) => ({
      id: choice.id,
      scenarioId: choice.scenarioId ?? scenario.id,
      text: choice.text,
      outcome: choice.outcome,
      hopeChange: Number(choice.hopeChange ?? 0),
      trustChange: Number(choice.trustChange ?? 0),
      chaosChange: Number(choice.chaosChange ?? 0),
      humanityChange: Number(choice.humanityChange ?? 0),
    })),
  };
}

function localFallbackScenario({
  avatar,
  stats,
  previousScenario,
  selectedChoice,
  history,
}) {
  const pressure = Object.entries(stats).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "hope";
  const turn = Array.isArray(history) ? history.length + 1 : 1;
  const cause = selectedChoice?.text
    ? `Your last choice, "${selectedChoice.text}", is already changing how people move around you.`
    : `${avatar.name}'s first steps make the group decide what kind of survivor they are following.`;
  const futureSelfMessage =
    `${avatar.name}, I remember this branch. It did not ask whether you were good. It asked what you were willing to carry afterward.`;

  return {
    id: createGeneratedScenarioId(),
    title: `${avatar.trait} Pressure: ${pressure.toUpperCase()} ${turn}`,
    setting:
      `A ruined checkpoint splits into three unsafe roads while ash drifts through the wires. ${cause} Hope ${stats.hope}, trust ${stats.trust}, chaos ${stats.chaos}, and humanity ${stats.humanity} press against the decision.`,
    message:
      `The scene feels built for ${avatar.name}: ${avatar.description} The obvious answer would solve one problem and quietly create another.`,
    futureMsg: futureSelfMessage,
    futureSelfMessage,
    imageUrl: avatar.futureImageUrl ?? avatar.imageUrl,
    imagePrompt:
      `Cinematic post-apocalyptic checkpoint, ${avatar.trait.toLowerCase()} survivor perspective, ash in the air, morally tense group decision, no text, no logo`,
    consequences: {
      imagePrompt:
        `Cinematic post-apocalyptic checkpoint, ${avatar.trait.toLowerCase()} survivor perspective, ash in the air, morally tense group decision, no text, no logo`,
      source: "game-engine-local-fallback",
      pressure,
    },
    choices: [
      {
        text: "Give the frightened scouts the truth and risk panic.",
        outcome:
          "The truth shakes them, but nobody can accuse you of hiding the cost. Fear spreads with discipline instead of rumor.",
        hopeChange: -2,
        trustChange: 7,
        chaosChange: 3,
        humanityChange: 4,
      },
      {
        text: "Take the dangerous road yourself and leave the group safer.",
        outcome:
          "You absorb the first risk and buy the others time. The group admires it, but your absence lets old doubts speak.",
        hopeChange: 5,
        trustChange: 2,
        chaosChange: 4,
        humanityChange: 2,
      },
      {
        text: "Bargain with the armed strangers before anyone draws blood.",
        outcome:
          "The bargain holds, barely. You prevent a fight, but everyone hears how much leverage the strangers now have.",
        hopeChange: 2,
        trustChange: -3,
        chaosChange: -5,
        humanityChange: 1,
      },
      {
        text: "Sacrifice supplies to protect the injured from the march.",
        outcome:
          "The injured survive the hour. Hunger becomes tomorrow's argument, but tonight the group remembers they are still people.",
        hopeChange: 4,
        trustChange: 4,
        chaosChange: -1,
        humanityChange: 7,
      },
    ],
  };
}

async function saveScenarioWithChoices(scenario) {
  const scenarioId = scenario.id ?? createGeneratedScenarioId();
  const imagePrompt = getImagePrompt(scenario);

  console.log("[gameEngine] saving scenario", {
    scenarioId,
    title: scenario.title,
    choiceCount: scenario.choices?.length ?? 0,
  });

  await prisma.scenario.create({
    data: {
      id: scenarioId,
      title: scenario.title,
      setting: scenario.setting,
      message: scenario.message ?? scenario.setting,
      futureMsg: scenario.futureMsg ?? scenario.futureSelfMessage,
      futureSelfMessage: scenario.futureSelfMessage ?? scenario.futureMsg,
      imageUrl: scenario.imageUrl,
      consequences: {
        ...(scenario.consequences && typeof scenario.consequences === "object"
          ? scenario.consequences
          : {}),
        imagePrompt,
      },
      choices: {
        create: (scenario.choices ?? []).map((choice, index) => ({
          id: choice.id ?? createGeneratedChoiceId(index, scenarioId),
          text: choice.text,
          outcome: choice.outcome,
          hopeChange: Number(choice.hopeChange ?? 0),
          trustChange: Number(choice.trustChange ?? 0),
          chaosChange: Number(choice.chaosChange ?? 0),
          humanityChange: Number(choice.humanityChange ?? 0),
          requiredRole: choice.requiredRole ?? null,
          roleBonus: choice.roleBonus ?? null,
        })),
      },
    },
    include: { choices: true },
  });

  console.log("[gameEngine] scenario saved", {
    scenarioId,
    choicesSaved: scenario.choices?.length ?? 0,
  });

  return prisma.scenario.findUnique({
    where: { id: scenarioId },
    include: { choices: true },
  });
}

export function applyChoiceToStats({ choice, currentStats }) {
  const stats = normalizeStats(currentStats);
  return {
    hope: clampStat(stats.hope + Number(choice?.hopeChange ?? 0)),
    trust: clampStat(stats.trust + Number(choice?.trustChange ?? 0)),
    chaos: clampStat(stats.chaos + Number(choice?.chaosChange ?? 0)),
    humanity: clampStat(stats.humanity + Number(choice?.humanityChange ?? 0)),
  };
}

export async function generateScenario({
  avatar,
  stats,
  history = [],
  previousScenario = null,
  selectedChoice = null,
}) {
  const normalizedStats = normalizeStats(stats);
  console.log("[gameEngine] AI scenario prompt created", {
    avatarId: avatar.id,
    historyCount: history.length,
    hasPreviousScenario: Boolean(previousScenario),
    hasSelectedChoice: Boolean(selectedChoice),
  });

  if (process.env.OPENAI_API_KEY && process.env.ENABLE_LIVE_AI_SCENARIOS !== "false") {
    try {
      console.log("[gameEngine] OpenAI call started");
      const generated = await generateAIScenario({
        avatar,
        currentStats: normalizedStats,
        recentChoices: history,
        previousScenario,
        selectedChoice,
        outcome: selectedChoice?.outcome,
        timeoutMs: Number(process.env.OPENAI_SCENARIO_TIMEOUT_MS ?? 20000),
      });
      console.log("[gameEngine] OpenAI call completed", {
        title: generated.title,
        choiceCount: generated.choices?.length ?? 0,
      });
      return generated;
    } catch (error) {
      console.error("[gameEngine] OpenAI call failed", {
        reason: error?.message ?? error,
      });
    }
  } else {
    console.log("[gameEngine] OpenAI skipped", {
      reason: process.env.OPENAI_API_KEY
        ? "ENABLE_LIVE_AI_SCENARIOS=false"
        : "OPENAI_API_KEY missing",
    });
  }

  console.log("[gameEngine] fallback used", {
    reason: "openai_unavailable_or_disabled",
    avatarId: avatar.id,
  });
  return localFallbackScenario({
    avatar,
    stats: normalizedStats,
    previousScenario,
    selectedChoice,
    history,
  });
}

export async function startGame({ avatarId, username }) {
  console.log("[gameEngine] /api/game/start called", { avatarId, username });
  const runId = createRunId();
  const avatar = await loadAvatar(avatarId);
  const stats = normalizeStats(avatar.startingStats);
  console.log("[gameEngine] starting stats loaded", stats);

  const scenarioDraft = await generateScenario({
    avatar,
    stats,
    history: [],
  });
  const scenario = await saveScenarioWithChoices(scenarioDraft);

  return {
    runId,
    avatar,
    stats,
    scenario: normalizeScenarioForClient(scenario),
  };
}

export async function continueGame({
  runId,
  avatarId,
  scenarioId,
  choiceId,
  currentStats,
  username,
}) {
  console.log("[gameEngine] /api/game/choose called", {
    runId,
    avatarId,
    scenarioId,
    choiceId,
  });

  const avatar = await loadAvatar(avatarId);
  const previousScenario = await prisma.scenario.findUnique({
    where: { id: scenarioId },
    include: { choices: true },
  });
  if (!previousScenario) throw new Error("Scenario not found.");

  const selectedChoice =
    previousScenario.choices.find((choice) => choice.id === choiceId) ??
    (await prisma.choice.findUnique({ where: { id: choiceId } }));
  if (!selectedChoice) throw new Error("Choice not found.");

  console.log("[gameEngine] choice loaded", {
    choiceId: selectedChoice.id,
    text: selectedChoice.text,
  });

  const statsBefore = normalizeStats(currentStats);
  const statsAfter = applyChoiceToStats({
    choice: selectedChoice,
    currentStats: statsBefore,
  });

  console.log("[gameEngine] statsBefore", statsBefore);
  console.log("[gameEngine] statsAfter", statsAfter);

  const attempt = await prisma.attempt.create({
    data: {
      id: `attempt-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`,
      runId,
      username: username?.trim() || null,
      avatarId: avatar.id,
      avatarName: avatar.name,
      scenarioId: previousScenario.id,
      scenarioTitle: previousScenario.title,
      choiceId: selectedChoice.id,
      choiceText: selectedChoice.text,
      outcome: selectedChoice.outcome,
      hope: statsAfter.hope,
      trust: statsAfter.trust,
      chaos: statsAfter.chaos,
      humanity: statsAfter.humanity,
      statsAfter,
    },
  });

  console.log("[gameEngine] attempt saved", { attemptId: attempt.id });

  const history = await prisma.attempt.findMany({
    where: { runId },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const nextScenarioDraft = await generateScenario({
    avatar,
    stats: statsAfter,
    history,
    previousScenario,
    selectedChoice,
  });
  const nextScenario = await saveScenarioWithChoices(nextScenarioDraft);

  console.log("[gameEngine] next scenario generated", {
    scenarioId: nextScenario.id,
    title: nextScenario.title,
  });

  return {
    runId,
    statsBefore,
    statsAfter,
    selectedChoice: {
      id: selectedChoice.id,
      text: selectedChoice.text,
      outcome: selectedChoice.outcome,
      hopeChange: Number(selectedChoice.hopeChange ?? 0),
      trustChange: Number(selectedChoice.trustChange ?? 0),
      chaosChange: Number(selectedChoice.chaosChange ?? 0),
      humanityChange: Number(selectedChoice.humanityChange ?? 0),
    },
    attempt,
    nextScenario: normalizeScenarioForClient(nextScenario),
  };
}
