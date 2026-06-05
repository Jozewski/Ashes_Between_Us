import { MOCK_SCENARIOS } from "./mockData.js";

export const VALID_BACKGROUND_IMAGES = Array.from(
  new Set(
    MOCK_SCENARIOS.map((scenario) => scenario.imageUrl).filter(
      (imageUrl) => typeof imageUrl === "string" && imageUrl.length > 0,
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
  return `${index + 1}. Scenario: ${choice?.scenarioTitle || "Unknown"}
   Choice: ${choice?.choiceText || choice?.text || "Unknown"}
   Outcome: ${choice?.outcome || "Unknown"}
   Stats after: hope=${statsAfter.hope ?? "?"}, trust=${statsAfter.trust ?? "?"}, chaos=${statsAfter.chaos ?? "?"}, humanity=${statsAfter.humanity ?? "?"}`;
}

export function buildOpenAIPrompt(avatar, currentStats, recentChoices) {
  const recentHistory =
    Array.isArray(recentChoices) && recentChoices.length > 0
      ? recentChoices
          .map((choice, index) => formatHistoryItem(choice, index))
          .join("\n\n")
      : "None available.";
  const personality = getAvatarPersonality(avatar);
  const stats = normalizeStatsForPrompt(currentStats);
  const futureStates = Object.keys(avatar.futureImageByState ?? {});
  const approvedImages =
    VALID_BACKGROUND_IMAGES.length > 0
      ? VALID_BACKGROUND_IMAGES.join("\n")
      : DEFAULT_BACKGROUND_IMAGE;

  return `You are a narrative engine generating one new scenario for Ashes Between Us. Return JSON only. Continue the player's timeline rather than restarting the story.

Avatar:
- id: ${avatar.id}
- name: ${avatar.name}
- trait: ${avatar.trait}
- personality: ${personality}
- description: ${avatar.description}
- imageUrl: ${avatar.imageUrl}
- futureImageUrl: ${avatar.futureImageUrl}
- futureImageByState keys: ${futureStates.length > 0 ? futureStates.join(", ") : "none"}
- startingStats: hope=${avatar.startingStats.hope}, trust=${avatar.startingStats.trust}, chaos=${avatar.startingStats.chaos}, humanity=${avatar.startingStats.humanity}

Current stats:
- hope: ${stats.hope}
- trust: ${stats.trust}
- chaos: ${stats.chaos}
- humanity: ${stats.humanity}

Recent choices and memories (up to 5):
${recentHistory}

Rules:
- Return valid JSON only.
- Do not use markdown.
- Include exactly 6 choices (A through F).
- Each choice must have meaningful tradeoffs, not random stat changes.
- Stat changes must be integers between -20 and 20.
- Every choice must have an outcome.
- Do not make every choice dark.
- Do not make every choice good.
- The avatar personality must shape tone, warnings, advice, choice framing, and consequences.
- The futureSelfMessage must sound like the same avatar speaking from a later, harder timeline.
- Reference at least one previous decision when history is available.
- Use an imageUrl from the approved list when you return imageUrl.

Personality guidance:
- Hopeful voices encourage resilience and name what can still be saved.
- Guarded voices warn, question motives, and value caution.
- Chaotic voices feel unstable, impulsive, and unpredictable without becoming nonsense.
- Empathetic voices focus on people, grief, mercy, and the cost of survival.

Required JSON object shape:
{
  "title": "",
  "message": "",
  "futureSelfMessage": "",
  "imageUrl": "",
  "choices": [
    {
      "text": "",
      "outcome": "",
      "statChanges": {
        "hope": 0,
        "trust": 0,
        "chaos": 0,
        "humanity": 0
      }
    },
    {
      "text": "",
      "outcome": "",
      "statChanges": {
        "hope": 0,
        "trust": 0,
        "chaos": 0,
        "humanity": 0
      }
    },
    {
      "text": "",
      "outcome": "",
      "statChanges": {
        "hope": 0,
        "trust": 0,
        "chaos": 0,
        "humanity": 0
      }
    },
    {
      "text": "",
      "outcome": "",
      "statChanges": {
        "hope": 0,
        "trust": 0,
        "chaos": 0,
        "humanity": 0
      }
    },
    {
      "text": "",
      "outcome": "",
      "statChanges": {
        "hope": 0,
        "trust": 0,
        "chaos": 0,
        "humanity": 0
      }
    },
    {
      "text": "",
      "outcome": "",
      "statChanges": {
        "hope": 0,
        "trust": 0,
        "chaos": 0,
        "humanity": 0
      }
    }
  ],
  "consequences": {
    "summary": ""
  }
}

Approved imageUrl values:
${approvedImages}

Use the avatar's role, current mood, stats, and recent decisions to personalize the scenario. Make the scene fit the avatar's specialty and current emotional state.
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
  return (
    scenario &&
    typeof scenario.title === "string" &&
    (typeof scenario.setting === "string" ||
      typeof scenario.message === "string") &&
    (typeof scenario.futureMsg === "string" ||
      typeof scenario.futureSelfMessage === "string") &&
    Array.isArray(scenario.choices) &&
    scenario.choices.length === 6 &&
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
    throw new Error("Generated scenario does not match the required shape.");
  }

  const imageUrl = VALID_BACKGROUND_IMAGES.includes(rawScenario.imageUrl)
    ? rawScenario.imageUrl
    : DEFAULT_BACKGROUND_IMAGE;
  const setting = rawScenario.setting ?? rawScenario.message;
  const futureMsg = rawScenario.futureMsg ?? rawScenario.futureSelfMessage;

  return {
    id: rawScenario.id,
    title: rawScenario.title,
    setting,
    message: setting,
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
    consequences: rawScenario.consequences ?? {
      summary: rawScenario.choices[0]?.outcome ?? "The timeline shifts.",
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
