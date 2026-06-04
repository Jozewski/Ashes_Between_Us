import { NextResponse } from "next/server";
import { generateScenario } from "@/lib/scenarioGenerationService";

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

  try {
    const scenario = await generateScenario({
      avatarId: body.avatarId,
      currentStats: body.currentStats,
      recentChoices: Array.isArray(body.recentChoices)
        ? body.recentChoices
        : [],
    });

    return NextResponse.json(scenario, { status: 201 });
  } catch (error) {
    const message = error?.message ?? "Failed to generate scenario.";
    const status = message === "OPENAI_API_KEY is missing" ? 500 : 502;
    console.error("[generate-scenario]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
