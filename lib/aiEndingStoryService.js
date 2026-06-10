import { AVATARS } from "./mockData.js";
import { getAvatars } from "./scenarioGenerationService.js";
import { getOpenAIClient, OPENAI_SCENARIO_MODEL } from "./openaiClient.js";
import {
  analyzeStatProfile,
  calculateEndingScore,
  deriveEndingState,
  generateEndingNarrative,
} from "./endingEngine.js";

const ENDING_STORY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "futureSignalReading", "closingLine"],
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    futureSignalReading: { type: "string" },
    closingLine: { type: "string" },
  },
};

function readResponseText(response) {
  if (typeof response?.output_text === "string") {
    return response.output_text;
  }

  const textParts =
    response?.output
      ?.flatMap((item) => item.content ?? [])
      ?.filter((content) => content.type === "output_text")
      ?.map((content) => content.text) ?? [];

  return textParts.join("\n");
}

function parseOpenAIJson(rawText) {
  if (typeof rawText !== "string") {
    throw new Error("OpenAI response is not a string.");
  }

  try {
    return JSON.parse(rawText);
  } catch (firstError) {
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");

    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(rawText.slice(start, end + 1));
    }

    throw new Error("AI returned invalid ending JSON", { cause: firstError });
  }
}

function normalizeStats(stats) {
  return {
    hope: Number(stats?.hope ?? 0),
    trust: Number(stats?.trust ?? 0),
    chaos: Number(stats?.chaos ?? 0),
    humanity: Number(stats?.humanity ?? 0),
  };
}

function formatChoiceHistory(attempts) {
  if (!Array.isArray(attempts) || attempts.length === 0) {
    return "No recorded choices.";
  }

  return attempts
    .slice()
    .reverse()
    .slice(0, 10)
    .map((attempt, index) => {
      const stats = attempt?.statsAfter ?? {
        hope: attempt?.hope,
        trust: attempt?.trust,
        chaos: attempt?.chaos,
        humanity: attempt?.humanity,
      };

      return `${index + 1}. ${attempt?.scenarioTitle ?? "Unknown scenario"}
Setting: ${attempt?.scenarioSetting ?? "Unknown setting"}
Future transmission: ${attempt?.scenarioFutureMsg ?? "Unknown transmission"}
Choice made: ${attempt?.choiceText ?? "Unknown choice"}
Immediate consequence: ${attempt?.outcome ?? "Unknown outcome"}
Stats after choice: hope=${stats.hope ?? "?"}, trust=${stats.trust ?? "?"}, chaos=${stats.chaos ?? "?"}, humanity=${stats.humanity ?? "?"}`;
    })
    .join("\n\n");
}

function normalizeEndingStory(rawStory) {
  if (!rawStory || typeof rawStory !== "object") {
    throw new Error("Generated ending story is invalid.");
  }

  const title = String(rawStory.title ?? "").trim();
  const summary = String(rawStory.summary ?? "").trim();
  const futureSignalReading = String(rawStory.futureSignalReading ?? "").trim();
  const closingLine = String(rawStory.closingLine ?? "").trim();

  if (!title || !summary || !futureSignalReading || !closingLine) {
    throw new Error("Generated ending story does not match required shape.");
  }

  return {
    title,
    summary,
    futureSignalReading,
    closingLine,
  };
}

export function buildEndingStoryPrompt({
  avatar,
  stats,
  attempts,
  username,
  endingState,
  endingScore,
  localEnding,
}) {
  const safeStats = normalizeStats(stats);
  const statProfile = analyzeStatProfile(safeStats);
  const safeUsername = username?.trim() ? username.trim() : "Traveler";

  return `You are the final narrative engine for Ashes Between Us, a choice-driven post-collapse RPG. Return JSON only.

Write a contextually rich final story summary explaining why the rendered ending outcome happened.

Player:
- username: ${safeUsername}
- avatar id: ${avatar.id}
- avatar name: ${avatar.name}
- avatar trait: ${avatar.trait}
- avatar description: ${avatar.description}
- avatar backstory: ${avatar.backstory}

Final result guardrails:
- ending state: ${endingState}
- ending score: ${endingScore}
- local ending title: ${localEnding?.title ?? "Unknown"}
- local ending narrative: ${localEnding?.narrative ?? "Unknown"}
- final stats: hope=${safeStats.hope}, trust=${safeStats.trust}, chaos=${safeStats.chaos}, humanity=${safeStats.humanity}
- stat profile: hope=${statProfile.hope}, trust=${statProfile.trust}, chaos=${statProfile.chaos}, humanity=${statProfile.humanity}

Complete timeline:
${formatChoiceHistory(attempts)}

Narrative requirements:
- Use the player's username, "${safeUsername}", naturally at least once in the summary unless it is "Traveler".
- Explain why the final ending state and score make sense from the player's specific choices.
- Be avatar-specific. A Scout ending should care about routes and observation; a Medic about triage and care; an Engineer about systems; a Guardian about protection and boundaries; a Diplomat about trust and language; a Scavenger about salvage, scarcity, and what was worth keeping.
- Track the player's relationship to future transmissions. Decide from the evidence whether they listened, misunderstood, selectively interpreted, exploited, feared, or disregarded the future self.
- Do not scold the player. Interpret their pattern with moral weight and specificity.
- Reference at least three concrete scenario moments or choices from the timeline.
- Avoid vague phrases such as "your choices mattered", "the future remembers", "every decision had consequences", unless tied to a concrete event.
- Tone: polished, literary survival fiction; grounded, not purple; no meta commentary about game mechanics.
- The summary should be 4 substantial paragraphs, roughly 430 to 620 words total.
- The first paragraph should name the final condition of the community and tie it directly to the ending state and score.
- The middle paragraphs should trace cause and effect through concrete choices, including at least one early choice and one late choice.
- The final paragraph should explain what kind of person this avatar became by the end of the run.
- futureSignalReading should be 1 substantial paragraph, roughly 90 to 150 words, explaining how the player treated the future transmissions across the run.
- closingLine should be one memorable sentence.

Required JSON object shape:
{
  "title": "",
  "summary": "",
  "futureSignalReading": "",
  "closingLine": ""
}`;
}

export function buildFallbackEndingStory({
  avatar,
  stats,
  attempts,
  username,
  endingState,
  endingScore,
}) {
  const localEnding = generateEndingNarrative(stats, avatar.id);
  const safeUsername = username?.trim() ? username.trim() : "Traveler";
  const chronological = Array.isArray(attempts) ? attempts.slice().reverse() : [];
  const first = chronological[0];
  const last = chronological[chronological.length - 1];
  const futureMessages = chronological.filter((attempt) => attempt?.scenarioFutureMsg).length;

  return {
    title: localEnding.title,
    summary:
      `${safeUsername}'s timeline closed as ${avatar.name} with a ${endingState} outcome and score ${endingScore}. ` +
      `The path began around ${first?.scenarioTitle ?? "the first recorded crisis"} and ended near ${last?.scenarioTitle ?? "the final recorded choice"}, ` +
      `with final stats showing hope ${stats.hope}, trust ${stats.trust}, chaos ${stats.chaos}, and humanity ${stats.humanity}. ` +
      `${localEnding.narrative}`,
    futureSignalReading:
      futureMessages > 0
        ? `The archive recorded ${futureMessages} future transmissions during this run. The final pattern suggests the player used those warnings as pressure, not certainty: sometimes guidance, sometimes a warning to resist.`
        : "The archive has no future transmissions for this run, so the ending rests on choices and outcomes alone.",
    closingLine: "The future did not render a verdict; it exposed the pattern already taking shape.",
  };
}

export async function generateAIEndingStory({
  avatarId,
  stats,
  attempts,
  username,
}) {
  const avatars = await getAvatars();
  const avatar =
    avatars.find((entry) => entry.id === avatarId) ??
    avatars[0] ??
    AVATARS[0];
  const safeStats = normalizeStats(stats);
  const endingState = deriveEndingState(safeStats);
  const endingScore = calculateEndingScore(safeStats);
  const localEnding = generateEndingNarrative(safeStats, avatar.id);

  const prompt = buildEndingStoryPrompt({
    avatar,
    stats: safeStats,
    attempts,
    username,
    endingState,
    endingScore,
    localEnding,
  });

  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: OPENAI_SCENARIO_MODEL,
    input: prompt,
    instructions:
      "You are the backend ending story engine for Ashes Between Us. Return JSON only and obey the schema exactly.",
    max_output_tokens: 900,
    text: {
      format: {
        type: "json_schema",
        name: "ashes_between_us_ending_story",
        strict: true,
        schema: ENDING_STORY_SCHEMA,
      },
    },
  });

  return {
    ...normalizeEndingStory(parseOpenAIJson(readResponseText(response))),
    endingState,
    endingScore,
  };
}
