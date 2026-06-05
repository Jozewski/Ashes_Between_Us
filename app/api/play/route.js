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

  const attempt = await saveAttempt(body);
  return NextResponse.json(attempt, { status: 201 });
}
