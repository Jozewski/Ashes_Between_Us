import { NextResponse } from "next/server";
import { getAvatars } from "@/lib/scenarioGenerationService";

export async function GET() {
  return NextResponse.json(getAvatars());
}
