import { NextResponse } from "next/server";
import {
  buildFallbackEndingStory,
  generateAIEndingStory,
} from "@/lib/aiEndingStoryService";
import {
  calculateEndingScore,
  deriveEndingState,
} from "@/lib/endingEngine";
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
  try {
    const body = await req.json();
    const stats = normalizeStats(body?.stats);
    const avatarId = body?.avatarId;
    const attempts = Array.isArray(body?.attempts) ? body.attempts : [];
    const username = typeof body?.username === "string" ? body.username : "";

    if (!avatarId) {
      return NextResponse.json(
        { error: "avatarId is required." },
        { status: 400 },
      );
    }

    try {
      const endingStory = await generateAIEndingStory({
        avatarId,
        stats,
        attempts,
        username,
      });
      return NextResponse.json({ ...endingStory, source: "ai" }, { status: 200 });
    } catch (error) {
      const avatar =
        AVATARS.find((entry) => entry.id === avatarId) ?? AVATARS[0];
      const endingState = deriveEndingState(stats);
      const endingScore = calculateEndingScore(stats);

      return NextResponse.json(
        {
          ...buildFallbackEndingStory({
            avatar,
            stats,
            attempts,
            username,
            endingState,
            endingScore,
          }),
          endingState,
          endingScore,
          source: "fallback",
          error: error?.message ?? "AI ending story unavailable.",
        },
        { status: 200 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to generate ending story." },
      { status: 500 },
    );
  }
}
