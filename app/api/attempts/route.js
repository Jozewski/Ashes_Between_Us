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

export async function POST() {
  return NextResponse.json(
    { error: "Backend not connected yet." },
    { status: 501 }
  );
}
