import { NextResponse } from "next/server";
import { continueGame } from "@/lib/gameEngine";

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

  if (
    !body ||
    typeof body !== "object" ||
    !body.runId ||
    !body.avatarId ||
    !body.scenarioId ||
    !body.choiceId ||
    !body.currentStats
  ) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: runId, avatarId, scenarioId, choiceId, currentStats.",
      },
      { status: 400 },
    );
  }

  console.log("[api/game/choose] called", {
    runId: body.runId,
    avatarId: body.avatarId,
    scenarioId: body.scenarioId,
    choiceId: body.choiceId,
  });

  try {
    const result = await continueGame({
      runId: body.runId,
      avatarId: body.avatarId,
      scenarioId: body.scenarioId,
      choiceId: body.choiceId,
      currentStats: body.currentStats,
      username: typeof body.username === "string" ? body.username : "",
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[api/game/choose] failed", {
      runId: body.runId,
      avatarId: body.avatarId,
      scenarioId: body.scenarioId,
      choiceId: body.choiceId,
      error: error?.message ?? error,
    });
    return NextResponse.json(
      { error: error?.message ?? "Failed to process choice." },
      { status: 500 },
    );
  }
}
