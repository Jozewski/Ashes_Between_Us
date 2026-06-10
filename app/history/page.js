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

function FinalArchiveLoading() {
  return (
    <section className="relative min-h-[calc(100vh-96px)] overflow-hidden bg-[#080604]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-55 animate-fragment-pulse"
        style={{
          backgroundImage: "url('/images/items/timeline-fragment.png')",
        }}
      />
      <div className="absolute inset-0 bg-black/70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(78,205,196,0.22),transparent_62%)] animate-signal-pulse" />
      <div className="relative z-10 flex min-h-[calc(100vh-96px)] flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 font-mono text-[10px] tracking-[0.34em] text-[#4ECDC4] uppercase">
          Timeline fragment active
        </p>
        <h1 className="font-display leading-none tracking-wide text-[#F0EAD6]"
          style={{ fontSize: "clamp(34px, 7vw, 72px)" }}>
          Rendering final archive
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-[#B8AC8D]">
          Your future self is reconstructing the story from the choices,
          transmissions, and consequences recorded in this timeline.
        </p>
        <div className="mt-8 flex gap-2">
          {[0, 1, 2].map((item) => (
            <span
              key={item}
              className="h-2 w-2 rounded-full bg-[#4ECDC4] animate-pulse"
              style={{ animationDelay: `${item * 180}ms` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const { playMusic } = useMusic();
  const [attempts, setAttempts] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [source, setSource] = useState("api");
  const [loading, setLoading] = useState(true);
  const [playerProfile, setPlayerProfile] = useState(null);
  const [endingStory, setEndingStory] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [endingStoryLoading, setEndingStoryLoading] = useState(false);
  const [profileSettled, setProfileSettled] = useState(false);
  const [endingStorySettled, setEndingStorySettled] = useState(false);
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
      setProfileLoading(false);
      setProfileSettled(true);
      return;
    }

    async function loadProfile() {
      setProfileLoading(true);
      setProfileSettled(false);
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
      } finally {
        setProfileLoading(false);
        setProfileSettled(true);
      }
    }

    loadProfile();
  }, [attempts]);

  useEffect(() => {
    const latestAttempt = getLatestAttempt(attempts);
    if (!latestAttempt?.avatarId) {
      setEndingStory(null);
      setEndingStoryLoading(false);
      setEndingStorySettled(true);
      return;
    }

    async function loadEndingStory() {
      setEndingStoryLoading(true);
      setEndingStorySettled(false);
      const username =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem(SESSION_USERNAME_KEY) ?? ""
          : "";

      try {
        const res = await fetch("/api/ending-story", {
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
            attempts,
          }),
        });

        if (!res.ok) throw new Error("Ending story API unavailable");
        const data = await res.json();
        setEndingStory(data);
      } catch {
        setEndingStory(null);
      } finally {
        setEndingStoryLoading(false);
        setEndingStorySettled(true);
      }
    }

    loadEndingStory();
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
  const finalArchiveLoading =
    Boolean(latestAttempt) &&
    (profileLoading ||
      endingStoryLoading ||
      !profileSettled ||
      !endingStorySettled);

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

      {finalArchiveLoading ? (
        <FinalArchiveLoading />
      ) : (
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
            endingStory={endingStory}
            endingState={endingState}
            endingScore={endingScore}
            finalStats={finalStats}
            futureImageUrl={futureImageUrl}
            onNewGame={() => handleNewGame(router)}
          />
        </div>
      )}
    </div>
  );
}
