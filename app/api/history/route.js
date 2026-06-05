// app/api/history/route.js
// ── STUB ──────────────────────────────────────────────────────────────────────
// Person 2 replaces this with the real implementation.
//
//   import { prisma } from "@/lib/prisma";
//   import { NextResponse } from "next/server";
//
//   export async function GET() {
//     const attempts = await prisma.attempt.findMany({
//       orderBy: { createdAt: "desc" },
//     });
//     return NextResponse.json(attempts);
//   }
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAttemptHistory } from "@/lib/scenarioGenerationService";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    const runId = new URL(req.url).searchParams.get("runId") || undefined;
    const attempts = await getAttemptHistory(runId);
    return NextResponse.json(attempts);
  } catch (error) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to fetch timeline history." },
      { status: 500 },
    );
  }
}
