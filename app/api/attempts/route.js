// app/api/attempts/route.js
// ── STUB ──────────────────────────────────────────────────────────────────────
// Person 2 replaces this with the real implementation. Expected shape:
//
//   POST body: { scenarioId, choiceId, outcome, hope, trust, chaos, humanity }
//   Response:  { id, ...saved attempt }
//
// Real implementation:
//
//   import { prisma } from "@/lib/prisma";
//   import { NextResponse } from "next/server";
//
//   export async function POST(req) {
//     const body = await req.json();
//     const attempt = await prisma.attempt.create({ data: body });
//     return NextResponse.json(attempt, { status: 201 });
//   }
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import {
  saveAttempt,
  getAttemptHistory,
} from "@/lib/scenarioGenerationService";

export const runtime = "nodejs";

export async function GET() {
  try {
    const attempts = await getAttemptHistory();
    return NextResponse.json(attempts);
  } catch (error) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to fetch attempts." },
      { status: 500 },
    );
  }
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

  console.log("[attempts] request payload", {
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
    return NextResponse.json(
      { error: error?.message ?? "Failed to save attempt." },
      { status: 500 },
    );
  }
}
