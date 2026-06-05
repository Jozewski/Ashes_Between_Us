// app/history/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import TimelineHistory from "@/components/TimelineHistory";
import { deriveFutureStateFromStats } from "@/lib/outcomeEngine";
import {
  generateEndingNarrative,
  deriveEndingState,
  calculateEndingScore,
} from "@/lib/endingEngine";

const SESSION_USERNAME_KEY = "abu_username_v1";
const SESSION_RUN_ID_KEY = "abu_run_id_v1";

function getLatestAttempt(attempts) {
  return Array.isArray(attempts) && attempts.length > 0 ? attempts[0] : null;
}

export default function HistoryPage() {
  const [attempts, setAttempts] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [source, setSource] = useState("api");
  const [loading, setLoading]   = useState(true);
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
  const endingScore = finalStatValues ? calculateEndingScore(finalStatValues) : null;

  const futureImageUrl =
    latestAvatar?.futureImageByState?.[endingState] ??
    latestAvatar?.futureImageUrl ??
    null;

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
      className="min-h-screen flex flex-col bg-[#1A1814]"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(139,26,26,0.15) 0%, transparent 55%), #1A1814" }}
    >
      {/* Header */}
      <header
        className="py-4"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          paddingLeft: "clamp(28px, 5vw, 96px)",
          paddingRight: "clamp(28px, 5vw, 96px)",
        }}
      >
        <div className="w-full max-w-[1500px] mx-auto flex items-center justify-between">
          <Link href="/" className="font-display text-lg tracking-[0.1em] text-[#4ECDC4]">
            ASHES BETWEEN US
          </Link>
          <Link
            href="/game"
            className="font-mono text-[9px] tracking-[0.25em] text-[#6B6558] uppercase hover:text-[#4ECDC4] transition-colors"
          >
            ← Continue timeline
          </Link>
        </div>
      </header>

      {/* Body */}
      <div
        className="flex-1 w-full max-w-[1500px] mx-auto py-10"
        style={{
          paddingLeft: "clamp(28px, 5vw, 96px)",
          paddingRight: "clamp(28px, 5vw, 96px)",
        }}
      >
        <div className="grid gap-8 lg:grid-cols-3 items-stretch">
          <aside className="flex flex-col gap-4 h-full justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6558] uppercase mb-2">
                Backstory archive
              </p>
              <h1
                className="font-display tracking-wide text-[#F0EAD6] mb-4"
                style={{ fontSize: "clamp(30px, 4vw, 44px)" }}
              >
                {playerProfile?.profileTitle ?? "WHY YOU WERE HERE"}
              </h1>
            </div>

            {latestAvatar && (
              <div className="relative w-full aspect-[3/4] overflow-hidden border border-white/10 bg-black/20">
                <Image
                  src={latestAvatar.imageUrl}
                  alt={latestAvatar.name}
                  fill
                  sizes="(max-width: 1280px) 100vw, 360px"
                  className="object-contain object-center p-2"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase">
                    {latestAvatar.trait}
                  </p>
                  <p className="font-display text-xl text-[#F0EAD6] tracking-wide leading-none">
                    {latestAvatar.name}
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 border border-white/10 bg-white/3">
              <p className="font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase mb-2">
                Bio
              </p>
              <p className="text-sm text-[#6B6558] leading-relaxed">
                {playerProfile?.bio ?? "Play through a few branches to generate a custom player bio from your timeline choices."}
              </p>
            </div>

            <div className="p-4 border border-white/10 bg-white/3">
              <p className="font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase mb-2">
                Backstory
              </p>
              <p className="text-sm text-[#6B6558] leading-relaxed">
                {playerProfile?.backstory ??
                  latestAvatar?.backstory ??
                  "Your backstory will be populated by the AI profile engine using avatar context, stat trajectory, and recent choices."}
              </p>
            </div>

            <div className="p-4 border border-white/10 bg-white/3">
              <p className="font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase mb-2">
                Future notes
              </p>
              <ul className="space-y-2 text-sm text-[#6B6558] leading-relaxed list-disc pl-4">
                {(playerProfile?.futureNotes ?? [
                  "Finish one full scenario chain to seed the profile system.",
                  "Your stat direction will shape this panel dynamically.",
                  "Future warnings become more specific with more choices.",
                ]).map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </aside>

          <section className="flex flex-col h-full">
            <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6558] uppercase mb-2">
              Timeline record
            </p>
            <h2
              className="font-display tracking-wide text-[#F0EAD6] mb-8 xl:mb-4"
              style={{ fontSize: "clamp(32px, 6vw, 48px)" }}
            >
              YOUR CHOICES
            </h2>

            {!loading && source === "none" && loadError && (
              <p className="font-mono text-[9px] tracking-[0.2em] text-[#6B6558] uppercase mb-4">
                {loadError}
              </p>
            )}

            <div className="flex-1">
              {loading ? (
                <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6558] uppercase animate-pulse">
                  Loading timeline…
                </p>
              ) : (
                <TimelineHistory attempts={attempts} />
              )}
            </div>
          </section>

          <aside className="flex flex-col gap-4 h-full justify-between">
            {endingNarrative && (
              <div className="p-4 border border-[#4ECDC4]/30 bg-[#4ECDC4]/5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl leading-none">{endingNarrative.icon}</span>
                  <div>
                    <p className="font-display text-xl text-[#F0EAD6] tracking-wide leading-none">
                      {endingNarrative.title}
                    </p>
                    <p className="font-mono text-[9px] tracking-[0.2em] text-[#6B6558] uppercase mt-1">
                      {endingState}
                      {endingScore !== null ? ` ∷ Score ${endingScore}` : ""}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[#D4C5A0] font-light leading-relaxed">
                  {endingNarrative.narrative}
                </p>
              </div>
            )}

            <div className="p-4 border border-white/10 bg-white/3">
              <p className="font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase mb-2">
                Future self
              </p>
              {latestAvatar ? (
                <div>
                  <p className="font-display text-[#F0EAD6] tracking-wide text-lg leading-none">
                    {latestAvatar.name}
                  </p>
                  <p className="font-mono text-[9px] tracking-[0.2em] text-[#6B6558] uppercase mt-1">
                    {latestAvatar.trait} ∷ {endingState}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[#6B6558] leading-relaxed">
                  Select an avatar and play a few scenarios to populate this panel.
                </p>
              )}
            </div>

            {finalStats && (
              <div className="p-4 border border-white/10 bg-white/3">
                <p className="font-mono text-[9px] tracking-[0.2em] text-[#6B6558] uppercase mb-3">
                  Final stats
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {finalStats.map(({ label, value, color }) => (
                    <div key={label}>
                      <p className="font-mono text-[8px] tracking-[0.15em] text-[#6B6558] uppercase mb-1">
                        {label}
                      </p>
                      <div
                        className="relative h-1.5 bg-[rgba(255,255,255,0.05)] mb-1"
                        style={{ borderRadius: "1px" }}
                      >
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${value}%`,
                            backgroundColor: color,
                            boxShadow: `0 0 8px ${color}`,
                          }}
                        />
                      </div>
                      <p
                        className="font-display text-lg tracking-wide"
                        style={{ color }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border border-white/10 bg-white/3 flex-1 flex flex-col">
              <p className="font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase mb-2">
                Future state
              </p>
              <div className="relative w-full flex-1 min-h-[260px] overflow-hidden border border-white/10">
                {futureImageUrl && (
                  <Image
                    src={futureImageUrl}
                    alt={`Future state: ${endingState}`}
                    fill
                    sizes="(max-width: 1280px) 100vw, 360px"
                    className="object-cover"
                  />
                )}
              </div>
            </div>

            <div className="p-4 border border-white/10 bg-white/3">
              <p className="font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase mb-2">
                Latest branch
              </p>
              {latestAttempt ? (
                <p className="text-sm text-[#D4C9A8] leading-relaxed">
                  {latestAttempt.choiceText ?? latestAttempt.outcome}
                </p>
              ) : (
                <p className="text-sm text-[#6B6558] leading-relaxed">
                  No timeline branch yet.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
