// app/api/scenarios/route.js
// ── STUB ──────────────────────────────────────────────────────────────────────
// This file is a placeholder so the frontend can compile without the backend.
// Person 2 will replace this with the real Prisma implementation on their branch.
//
// When backend is ready, replace this entire file with:
//
//   import { prisma } from "@/lib/prisma";
//   import { NextResponse } from "next/server";
//
//   export async function GET() {
//     const scenarios = await prisma.scenario.findMany({
//       include: { choices: true },
//       orderBy: { createdAt: "asc" },
//     });
//     return NextResponse.json(scenarios);
//   }
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAllScenarios } from "@/lib/scenarioGenerationService";

export const runtime = "nodejs";

export async function GET() {
  try {
    const scenarios = await getAllScenarios();
    return NextResponse.json(scenarios);
  } catch (error) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to fetch scenarios." },
      { status: 500 },
    );
  }
}
