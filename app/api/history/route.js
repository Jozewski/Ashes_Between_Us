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

export async function GET() {
  return NextResponse.json(
    { error: "Backend not connected yet." },
    { status: 501 }
  );
}
