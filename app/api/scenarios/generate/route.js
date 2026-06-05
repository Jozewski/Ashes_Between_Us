import { NextResponse } from "next/server";
import { generateScenario } from "@/lib/scenarioGenerationService";

export const runtime = "nodejs";
export const maxDuration = 30;

function getStats(body) {
  return body?.stats ?? body?.currentStats ?? null;
}

function getChoiceHistory(body) {
  if (Array.isArray(body?.choiceHistory)) return body.choiceHistory;
  if (Array.isArray(body?.recentChoices)) return body.recentChoices;
  return [];
}

export async function POST(req) {
  let body;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 },
    );
  }

  const stats = getStats(body);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 },
    );
  }

  if (!body.avatarId || !stats) {
    return NextResponse.json(
      { error: "Missing required fields: avatarId, stats." },
      { status: 400 },
    );
  }

  console.log("[scenarios/generate] request payload", {
    avatarId: body.avatarId,
    runId: typeof body.runId === "string" ? body.runId : null,
    hasStats: Boolean(stats),
    recentChoiceCount: getChoiceHistory(body).length,
  });

  try {
    const scenario = await generateScenario({
      avatarId: body.avatarId,
      currentStats: stats,
      recentChoices: getChoiceHistory(body),
      runId: typeof body.runId === "string" ? body.runId : null,
    });

    return NextResponse.json(scenario, { status: 201 });
  } catch (error) {
    const message = error?.message ?? "Failed to generate scenario.";
    const status = message.startsWith("No seeded scenarios found") ? 500 : 502;
    console.error("[scenarios/generate] route failure", {
      message,
      avatarId: body.avatarId,
      runId: typeof body.runId === "string" ? body.runId : null,
    });
    return NextResponse.json({ error: message }, { status });
  }
}
