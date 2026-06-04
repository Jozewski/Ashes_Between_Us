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

export async function GET() {
  return NextResponse.json(getAttemptHistory());
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

  const attempt = await saveAttempt(body);
  return NextResponse.json(attempt, { status: 201 });
}
