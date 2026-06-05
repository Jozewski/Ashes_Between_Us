import { NextResponse } from "next/server";
import { generateScenario } from "@/lib/scenarioGenerationService";

export const runtime = "nodejs";
export const maxDuration = 30;

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

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 },
    );
  }

  if (!body.avatarId || !body.currentStats) {
    return NextResponse.json(
      { error: "Missing required fields: avatarId, currentStats." },
      { status: 400 },
    );
  }

  console.log("[generate-scenario] request payload", {
    avatarId: body.avatarId,
    runId: typeof body.runId === "string" ? body.runId : null,
    hasCurrentStats: Boolean(body.currentStats),
    recentChoiceCount: Array.isArray(body.recentChoices)
      ? body.recentChoices.length
      : 0,
  });

  try {
    const scenario = await generateScenario({
      avatarId: body.avatarId,
      currentStats: body.currentStats,
      recentChoices: Array.isArray(body.recentChoices)
        ? body.recentChoices
        : [],
      runId: typeof body.runId === "string" ? body.runId : null,
    });

    return NextResponse.json(scenario, { status: 201 });
  } catch (error) {
    const message = error?.message ?? "Failed to generate scenario.";
    const status = message.startsWith("No seeded scenarios found") ? 500 : 502;
    console.error("[generate-scenario] route failure", {
      message,
      avatarId: body.avatarId,
      runId: typeof body.runId === "string" ? body.runId : null,
    });
    return NextResponse.json({ error: message }, { status });
  }
}
