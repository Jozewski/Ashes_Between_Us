import { AVATARS } from "./mockData.js";
import { getAvatars } from "./scenarioGenerationService.js";
import { getOpenAIClient, OPENAI_SCENARIO_MODEL } from "./openaiClient.js";
import { deriveFutureStateFromStats } from "./outcomeEngine.js";

const PROFILE_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["profileTitle", "bio", "backstory", "futureNotes"],
  properties: {
    profileTitle: { type: "string" },
    bio: { type: "string" },
    backstory: { type: "string" },
    futureNotes: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" },
    },
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

    throw new Error("AI returned invalid profile JSON", { cause: firstError });
  }
}

function formatRecentChoices(recentChoices) {
  if (!Array.isArray(recentChoices) || recentChoices.length === 0) {
    return "None available.";
  }

  return recentChoices
    .slice(0, 6)
    .map((entry, index) => {
      const stats = entry?.statsAfter ?? {};
      return `${index + 1}. Scenario: ${entry?.scenarioTitle ?? "Unknown"}
Choice: ${entry?.choiceText ?? entry?.text ?? "Unknown"}
Outcome: ${entry?.outcome ?? "Unknown"}
Stats: hope=${stats.hope ?? "?"}, trust=${stats.trust ?? "?"}, chaos=${stats.chaos ?? "?"}, humanity=${stats.humanity ?? "?"}`;
    })
    .join("\n\n");
}

function buildProfilePrompt({ avatar, stats, recentChoices, username, futureState }) {
  const safeStats = {
    hope: Number(stats?.hope ?? 0),
    trust: Number(stats?.trust ?? 0),
    chaos: Number(stats?.chaos ?? 0),
    humanity: Number(stats?.humanity ?? 0),
  };

  const safeUsername = username?.trim() ? username.trim() : "Traveler";

  return `You are the narrative archivist for Ashes Between Us. Build a player's bio and backstory panel content for the timeline history screen. Return JSON only.

Player:
- username: ${safeUsername}
- avatar id: ${avatar.id}
- avatar name: ${avatar.name}
- avatar trait: ${avatar.trait}
- avatar description: ${avatar.description}
- inferred future state: ${futureState}

Current stats:
- hope: ${safeStats.hope}
- trust: ${safeStats.trust}
- chaos: ${safeStats.chaos}
- humanity: ${safeStats.humanity}

Recent timeline choices:
${formatRecentChoices(recentChoices)}

Rules:
- Return valid JSON only.
- Do not use markdown.
- Keep tone consistent with gritty post-collapse survival fiction.
- Bio should be 2 to 3 concise sentences.
- Backstory should be 3 to 5 concise sentences and reference at least one recent choice when available.
- Future notes must contain exactly 3 short bullet-style strings.
- Future notes should be tactical, emotionally grounded, and tied to current stats/future state.

Required JSON object shape:
{
  "profileTitle": "",
  "bio": "",
  "backstory": "",
  "futureNotes": ["", "", ""]
}`;
}

function normalizeGeneratedProfile(rawProfile) {
  if (!rawProfile || typeof rawProfile !== "object") {
    throw new Error("Generated profile is invalid.");
  }

  const futureNotes = Array.isArray(rawProfile.futureNotes)
    ? rawProfile.futureNotes
        .map((item) => String(item ?? "").trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

  if (
    typeof rawProfile.profileTitle !== "string" ||
    typeof rawProfile.bio !== "string" ||
    typeof rawProfile.backstory !== "string" ||
    futureNotes.length !== 3
  ) {
    throw new Error("Generated profile does not match required shape.");
  }

  return {
    profileTitle: rawProfile.profileTitle,
    bio: rawProfile.bio,
    backstory: rawProfile.backstory,
    futureNotes,
  };
}

export function buildFallbackProfile({ avatar, stats, futureState, username }) {
  const safeUsername = username?.trim() ? username.trim() : "Traveler";
  const safeStats = {
    hope: Number(stats?.hope ?? 0),
    trust: Number(stats?.trust ?? 0),
    chaos: Number(stats?.chaos ?? 0),
    humanity: Number(stats?.humanity ?? 0),
  };

  return {
    profileTitle: `${safeUsername} ∷ ${avatar.name}`,
    bio: `${avatar.name} moves through the collapse with a ${avatar.trait.toLowerCase()} edge. Their decisions now bend toward a ${futureState} timeline where every resource and relationship has a cost.`,
    backstory: `${safeUsername} started this run as ${avatar.name}, carrying ${avatar.description.toLowerCase()} Current pressure points show hope ${safeStats.hope}, trust ${safeStats.trust}, chaos ${safeStats.chaos}, and humanity ${safeStats.humanity}. The timeline is no longer abstract; it is being written choice by choice.`,
    futureNotes: [
      `Protect what still raises hope without feeding chaos spikes (${safeStats.chaos}).`,
      `Use ${avatar.trait.toLowerCase()} strengths to stabilize trust (${safeStats.trust}) in the next branch.`,
      `Prioritize one action that increases humanity before the timeline locks again.`,
    ],
  };
}

export async function generateAIPlayerProfile({
  avatarId,
  stats,
  recentChoices,
  username,
}) {
  const avatars = await getAvatars();
  const avatar =
    avatars.find((entry) => entry.id === avatarId) ??
    avatars[0] ??
    AVATARS[0];
  const futureState = deriveFutureStateFromStats(stats ?? {});

  const client = getOpenAIClient();
  const prompt = buildProfilePrompt({
    avatar,
    stats,
    recentChoices,
    username,
    futureState,
  });

  const response = await client.responses.create({
    model: OPENAI_SCENARIO_MODEL,
    input: prompt,
    instructions:
      "You are the backend profile engine for Ashes Between Us. Return JSON only and obey the schema exactly.",
    max_output_tokens: 700,
    text: {
      format: {
        type: "json_schema",
        name: "ashes_between_us_profile",
        strict: true,
        schema: PROFILE_RESPONSE_SCHEMA,
      },
    },
  });

  const parsed = parseOpenAIJson(readResponseText(response));
  return {
    ...normalizeGeneratedProfile(parsed),
    futureState,
  };
}
