// app/history/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import TimelineHistory from "@/components/TimelineHistory";
import { AVATARS } from "@/lib/mockData";

const LOCAL_ATTEMPTS_KEY = "abu_local_attempts_v1";

const OUTCOME_IMAGE_BY_STATE = {
  rebuilding: "/images/outcomes/ending-rebuilding-future.png",
  balanced: "/images/outcomes/ending-balanced-future.png",
  chaotic: "/images/outcomes/ending-chaotic-future.png",
  broken: "/images/outcomes/ending-broken-future.png",
};

function readLocalAttempts() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_ATTEMPTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getLatestAttempt(attempts) {
  return Array.isArray(attempts) && attempts.length > 0 ? attempts[0] : null;
}

function getAvatarById(avatarId) {
  return AVATARS.find((avatar) => avatar.id === avatarId) ?? null;
}

function getOutcomeImage(attempt) {
  if (!attempt) return OUTCOME_IMAGE_BY_STATE.balanced;

  if ((attempt.chaos ?? 0) >= 60) return OUTCOME_IMAGE_BY_STATE.chaotic;
  if ((attempt.hope ?? 0) >= 70 && (attempt.humanity ?? 0) >= 70) return OUTCOME_IMAGE_BY_STATE.rebuilding;
  if ((attempt.hope ?? 0) < 40 || (attempt.humanity ?? 0) < 40) return OUTCOME_IMAGE_BY_STATE.broken;
  return OUTCOME_IMAGE_BY_STATE.balanced;
}

export default function HistoryPage() {
  const [attempts, setAttempts] = useState([]);
  const [source, setSource] = useState("api");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/history");
        if (!res.ok) throw new Error("API not ready");
        const data = await res.json();
        setAttempts(Array.isArray(data) ? data : []);
        setSource("api");
      } catch {
        const localAttempts = readLocalAttempts();
        setAttempts(localAttempts);
        setSource(localAttempts.length > 0 ? "local" : "none");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const latestAttempt = getLatestAttempt(attempts);
  const latestAvatar = getAvatarById(latestAttempt?.avatarId);
  const outcomeImage = getOutcomeImage(latestAttempt);

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
          <aside className="flex flex-col gap-4 h-full">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6558] uppercase mb-2">
                Backstory archive
              </p>
              <h1
                className="font-display tracking-wide text-[#F0EAD6] mb-4"
                style={{ fontSize: "clamp(30px, 4vw, 44px)" }}
              >
                WHY YOU WERE HERE
              </h1>
            </div>

            <div className="p-4 border border-white/10 bg-white/3">
              <p className="font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase mb-2">
                Placeholder section
              </p>
              <p className="text-sm text-[#6B6558] leading-relaxed">
                This panel can later hold the avatar bio, the player’s background choices, faction alignment, or a run summary.
              </p>
            </div>

            <div className="p-4 border border-white/10 bg-white/3">
              <p className="font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase mb-2">
                Future notes
              </p>
              <ul className="space-y-2 text-sm text-[#6B6558] leading-relaxed list-disc pl-4">
                <li>Character backstory and role selection notes</li>
                <li>Faction relationships or origin details</li>
                <li>Session goals, warnings, or narrative flags</li>
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

            {!loading && source === "local" && (
              <p className="font-mono text-[9px] tracking-[0.2em] text-[#6B6558] uppercase mb-4">
                Showing locally saved timeline records
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

          <aside className="flex flex-col gap-4 h-full">
            <div className="p-4 border border-white/10 bg-white/3 flex-1 flex flex-col justify-between">
              <p className="font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase mb-2">
                Future self
              </p>
              {latestAvatar ? (
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 shrink-0 overflow-hidden border border-white/10">
                    <Image
                      src={latestAvatar.futureImageUrl}
                      alt={latestAvatar.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-display text-[#F0EAD6] tracking-wide">
                      {latestAvatar.name}
                    </p>
                    <p className="font-mono text-[9px] tracking-[0.2em] text-[#6B6558] uppercase">
                      {latestAvatar.trait}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#6B6558] leading-relaxed">
                  Select an avatar and play a few scenarios to populate this panel.
                </p>
              )}
            </div>

            <div className="p-4 border border-white/10 bg-white/3 flex-1 flex flex-col">
              <p className="font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase mb-2">
                Result image
              </p>
              <div className="relative w-full aspect-[4/3] overflow-hidden border border-white/10 mb-3">
                <Image
                  src={outcomeImage}
                  alt="Timeline outcome"
                  fill
                  sizes="(max-width: 1280px) 100vw, 360px"
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-[#6B6558] leading-relaxed">
                This area can show the current outcome art for the selected timeline branch, ending state, or future-self result.
              </p>
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
