import { getOpenAIClient, OPENAI_SCENARIO_MODEL } from "./openaiClient.js";
import {
  buildOpenAIPrompt,
  normalizeGeneratedScenario,
  parseOpenAIJson,
} from "./futureSelfService.js";

const SCENARIO_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "message",
    "futureSelfMessage",
    "imageUrl",
    "choices",
    "consequences",
  ],
  properties: {
    title: { type: "string" },
    message: { type: "string" },
    futureSelfMessage: { type: "string" },
    imageUrl: { type: "string" },
    choices: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text", "outcome", "statChanges"],
        properties: {
          text: { type: "string" },
          outcome: { type: "string" },
          statChanges: {
            type: "object",
            additionalProperties: false,
            required: ["hope", "trust", "chaos", "humanity"],
            properties: {
              hope: { type: "integer", minimum: -20, maximum: 20 },
              trust: { type: "integer", minimum: -20, maximum: 20 },
              chaos: { type: "integer", minimum: -20, maximum: 20 },
              humanity: { type: "integer", minimum: -20, maximum: 20 },
            },
          },
        },
      },
    },
    consequences: {
      type: "object",
      additionalProperties: false,
      required: ["summary"],
      properties: {
        summary: { type: "string" },
      },
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

export async function generateAIScenario({
  avatar,
  currentStats,
  recentChoices,
}) {
  const client = getOpenAIClient();
  const prompt = buildOpenAIPrompt(avatar, currentStats, recentChoices);

  const response = await client.responses.create({
    model: OPENAI_SCENARIO_MODEL,
    input: prompt,
    instructions:
      "You are the backend narrative engine for Ashes Between Us. Return JSON only and obey the provided schema exactly.",
    max_output_tokens: 1200,
    text: {
      format: {
        type: "json_schema",
        name: "ashes_between_us_scenario",
        strict: true,
        schema: SCENARIO_RESPONSE_SCHEMA,
      },
    },
  });

  const rawText = readResponseText(response);
  const parsed = parseOpenAIJson(rawText);

  return normalizeGeneratedScenario(parsed);
}
