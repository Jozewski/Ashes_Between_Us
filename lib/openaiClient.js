import OpenAI from "openai";

export const OPENAI_SCENARIO_MODEL =
  process.env.OPENAI_SCENARIO_MODEL || "gpt-4o-mini";

let client = null;

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return client;
}
