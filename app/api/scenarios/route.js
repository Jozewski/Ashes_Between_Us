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

export async function GET() {
  return NextResponse.json(
    { error: "Backend not connected yet — frontend is using mock data." },
    { status: 501 }
  );
}
