import { NextResponse } from "next/server";
import { findScenarioById } from "@/lib/scenarioGenerationService";

export const runtime = "nodejs";

export async function GET(_req, { params }) {
  const { id } = await params;
  const scenario = await findScenarioById(id);

  if (!scenario) {
    return NextResponse.json({ error: "Scenario not found." }, { status: 404 });
  }

  return NextResponse.json(scenario);
}
