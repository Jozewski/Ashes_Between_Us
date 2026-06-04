// app/game/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import StatsPanel from "@/components/StatsPanel";
import FutureMessageCard from "@/components/FutureMessageCard";
import ScenarioCard from "@/components/ScenarioCard";
import ChoiceButton from "@/components/ChoiceButton";
import OutcomeCard from "@/components/OutcomeCard";
import { MOCK_SCENARIOS, INITIAL_STATS, AVATARS } from "@/lib/mockData";

const LOCAL_ATTEMPTS_KEY = "abu_local_attempts_v1";
const LOCAL_AVATAR_KEY = "abu_avatar_v1";
const SESSION_USERNAME_KEY = "abu_username_v1";

function didHardRefresh() {
  if (typeof window === "undefined") return false;

  const navEntries = window.performance?.getEntriesByType?.("navigation");
  if (Array.isArray(navEntries) && navEntries.length > 0) {
    return navEntries[0].type === "reload";
  }

  // Fallback for older browsers.
  return window.performance?.navigation?.type === 1;
}

function clearGameStorage() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(LOCAL_ATTEMPTS_KEY);
  window.localStorage.removeItem(LOCAL_AVATAR_KEY);
  window.sessionStorage.removeItem(SESSION_USERNAME_KEY);
}

// ─── helpers ───────────────────────────────────────────────────
function clamp(val) {
  return Math.min(100, Math.max(0, val));
}

function applyChoice(stats, choice) {
  return {
    hope:     clamp(stats.hope     + choice.hopeChange),
    trust:    clamp(stats.trust    + choice.trustChange),
    chaos:    clamp(stats.chaos    + choice.chaosChange),
    humanity: clamp(stats.humanity + choice.humanityChange),
  };
}

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

function writeLocalAttempts(attempts) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch {
    // Ignore storage write failures (private mode, quota, etc.).
  }
}

function saveAttemptLocally(attempt) {
  const current = readLocalAttempts();
  const next = [attempt, ...current].slice(0, 100);
  writeLocalAttempts(next);
}

function applyRoleBonus(choice, avatarId) {
  const bonus = choice.roleBonus?.[avatarId];
  if (!bonus) return choice;

  return {
    ...choice,
    outcome: bonus.outcome ?? choice.outcome,
    hopeChange: choice.hopeChange + (bonus.hopeChange ?? 0),
    trustChange: choice.trustChange + (bonus.trustChange ?? 0),
    chaosChange: choice.chaosChange + (bonus.chaosChange ?? 0),
    humanityChange: choice.humanityChange + (bonus.humanityChange ?? 0),
  };
}

// ─── page ──────────────────────────────────────────────────────
export default function GamePage() {
  const [scenarios, setScenarios]       = useState([]);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stats, setStats]               = useState(INITIAL_STATS);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [username, setUsername] = useState("");
  const [saveMode, setSaveMode] = useState(null);
  const [loading, setLoading]           = useState(true);

  const selectedAvatar = AVATARS.find((avatar) => avatar.id === selectedAvatarId) ?? null;

  // Fetch from real API when backend is ready; falls back to mock data.
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/scenarios");
        if (!res.ok) throw new Error("API not ready");
        const data = await res.json();
        setScenarios(data);
      } catch {
        setScenarios(MOCK_SCENARIOS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (didHardRefresh()) {
      clearGameStorage();
    }

    if (typeof window === "undefined") return;
    const savedAvatarId = window.localStorage.getItem(LOCAL_AVATAR_KEY);
    if (!savedAvatarId) return;

    const savedAvatar = AVATARS.find((avatar) => avatar.id === savedAvatarId);
    if (!savedAvatar) return;

    setSelectedAvatarId(savedAvatarId);
    setStats(savedAvatar.startingStats);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedUsername = window.sessionStorage.getItem(SESSION_USERNAME_KEY);
    if (savedUsername) setUsername(savedUsername);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!username.trim()) {
      window.sessionStorage.removeItem(SESSION_USERNAME_KEY);
      return;
    }
    window.sessionStorage.setItem(SESSION_USERNAME_KEY, username.trim());
  }, [username]);

  const scenario = scenarios[scenarioIndex];
  const availableChoices =
    scenario?.choices?.filter((choice) => !choice.requiredRole || choice.requiredRole === selectedAvatarId) ?? [];

  function handleSelectAvatar(avatarId) {
    const avatar = AVATARS.find((item) => item.id === avatarId);
    if (!avatar) return;
    setSelectedChoice(null);
    setScenarioIndex(0);
    setSelectedAvatarId(avatar.id);
    setStats(avatar.startingStats);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCAL_AVATAR_KEY, avatar.id);
    }
  }

  function handleChangeAvatar() {
    setSelectedChoice(null);
    setScenarioIndex(0);
    setSaveMode(null);
    setStats(INITIAL_STATS);
    setSelectedAvatarId(null);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LOCAL_AVATAR_KEY);
    }
  }

  // ── handlers ──────────────────────────────────────────────────
  async function handleChoice(choice) {
    const finalChoice = applyRoleBonus(choice, selectedAvatarId);
    const newStats = applyChoice(stats, finalChoice);
    setStats(newStats);
    setSelectedChoice(finalChoice);

    const attemptPayload = {
      id: `local-${Date.now()}`,
      avatarId: selectedAvatar?.id ?? null,
      avatarName: selectedAvatar?.name ?? null,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      choiceId: finalChoice.id,
      choiceText: finalChoice.text,
      outcome: finalChoice.outcome,
      ...newStats,
      createdAt: new Date().toISOString(),
    };

    // Save attempt — swallows error gracefully if API isn't up yet.
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarId: selectedAvatar?.id ?? null,
          scenarioId: scenario.id,
          choiceId:   finalChoice.id,
          outcome:    finalChoice.outcome,
          ...newStats,
        }),
      });

      if (!res.ok) throw new Error("API not ready");
      setSaveMode("api");
    } catch {
      saveAttemptLocally(attemptPayload);
      setSaveMode("local");
    }
  }

  function handleContinue() {
    setSelectedChoice(null);
    if (scenarioIndex + 1 < scenarios.length) {
      setScenarioIndex((i) => i + 1);
    } else {
      // No more scenarios — go to history / ending
      window.location.href = "/history";
    }
  }

  // ── render ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1814]">
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6558] uppercase animate-pulse">
          Scanning timeline…
        </p>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#1A1814]">
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6558] uppercase">
          No scenarios found
        </p>
        <Link href="/" className="font-display text-sm tracking-widest text-[#4ECDC4]">
          ← Return
        </Link>
      </div>
    );
  }

  if (!selectedAvatar) {
    return (
      <div className="min-h-screen bg-[#1A1814] px-6 py-10"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(78,205,196,0.10) 0%, transparent 60%), #1A1814" }}>
        <div className="w-full max-w-[1700px] mx-auto px-2 lg:px-4">
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6558] uppercase mb-2">
            Choose your role
          </p>
          <h1 className="font-display text-[#F0EAD6] tracking-wide mb-8"
            style={{ fontSize: "clamp(34px, 6vw, 52px)" }}>
            SELECT YOUR AVATAR
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => handleSelectAvatar(avatar.id)}
                className="text-left overflow-hidden transition-transform duration-200 hover:-translate-y-1 h-full min-h-[260px]"
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row items-stretch gap-4 h-full">
                    <div
                      className="relative w-full h-44 sm:h-auto sm:w-40 md:w-44 flex-shrink-0 overflow-hidden"
                      style={{
                        border: "1px solid rgba(255,255,255,0.10)",
                        background: "rgba(0,0,0,0.18)",
                      }}
                    >
                      <Image
                        src={avatar.imageUrl}
                        alt={avatar.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 176px"
                        className="object-contain object-center p-1"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <p className="font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase mb-1">
                        {avatar.trait}
                      </p>
                      <h2 className="font-display text-2xl text-[#F0EAD6] tracking-wide mb-2 leading-none">
                        {avatar.name}
                      </h2>
                      <p className="text-sm text-[#6B6558] mb-3 leading-snug">
                        {avatar.description}
                      </p>

                      <div className="mt-auto grid grid-cols-2 gap-x-3 gap-y-1">
                        <p className="font-mono text-[9px] tracking-[0.15em] text-[#F7C948] uppercase">Hope {avatar.startingStats.hope}</p>
                        <p className="font-mono text-[9px] tracking-[0.15em] text-[#4ECDC4] uppercase">Trust {avatar.startingStats.trust}</p>
                        <p className="font-mono text-[9px] tracking-[0.15em] text-[#8B1A1A] uppercase">Chaos {avatar.startingStats.chaos}</p>
                        <p className="font-mono text-[9px] tracking-[0.15em] text-[#A8C4A2] uppercase">Humanity {avatar.startingStats.humanity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1A1814]"
      style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(139,26,26,0.18) 0%, transparent 55%), #1A1814" }}>

      {/* ── Header ── */}
      <header
        className="py-4 flex-shrink-0"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          paddingLeft: "clamp(16px, 4vw, 72px)",
          paddingRight: "clamp(16px, 4vw, 72px)",
        }}
      >
        <div className="w-full max-w-[1480px] mx-auto flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/" className="font-display text-lg tracking-[0.1em] text-[#4ECDC4]">
              ASHES BETWEEN US
            </Link>
            <span className="font-mono text-[9px] tracking-[0.2em] text-[#6B6558] uppercase">
              {selectedAvatar.name}
            </span>
            <button
              onClick={handleChangeAvatar}
              className="font-mono text-[9px] tracking-[0.2em] text-[#6B6558] uppercase hover:text-[#4ECDC4] transition-colors"
            >
              ∷ Change avatar
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <label className="flex items-center gap-2">
              <span className="font-mono text-[9px] tracking-[0.2em] text-[#6B6558] uppercase whitespace-nowrap">
                Username
              </span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Traveler"
                maxLength={18}
                className="bg-transparent px-2 py-1 text-sm text-[#F0EAD6] outline-none w-36"
                style={{ border: "1px solid rgba(255,255,255,0.12)" }}
              />
            </label>
            <StatsPanel stats={stats} />
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      {selectedChoice ? (
        /* Outcome view */
        <OutcomeCard choice={selectedChoice} onContinue={handleContinue} />
      ) : (
        /* Scenario + choices view */
        <div
          className="flex-1 w-full max-w-[1480px] mx-auto py-8"
          style={{
            paddingLeft: "clamp(16px, 4vw, 72px)",
            paddingRight: "clamp(16px, 4vw, 72px)",
          }}
        >
          <div className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-8 flex flex-col gap-6">
              <ScenarioCard
                scenario={scenario}
                scenarioIndex={scenarioIndex}
                imageHeightClass="h-[220px] sm:h-[280px] xl:h-[340px]"
              />
            </div>

            <div className="xl:col-span-4 flex flex-col">
              <div>
                <p className="font-mono text-[9px] tracking-[0.3em] text-[#6B6558] uppercase mb-3">
                  Choose your action
                </p>
                <div className="flex flex-col gap-3">
                  {availableChoices.map((choice, i) => (
                    <ChoiceButton
                      key={choice.id}
                      choice={choice}
                      index={i}
                      onClick={handleChoice}
                    />
                  ))}
                </div>
              </div>

              {/* History link */}
              <div className="pt-5 pb-4 mt-auto">
                {saveMode === "local" && (
                  <p className="font-mono text-[9px] tracking-[0.2em] text-[#6B6558] uppercase mb-3">
                    Saving timeline locally until backend sync is available
                  </p>
                )}
                <Link
                  href="/history"
                  className="font-mono text-[9px] tracking-[0.25em] text-[#6B6558] uppercase hover:text-[#4ECDC4] transition-colors"
                >
                  ∷ View timeline history
                </Link>
              </div>
            </div>

            <div className="xl:col-span-12">
              <FutureMessageCard
                message={scenario.futureMsg}
                futureImageUrl={selectedAvatar.futureImageUrl}
                futureLabel={`${selectedAvatar.name} ∷ Future Self`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
