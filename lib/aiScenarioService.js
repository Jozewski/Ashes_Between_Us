import { getOpenAIClient, OPENAI_SCENARIO_MODEL } from "./openaiClient.js";
import {
  buildOpenAIPrompt,
  normalizeGeneratedScenario,
  parseOpenAIJson,
  pickBestImageFromPrompt,
} from "./futureSelfService.js";

const DEFAULT_SCENARIO_TIMEOUT_MS = 20000;

const SCENARIO_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "setting",
    "message",
    "futureSelfMessage",
    "imagePrompt",
    "choices",
  ],
  properties: {
    title: { type: "string" },
    setting: { type: "string" },
    message: { type: "string" },
    futureSelfMessage: { type: "string" },
    imagePrompt: { type: "string" },
    choices: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "text",
          "outcome",
          "hopeChange",
          "trustChange",
          "chaosChange",
          "humanityChange",
        ],
        properties: {
          text: { type: "string" },
          outcome: { type: "string" },
          hopeChange: { type: "integer", minimum: -20, maximum: 20 },
          trustChange: { type: "integer", minimum: -20, maximum: 20 },
          chaosChange: { type: "integer", minimum: -20, maximum: 20 },
          humanityChange: { type: "integer", minimum: -20, maximum: 20 },
        },
      },
    },
  },
};

function getScenarioTimeoutMs(timeoutMs) {
  const value = Number(timeoutMs ?? process.env.OPENAI_SCENARIO_TIMEOUT_MS);
  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_SCENARIO_TIMEOUT_MS;
  }

  return Math.max(1000, Math.min(60000, Math.floor(value)));
}

function readStructuredJson(response) {
  const jsonContent =
    response?.output
      ?.flatMap((item) => item.content ?? [])
      ?.find((content) => typeof content?.json === "object" && content.json !== null)
      ?.json ?? null;

  return jsonContent;
}

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
  previousScenario,
  selectedChoice,
  outcome,
  timeoutMs,
  usedImageUrls = [],
}) {
  const client = getOpenAIClient();
  const prompt = buildOpenAIPrompt(avatar, currentStats, recentChoices, {
    previousScenario,
    selectedChoice,
    outcome,
  });
  const requestTimeoutMs = getScenarioTimeoutMs(timeoutMs);
  const selectedModel = process.env.OPENAI_SCENARIO_MODEL || OPENAI_SCENARIO_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, requestTimeoutMs);

  console.log("[aiScenario] OpenAI request start", {
    model: selectedModel,
    avatarId: avatar?.id,
    promptLength: prompt.length,
    recentChoiceCount: Array.isArray(recentChoices) ? recentChoices.length : 0,
    timeoutMs: requestTimeoutMs,
  });
  const startedAt = Date.now();
  console.time("openai-scenario-call");

  let response;

  try {
    response = await client.responses.create(
      {
        model: selectedModel,
        input: prompt,
        instructions:
          "You are the backend narrative engine for Ashes Between Us. Return JSON only and obey the provided schema exactly.",
        max_output_tokens: 450,
        text: {
          format: {
            type: "json_schema",
            name: "ashes_between_us_scenario",
            strict: true,
            schema: SCENARIO_RESPONSE_SCHEMA,
          },
        },
      },
      {
        signal: controller.signal,
        timeout: requestTimeoutMs,
      },
    );
  } catch (error) {
    if (controller.signal.aborted) {
      console.timeEnd("openai-scenario-call");
      console.error("[aiScenario] OpenAI timeout", {
        model: selectedModel,
        elapsedMs: Date.now() - startedAt,
        timeoutMs: requestTimeoutMs,
      });
      throw new Error(`OpenAI scenario request timed out after ${requestTimeoutMs}ms`, {
        cause: error,
      });
    }

    console.timeEnd("openai-scenario-call");
    console.error("[aiScenario] OpenAI request failed", {
      model: selectedModel,
      elapsedMs: Date.now() - startedAt,
      error: error?.message ?? error,
    });
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  console.timeEnd("openai-scenario-call");
  console.log("[aiScenario] OpenAI elapsed", {
    model: selectedModel,
    elapsedMs: Date.now() - startedAt,
  });

  const rawText = readResponseText(response);
  console.log("[aiScenario] Raw OpenAI response before parse", {
    outputText: rawText,
    output: response?.output ?? null,
  });

  const structured = readStructuredJson(response);
  if (structured) {
    console.log("[aiScenario] OpenAI request success", {
      source: "structured_json",
    });
    return normalizeGeneratedScenario(structured, usedImageUrls);
  }

  const parsed = parseOpenAIJson(rawText);

  console.log("[aiScenario] OpenAI request success", {
    source: "output_text",
  });

  return normalizeGeneratedScenario(parsed, usedImageUrls);
}
