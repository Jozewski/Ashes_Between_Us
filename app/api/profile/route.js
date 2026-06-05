import { NextResponse } from "next/server";
import { generateAIPlayerProfile } from "@/lib/aiProfileService";
import { AVATARS } from "@/lib/mockData";

export const runtime = "nodejs";

function normalizeStats(stats) {
  return {
    hope: Number(stats?.hope ?? 0),
    trust: Number(stats?.trust ?? 0),
    chaos: Number(stats?.chaos ?? 0),
    humanity: Number(stats?.humanity ?? 0),
  };
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

  const avatarId = body.avatarId;
  const stats = normalizeStats(body.stats);
  const recentChoices = Array.isArray(body.recentChoices) ? body.recentChoices : [];
  const username = typeof body.username === "string" ? body.username : "";

  if (!avatarId || !AVATARS.some((avatar) => avatar.id === avatarId)) {
    return NextResponse.json(
      { error: "Missing or invalid avatarId." },
      { status: 400 },
    );
  }

  try {
    const profile = await generateAIPlayerProfile({
      avatarId,
      stats,
      recentChoices,
      username,
    });

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to generate profile." },
      { status: 502 },
    );
  }
}
