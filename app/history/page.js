// app/history/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FinalResultsPanel from "@/components/final-results/FinalResultsPanel";
import MuteButton from "@/components/MuteButton";
import { useMusic } from "@/components/MusicProvider";
import { deriveFutureStateFromStats } from "@/lib/outcomeEngine";
import {
  calculateEndingScore,
  deriveEndingState,
  generateEndingNarrative,
} from "@/lib/endingEngine";
import { trackKeyForEnding } from "@/lib/endingAudioMap";

const LOCAL_AVATAR_KEY = "abu_avatar_v1";
const SESSION_USERNAME_KEY = "abu_username_v1";
const SESSION_RUN_ID_KEY = "abu_run_id_v1";

function getLatestAttempt(attempts) {
  return Array.isArray(attempts) && attempts.length > 0 ? attempts[0] : null;
}

function handleNewGame(router) {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(LOCAL_AVATAR_KEY);
    window.sessionStorage.removeItem(SESSION_RUN_ID_KEY);
    window.sessionStorage.removeItem(SESSION_USERNAME_KEY);
  }

  router.push("/");
}

export default function HistoryPage() {
  const router = useRouter();
  const { playMusic } = useMusic();
  const [attempts, setAttempts] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [source, setSource] = useState("api");
  const [loading, setLoading] = useState(true);
  const [playerProfile, setPlayerProfile] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadAvatars() {
      try {
        const res = await fetch("/api/avatars");
        if (!res.ok) return;
        const data = await res.json();
        setAvatars(Array.isArray(data) ? data : []);
      } catch {
        setAvatars([]);
      }
    }

    loadAvatars();
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const runId =
          typeof window !== "undefined"
            ? window.sessionStorage.getItem(SESSION_RUN_ID_KEY)
            : null;
        const url = runId
          ? `/api/history?runId=${encodeURIComponent(runId)}`
          : "/api/history";
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load timeline history");
        const data = await res.json();
        setAttempts(Array.isArray(data) ? data : []);
        setSource("api");
        setLoadError("");
      } catch (error) {
        setAttempts([]);
        setSource("none");
        setLoadError(error?.message ?? "Timeline history is unavailable.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    const latestAttempt = getLatestAttempt(attempts);
    if (!latestAttempt?.avatarId) {
      setPlayerProfile(null);
      return;
    }

    async function loadProfile() {
      const username =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem(SESSION_USERNAME_KEY) ?? ""
          : "";

      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            avatarId: latestAttempt.avatarId,
            stats: {
              hope: latestAttempt.hope,
              trust: latestAttempt.trust,
              chaos: latestAttempt.chaos,
              humanity: latestAttempt.humanity,
            },
            username,
            recentChoices: attempts.slice(0, 6),
          }),
        });

        if (!res.ok) throw new Error("Profile API unavailable");
        const data = await res.json();
        setPlayerProfile(data);
      } catch {
        setPlayerProfile(null);
      }
    }

    loadProfile();
  }, [attempts]);

  const latestAttempt = getLatestAttempt(attempts);
  const latestAvatar =
    avatars.find((avatar) => avatar.id === latestAttempt?.avatarId) ?? null;

  const finalStatValues = latestAttempt
    ? {
        hope: latestAttempt.hope,
        trust: latestAttempt.trust,
        chaos: latestAttempt.chaos,
        humanity: latestAttempt.humanity,
      }
    : null;

  const endingNarrative =
    latestAttempt && latestAvatar
      ? generateEndingNarrative(finalStatValues, latestAttempt.avatarId)
      : null;
  const endingState = finalStatValues
    ? deriveEndingState(finalStatValues)
    : deriveFutureStateFromStats(latestAttempt ?? {});
  const endingScore = finalStatValues
    ? calculateEndingScore(finalStatValues)
    : null;
  const futureImageUrl =
    latestAvatar?.futureImageByState?.[endingState] ??
    latestAvatar?.futureImageUrl ??
    null;
  const endingTrackKey = finalStatValues ? trackKeyForEnding(endingState) : null;

  useEffect(() => {
    if (!endingTrackKey) return;
    playMusic(endingTrackKey);
  }, [endingTrackKey, playMusic]);

  const finalStats = latestAttempt
    ? [
        { label: "Hope", value: latestAttempt.hope, color: "#F7C948" },
        { label: "Trust", value: latestAttempt.trust, color: "#4ECDC4" },
        { label: "Chaos", value: latestAttempt.chaos, color: "#8B1A1A" },
        { label: "Humanity", value: latestAttempt.humanity, color: "#A8C4A2" },
      ]
    : null;

  return (
    <div
      className="min-h-screen bg-[#1A1814]"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(139,26,26,0.15) 0%, transparent 55%), #1A1814",
      }}
    >
      <header
        className="py-4"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          paddingLeft: "clamp(18px, 5vw, 96px)",
          paddingRight: "clamp(18px, 5vw, 96px)",
        }}
      >
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="font-display text-lg tracking-[0.1em] text-[#4ECDC4]"
          >
            ASHES BETWEEN US
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <MuteButton />
            <Link
              href="/game"
              className="font-mono text-[9px] tracking-[0.25em] text-[#6B6558] uppercase transition-colors hover:text-[#4ECDC4]"
            >
              Continue timeline
            </Link>
            <button
              type="button"
              onClick={() => handleNewGame(router)}
              className="bg-[#4ECDC4] px-4 py-2 font-mono text-[9px] tracking-[0.25em] text-[#1A1814] uppercase transition-colors hover:bg-[#F7C948]"
            >
              New game
            </button>
          </div>
        </div>
      </header>

      <div
        className="mx-auto w-full max-w-[1500px] py-6 sm:py-10"
        style={{
          paddingLeft: "clamp(18px, 5vw, 96px)",
          paddingRight: "clamp(18px, 5vw, 96px)",
          paddingBottom: "max(40px, env(safe-area-inset-bottom))",
        }}
      >
        <FinalResultsPanel
          attempts={attempts}
          loading={loading}
          source={source}
          loadError={loadError}
          playerProfile={playerProfile}
          latestAvatar={latestAvatar}
          latestAttempt={latestAttempt}
          endingNarrative={endingNarrative}
          endingState={endingState}
          endingScore={endingScore}
          finalStats={finalStats}
          futureImageUrl={futureImageUrl}
          onNewGame={() => handleNewGame(router)}
        />
      </div>
    </div>
  );
}
