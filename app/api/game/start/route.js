import { NextResponse } from "next/server";
import { startGame } from "@/lib/gameEngine";

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

  if (!body || typeof body !== "object" || !body.avatarId) {
    return NextResponse.json(
      { error: "Missing required field: avatarId." },
      { status: 400 },
    );
  }

  console.log("[api/game/start] called", {
    avatarId: body.avatarId,
    hasUsername: typeof body.username === "string" && body.username.trim().length > 0,
  });

  try {
    const result = await startGame({
      avatarId: body.avatarId,
      username: typeof body.username === "string" ? body.username : "",
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[api/game/start] failed", {
      avatarId: body.avatarId,
      error: error?.message ?? error,
    });
    return NextResponse.json(
      { error: error?.message ?? "Failed to start game." },
      { status: 500 },
    );
  }
}
