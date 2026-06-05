import { MOCK_SCENARIOS } from "./mockData.js";
import { hasDedicatedTrack } from "./sceneAudioMap.js";

// Only offer the AI background images that have a dedicated music track. This
// keeps generated scenarios in lockstep with the audio map: every image the AI
// can pick is guaranteed to play matched music, never the silent-by-omission
// path. Seed images are covered the same way (see sceneAudioMap.js).
export const VALID_BACKGROUND_IMAGES = Array.from(
  new Set(
    MOCK_SCENARIOS.map((scenario) => scenario.imageUrl).filter(
      (imageUrl) =>
        typeof imageUrl === "string" &&
        imageUrl.length > 0 &&
        hasDedicatedTrack(imageUrl),
    ),
  ),
);

const DEFAULT_BACKGROUND_IMAGE =
  VALID_BACKGROUND_IMAGES.find((imageUrl) =>
    imageUrl.includes("ruined-city"),
  ) ??
  VALID_BACKGROUND_IMAGES[0] ??
  "/images/backgrounds/ruined-city.png";

const PERSONALITY_BY_TRAIT = {
  Observant: "guarded, watchful, precise, suspicious of easy answers",
  Compassionate: "empathetic, healing, emotionally honest, human-focused",
  Practical: "resilient, systems-minded, blunt, resource-conscious",
  Protective: "guarded, loyal, cautious, willing to absorb danger first",
  Persuasive: "hopeful, diplomatic, alliance-minded, careful with trust",
  Resourceful: "scrappy, adaptive, opportunistic, suspicious but not cruel",
};

function getAvatarPersonality(avatar) {
  return (
    avatar.personality ??
    PERSONALITY_BY_TRAIT[avatar.trait] ??
    "resilient, conflicted, survival-focused"
  );
}

function normalizeStatsForPrompt(stats) {
  return {
    hope: Number(stats?.hope ?? 0),
    trust: Number(stats?.trust ?? 0),
    chaos: Number(stats?.chaos ?? 0),
    humanity: Number(stats?.humanity ?? 0),
  };
}

function formatHistoryItem(choice, index) {
  if (typeof choice === "string") {
    return `${index + 1}. Choice: ${choice}`;
  }

  const statsAfter = choice?.statsAfter || {};
  return `${index + 1}. ${choice?.scenarioTitle || "Unknown"} | ${choice?.choiceText || choice?.text || "Unknown"} -> ${choice?.outcome || "Unknown"} | stats h${statsAfter.hope ?? "?"}/t${statsAfter.trust ?? "?"}/c${statsAfter.chaos ?? "?"}/m${statsAfter.humanity ?? "?"}`;
}

function formatScenarioContext(scenario) {
  if (!scenario) return "None.";

  return `${scenario.title ?? "unknown"} | ${scenario.setting ?? scenario.message ?? "unknown"} | future: ${scenario.futureSelfMessage ?? scenario.futureMsg ?? "unknown"}`;
}

function formatSelectedChoiceContext(choice) {
  if (!choice) return "None.";

  return `${choice.text ?? "unknown"} -> ${choice.outcome ?? "unknown"} | delta h${choice.hopeChange ?? 0}/t${choice.trustChange ?? 0}/c${choice.chaosChange ?? 0}/m${choice.humanityChange ?? 0}`;
}

export function buildOpenAIPrompt(
  avatar,
  currentStats,
  recentChoices,
  context = {},
) {
  const recentHistory =
    Array.isArray(recentChoices) && recentChoices.length > 0
      ? recentChoices
          .slice(0, 3)
          .map((choice, index) => formatHistoryItem(choice, index))
          .join("\n")
      : "None.";
  const personality = getAvatarPersonality(avatar);
  const stats = normalizeStatsForPrompt(currentStats);
  return `Generate ONE gameplay scenario for Ashes Between Us. Return JSON only.

Avatar: ${avatar.id} / ${avatar.name} / ${avatar.trait}
Personality: ${personality}
Description: ${avatar.description}
Backstory: ${avatar.backstory}
Stats: hope=${stats.hope}, trust=${stats.trust}, chaos=${stats.chaos}, humanity=${stats.humanity}

Recent run history:
${recentHistory}

Rules:
- Post-apocalyptic, cinematic, emotional, morally complicated.
- Be concise: title <= 8 words, setting <= 55 words, message <= 45 words, futureSelfMessage <= 35 words, choice text <= 16 words, outcome <= 28 words.
- Return exactly 4 choices. Choices must connect directly to this scenario and have integer stat deltas -20..20.
- Future self sounds like ${avatar.name} after living through consequences.
- If previous context exists, next scenario must be caused by it.
- imagePrompt describes the scenario image, no text/logos/UI.

Previous scenario: ${formatScenarioContext(context.previousScenario)}
Selected choice: ${formatSelectedChoiceContext(context.selectedChoice)}
Outcome: ${context.outcome ?? context.selectedChoice?.outcome ?? "None."}

JSON shape:
{
  "title": "",
  "setting": "",
  "message": "",
  "futureSelfMessage": "",
  "imagePrompt": "",
  "choices": [
    {
      "text": "",
      "outcome": "",
      "hopeChange": 0,
      "trustChange": 0,
      "chaosChange": 0,
      "humanityChange": 0
    },
    {
      "text": "",
      "outcome": "",
      "hopeChange": 0,
      "trustChange": 0,
      "chaosChange": 0,
      "humanityChange": 0
    },
    {
      "text": "",
      "outcome": "",
      "hopeChange": 0,
      "trustChange": 0,
      "chaosChange": 0,
      "humanityChange": 0
    },
    {
      "text": "",
      "outcome": "",
      "hopeChange": 0,
      "trustChange": 0,
      "chaosChange": 0,
      "humanityChange": 0
    }
  ]
}
`;
}

export function parseOpenAIJson(rawText) {
  if (typeof rawText !== "string") {
    throw new Error("OpenAI response is not a string.");
  }

  try {
    return JSON.parse(rawText);
  } catch (firstError) {
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const candidate = rawText.slice(start, end + 1);
      return JSON.parse(candidate);
    }
    throw new Error("AI returned invalid scenario JSON", {
      cause: firstError,
    });
  }
}

export function createGeneratedScenarioId() {
  return `generated-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
}

export function createGeneratedChoiceId(index, baseId) {
  return `generated-choice-${baseId}-${index + 1}`;
}

export function isValidGeneratedScenario(scenario) {
  const choiceCount = Array.isArray(scenario?.choices)
    ? scenario.choices.length
    : 0;

  return (
    scenario &&
    typeof scenario.title === "string" &&
    (typeof scenario.setting === "string" ||
      typeof scenario.message === "string") &&
    (typeof scenario.futureMsg === "string" ||
      typeof scenario.futureSelfMessage === "string") &&
    Array.isArray(scenario.choices) &&
    choiceCount >= 3 &&
    choiceCount <= 6 &&
    scenario.choices.every(
      (choice) => {
        const statChanges = choice?.statChanges ?? {};
        return (
          choice &&
          typeof choice.text === "string" &&
          typeof choice.outcome === "string" &&
          (Number.isInteger(choice.hopeChange) ||
            Number.isInteger(statChanges.hope)) &&
          (Number.isInteger(choice.trustChange) ||
            Number.isInteger(statChanges.trust)) &&
          (Number.isInteger(choice.chaosChange) ||
            Number.isInteger(statChanges.chaos)) &&
          (Number.isInteger(choice.humanityChange) ||
            Number.isInteger(statChanges.humanity))
        );
      },
    )
  );
}

export function normalizeGeneratedScenario(rawScenario) {
  if (!isValidGeneratedScenario(rawScenario)) {
    console.error("[futureSelf] Validation failed for generated scenario", {
      hasTitle: typeof rawScenario?.title === "string",
      hasSetting:
        typeof rawScenario?.setting === "string" ||
        typeof rawScenario?.message === "string",
      hasFutureMessage:
        typeof rawScenario?.futureMsg === "string" ||
        typeof rawScenario?.futureSelfMessage === "string",
      choiceCount: Array.isArray(rawScenario?.choices)
        ? rawScenario.choices.length
        : null,
    });
    throw new Error("Generated scenario does not match the required shape.");
  }

  const imageUrl = VALID_BACKGROUND_IMAGES.includes(rawScenario.imageUrl)
    ? rawScenario.imageUrl
    : DEFAULT_BACKGROUND_IMAGE;
  const setting = rawScenario.setting ?? rawScenario.message;
  const message = rawScenario.message ?? setting;
  const futureMsg = rawScenario.futureMsg ?? rawScenario.futureSelfMessage;
  const imagePrompt =
    typeof rawScenario.imagePrompt === "string"
      ? rawScenario.imagePrompt
      : null;
  const consequences =
    rawScenario.consequences && typeof rawScenario.consequences === "object"
      ? rawScenario.consequences
      : {};

  return {
    id: rawScenario.id,
    title: rawScenario.title,
    setting,
    message,
    futureMsg,
    futureSelfMessage: futureMsg,
    imageUrl,
    choices: rawScenario.choices.map((choice) => ({
      id: choice.id,
      text: choice.text,
      outcome: choice.outcome,
      hopeChange: Number(choice.hopeChange ?? choice.statChanges?.hope),
      trustChange: Number(choice.trustChange ?? choice.statChanges?.trust),
      chaosChange: Number(choice.chaosChange ?? choice.statChanges?.chaos),
      humanityChange: Number(
        choice.humanityChange ?? choice.statChanges?.humanity,
      ),
      statChanges: {
        hope: Number(choice.hopeChange ?? choice.statChanges?.hope),
        trust: Number(choice.trustChange ?? choice.statChanges?.trust),
        chaos: Number(choice.chaosChange ?? choice.statChanges?.chaos),
        humanity: Number(
          choice.humanityChange ?? choice.statChanges?.humanity,
        ),
      },
    })),
    consequences: {
      ...consequences,
      imagePrompt,
      summary:
        consequences.summary ??
        rawScenario.choices[0]?.outcome ??
        "The timeline shifts.",
    },
  };
}

export function fallbackGeneratedScenario() {
  return {
    title: "Signal From Tomorrow",
    setting:
      "The radio crackles with a warning that sounds too much like your own voice. Something is shifting in the timeline, and your next choice may decide whether this future heals or fractures.",
    futureMsg:
      "Listen carefully. The future is not punishing you. It is showing you what your choices are becoming.",
    imageUrl: DEFAULT_BACKGROUND_IMAGE,
    choices: [
      {
        text: "Follow the signal toward the unknown.",
        outcome:
          "You move into the dark with the voice as your only guide. The ground shifts beneath your feet, but the signal keeps pulsing.",
        hopeChange: 4,
        trustChange: 2,
        chaosChange: 10,
        humanityChange: 0,
      },
      {
        text: "Stay with the group and reinforce what you have built.",
        outcome:
          "You choose the familiar over the mysterious. The group tightens, and the future waits at the edge of the signal.",
        hopeChange: 2,
        trustChange: 8,
        chaosChange: -5,
        humanityChange: 3,
      },
      {
        text: "Destroy the signal before it changes anyone else.",
        outcome:
          "You end the broadcast and force everyone to decide based on what they already know. The timeline no longer whispers, but it also no longer guides.",
        hopeChange: -5,
        trustChange: 0,
        chaosChange: -8,
        humanityChange: -10,
      },
      {
        text: "Intercept the signal and rebroadcast a decoy route.",
        outcome:
          "Your decoy buys a few hours of safety, but someone eventually notices the pattern and starts tracking your broadcasts.",
        hopeChange: 1,
        trustChange: -3,
        chaosChange: 6,
        humanityChange: -1,
      },
      {
        text: "Invite nearby settlements into a shared listening council.",
        outcome:
          "Different factions gather under uneasy rules. Coordination improves, but every decision now requires fragile compromise.",
        hopeChange: 6,
        trustChange: 7,
        chaosChange: -4,
        humanityChange: 5,
      },
      {
        text: "Go silent and archive every transmission before choosing.",
        outcome:
          "You delay action to gather evidence. The data becomes invaluable, but people in immediate danger wait longer than they should.",
        hopeChange: -2,
        trustChange: 4,
        chaosChange: -2,
        humanityChange: -3,
      },
    ],
  };
}
