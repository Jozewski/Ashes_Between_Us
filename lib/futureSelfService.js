// All scene images that have dedicated audio tracks — backgrounds, skyscapes, and
// outcome vistas.  13 total, enough to fill a full 10-turn run with no repeats.
import {
  formatAvatarWritingGuide,
  pickAvatarSceneFrame,
} from "./avatarWritingGuide.js";
import {
  getAvatarSceneLabels,
  getImageMatchAliases,
  getSelectableScenarioImages,
} from "./imageAssetCatalog.js";

export const VALID_BACKGROUND_IMAGES = getSelectableScenarioImages();
/*
  // Core backgrounds
  "/images/backgrounds/bunker.png",
  "/images/backgrounds/desert-highway.png",
  "/images/backgrounds/forest-safe-zone.png",
  "/images/backgrounds/radio-tower.png",
  "/images/backgrounds/ruined-city.png",
  // Skyscapes — atmospheric / ethereal
  "/images/backgrounds/refugee-border-crossing.png",
  "/images/backgrounds/contested-resource-hearing.png",
  "/images/backgrounds/weather-hidden-loyalties.png",
  "/images/backgrounds/limited-evacuation-convoy.png",
  // Outcome vistas — usable as high-drama or late-game backgrounds
  "/images/endings/ending-balanced-future.png",
  "/images/endings/ending-broken-future.png",
  "/images/endings/ending-chaotic-future.png",
  "/images/endings/ending-rebuilding-future.png",
*/

const DEFAULT_BACKGROUND_IMAGE = "/images/backgrounds/ruined-city.png";
const REQUIRED_CHOICE_COUNT = 6;

const SCENE_FRAMES = [
  "contested resource hearing",
  "failed rescue with witnesses",
  "sabotaged infrastructure repair",
  "ritual, trial, or public reckoning",
  "marketplace negotiation under threat",
  "evacuation route with limited transport",
  "quarantine or medical triage dispute",
  "signal, translation, or misinformation crisis",
  "shelter leadership vote during a hazard",
  "border crossing with refugees and guards",
  "salvage claim where ownership is unclear",
  "weather disaster exposing hidden loyalties",
];

const CHOICE_LANES = [
  "A: Take a transparent humane risk that may cost safety.",
  "B: Use process, evidence, or containment to reduce chaos.",
  "C: Build a broader coalition or invite excluded voices.",
  "D: Act decisively with force, sacrifice, or command authority.",
  "E: Exploit leverage for your people at an ethical cost.",
  "F: Delay, refuse, withdraw, or postpone with a concrete price.",
];

// Semantic keyword tags for each image — used to match an AI imagePrompt to the
// best available (and not yet used) image for this game run.
const IMAGE_KEYWORDS = {
  "/images/backgrounds/bunker.png":
    ["bunker", "shelter", "underground", "enclosed", "dark", "safe", "supplies", "refuge", "hiding"],
  "/images/backgrounds/desert-highway.png":
    ["desert", "highway", "road", "open", "exposed", "travel", "journey", "wasteland", "escape"],
  "/images/backgrounds/forest-safe-zone.png":
    ["forest", "trees", "green", "safe zone", "sanctuary", "nature", "hope", "woods"],
  "/images/backgrounds/radio-tower.png":
    ["radio", "tower", "signal", "broadcast", "communication", "antenna", "message", "contact"],
  "/images/backgrounds/ruined-city.png":
    ["ruin", "city", "urban", "collapse", "debris", "chaos", "destruction", "building", "street"],
  "/images/backgrounds/refugee-border-crossing.png":
    ["refugee", "border", "crossing", "checkpoint", "guards", "families", "barricade", "passage"],
  "/images/backgrounds/contested-resource-hearing.png":
    ["contested", "resource", "hearing", "council", "water", "ration", "ledger", "public", "dispute"],
  "/images/backgrounds/weather-hidden-loyalties.png":
    ["mountain", "storm", "danger", "conflict", "tension", "weather", "peak", "high ground"],
  "/images/backgrounds/limited-evacuation-convoy.png":
    ["evacuation", "convoy", "transport", "fuel", "refugees", "vehicles", "limited", "route"],
  "/images/endings/ending-balanced-future.png":
    ["balanced", "harmony", "community", "future", "recovery", "growth", "settlement"],
  "/images/endings/ending-broken-future.png":
    ["broken", "despair", "failure", "loss", "void", "hopeless", "end", "hollow"],
  "/images/endings/ending-chaotic-future.png":
    ["chaos", "fire", "burning", "conflict", "violent", "disorder", "collapse", "war"],
  "/images/endings/ending-rebuilding-future.png":
    ["rebuilding", "construction", "progress", "renewal", "effort", "rising", "scaffold", "new"],
};

function getImageKeywords(url) {
  const fileName = url.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
  const slugWords = fileName
    .replace(/^avatar-[a-z]+-/, "")
    .split("-")
    .filter(Boolean);
  return [
    ...new Set([
      ...getImageMatchAliases(url),
      ...(IMAGE_KEYWORDS[url] ?? []),
      ...slugWords,
      fileName,
    ]),
  ];
}

function scoreImagePromptMatch(prompt, url) {
  const slug = url
    .split("/")
    .pop()
    ?.replace(/\.[^.]+$/, "")
    .replace(/^avatar-[a-z]+-/, "") ?? "";
  const slugPhrase = slug.replaceAll("-", " ");
  let score = prompt.includes(slugPhrase) ? 12 : 0;

  for (const keyword of getImageKeywords(url)) {
    const normalized = keyword.toLowerCase();
    if (!normalized) continue;

    if (normalized.includes(" ")) {
      if (prompt.includes(normalized)) score += 6;
    } else if (prompt.includes(normalized)) {
      score += 1;
    }
  }

  return score;
}

// Pick the best available image given an AI-generated imagePrompt description.
// Avoids images already used in this game run; falls back gracefully if all are used.
export function pickBestImageFromPrompt(imagePrompt, usedImageUrls = [], avatarId = null) {
  const selectableImages = getSelectableScenarioImages(avatarId);
  const available = selectableImages.filter(
    (url) => !usedImageUrls.includes(url),
  );
  // If every image has been used, allow repeats.
  const pool = available.length > 0 ? available : selectableImages;

  if (!imagePrompt || typeof imagePrompt !== "string") {
    return pool[0];
  }

  const prompt = imagePrompt.toLowerCase();
  let bestUrl = pool[0];
  let bestScore = -1;

  for (const url of pool) {
    const score = scoreImagePromptMatch(prompt, url);
    if (score > bestScore) {
      bestScore = score;
      bestUrl = url;
    }
  }

  return bestUrl;
}

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

function pickSceneFrame(avatar, stats, recentChoices) {
  const historySignal = Array.isArray(recentChoices)
    ? recentChoices.reduce(
        (total, choice) =>
          total +
          String(choice?.scenarioTitle ?? "").length +
          String(choice?.choiceText ?? choice?.text ?? "").length,
        0,
      )
    : 0;
  const statSignal =
    stats.hope * 3 + stats.trust * 5 + stats.chaos * 7 + stats.humanity * 11;
  const avatarSignal = String(avatar?.id ?? "").length * 13;
  const signal = statSignal + avatarSignal + historySignal;
  const avatarFrame = pickAvatarSceneFrame(avatar?.id, signal);
  if (avatarFrame) return avatarFrame;

  const index = Math.abs(signal) % SCENE_FRAMES.length;

  return SCENE_FRAMES[index];
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
  const sceneFrame = pickSceneFrame(avatar, stats, recentChoices);
  const writingGuide = formatAvatarWritingGuide(avatar.id);
  const avatarSceneLabels = getAvatarSceneLabels(avatar.id).join(", ");
  return `Generate ONE gameplay scenario for Ashes Between Us. Return JSON only.

Avatar: ${avatar.id} / ${avatar.name} / ${avatar.trait}
Personality: ${personality}
Description: ${avatar.description}
Backstory: ${avatar.backstory}
Stats: hope=${stats.hope}, trust=${stats.trust}, chaos=${stats.chaos}, humanity=${stats.humanity}
Required scene frame: ${sceneFrame}
Available avatar image scene labels: ${avatarSceneLabels}

Avatar writing guide:
${writingGuide}

Recent run history:
${recentHistory}

Rules:
- Post-apocalyptic, cinematic, emotional, morally complicated.
- Be concise: title <= 8 words, setting <= 55 words, message <= 45 words, futureSelfMessage <= 35 words, choice text <= 16 words, outcome <= 28 words.
- Return exactly 6 choices, one for each lane below. Do not merge lanes or omit any lane.
- Choice lanes:
${CHOICE_LANES.map((lane) => `  ${lane}`).join("\n")}
- Choices must connect directly to this scenario and have integer stat deltas -20..20.
- Make the premise materially different from recent history. Avoid another generic crossroads, checkpoint, radio warning, or same dilemma in a new backdrop unless prior context specifically demands it.
- Match the authored seed-pack style: specific factions, concrete objects, visible public pressure, and morally mixed consequences.
- The premise, verbs, objects, and choices must feel native to this avatar. A player should know they are playing ${avatar.name} without reading the avatar name.
- Future self sounds like ${avatar.name} after living through consequences.
- If previous context exists, next scenario must be caused by it.
- imagePrompt: 1-2 sentence scene description. Include the exact best matching avatar image scene label when one fits, plus concrete nouns from the setting. Prefer these avatar labels before generic backgrounds: ${avatarSceneLabels}.

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
    choiceCount === REQUIRED_CHOICE_COUNT &&
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

export function normalizeGeneratedScenario(rawScenario, usedImageUrls = [], avatarId = null) {
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

  const imageUrl = pickBestImageFromPrompt(
    rawScenario.imagePrompt,
    usedImageUrls,
    avatarId,
  );
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
