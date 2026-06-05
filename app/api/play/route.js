import { NextResponse } from "next/server";
import { saveAttempt } from "@/lib/scenarioGenerationService";

export const runtime = "nodejs";

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

  if (!body.avatarId || !body.scenarioId || !body.choiceId) {
    return NextResponse.json(
      { error: "Missing required fields: avatarId, scenarioId, choiceId." },
      { status: 400 },
    );
  }

  console.log("[play] request payload", {
    avatarId: body.avatarId,
    scenarioId: body.scenarioId,
    choiceId: body.choiceId,
    runId: typeof body.runId === "string" ? body.runId : null,
    hasStats:
      body.hope !== undefined &&
      body.trust !== undefined &&
      body.chaos !== undefined &&
      body.humanity !== undefined,
  });

  try {
    const attempt = await saveAttempt(body);
    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error("[play] route failure", {
      message: error?.message ?? "Failed to save attempt.",
      avatarId: body.avatarId,
      scenarioId: body.scenarioId,
      choiceId: body.choiceId,
    });
    return NextResponse.json(
      { error: error?.message ?? "Failed to save attempt." },
      { status: 500 },
    );
  }
}
