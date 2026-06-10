// app/game/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import StatsPanel from "@/components/StatsPanel";
import FutureMessageCard from "@/components/FutureMessageCard";
import ScenarioCard from "@/components/ScenarioCard";
import ChoiceButton from "@/components/ChoiceButton";
import OutcomeCard from "@/components/OutcomeCard";
import MuteButton from "@/components/MuteButton";
import { useMusic } from "@/components/MusicProvider";
import { trackKeyForImage } from "@/lib/sceneAudioMap";
import { INITIAL_STATS } from "@/lib/mockData";
import { deriveFutureStateFromStats } from "@/lib/outcomeEngine";

const LOCAL_AVATAR_KEY = "abu_avatar_v1";
const SESSION_USERNAME_KEY = "abu_username_v1";
const SESSION_RUN_ID_KEY = "abu_run_id_v1";
const GAME_TURN_LIMIT = 10; // Game ends after 10 turns

function createRunId() {
  return `run-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
}

function getOrCreateRunId() {
  if (typeof window === "undefined") return null;
  let runId = window.sessionStorage.getItem(SESSION_RUN_ID_KEY);
  if (!runId) {
    runId = createRunId();
    window.sessionStorage.setItem(SESSION_RUN_ID_KEY, runId);
  }
  return runId;
}

function startNewRun() {
  if (typeof window === "undefined") return null;
  const runId = createRunId();
  window.sessionStorage.setItem(SESSION_RUN_ID_KEY, runId);
  return runId;
}

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

  window.localStorage.removeItem(LOCAL_AVATAR_KEY);
  window.sessionStorage.removeItem(SESSION_USERNAME_KEY);
  window.sessionStorage.removeItem(SESSION_RUN_ID_KEY);
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
  const router = useRouter();
  const { playMusic } = useMusic();
  const [scenario, setScenario] = useState(null);
  const [turn, setTurn] = useState(1);
  const [stats, setStats]               = useState(INITIAL_STATS);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [avatars, setAvatars] = useState([]);
  const [username, setUsername] = useState("");
  const [recentChoices, setRecentChoices] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [loadingScenario, setLoadingScenario] = useState(false);
  const [loadError, setLoadError] = useState("");

  const selectedAvatar = avatars.find((avatar) => avatar.id === selectedAvatarId) ?? null;
  const futureState = deriveFutureStateFromStats(stats);
  const futureImageUrl =
    selectedAvatar?.futureImageByState?.[futureState] ??
    selectedAvatar?.futureImageUrl ??
    null;

  useEffect(() => {
    if (!scenario?.imageUrl) return;
    playMusic(trackKeyForImage(scenario.imageUrl));
  }, [scenario?.imageUrl, playMusic]);

  useEffect(() => {
    if (didHardRefresh()) {
      clearGameStorage();
    }

    let cancelled = false;

    async function loadAvatars() {
      try {
        const res = await fetch("/api/avatars");
        if (!res.ok) throw new Error("Failed to load avatars");
        const data = await res.json();
        if (cancelled) return;

        const list = Array.isArray(data) ? data : [];
        setAvatars(list);

        if (typeof window !== "undefined") {
          const savedAvatarId = window.localStorage.getItem(LOCAL_AVATAR_KEY);
          const savedAvatar = savedAvatarId
            ? list.find((avatar) => avatar.id === savedAvatarId)
            : null;

          if (savedAvatar) {
            setSelectedAvatarId(savedAvatar.id);
            setStats(savedAvatar.startingStats);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error?.message || "Avatars are unavailable.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAvatars();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedAvatarId || scenario) return;

    const avatar = avatars.find((entry) => entry.id === selectedAvatarId);
    if (!avatar) return;

    requestNextScenario({
      avatarId: avatar.id,
      currentStats: avatar.startingStats,
      history: [],
      turnToSet: 1,
    });
  }, [selectedAvatarId, scenario, avatars]);

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
  const availableChoices = scenario?.choices?.slice(0, 6) ?? [];

  async function requestNextScenario({ avatarId, currentStats, history, turnToSet }) {
    setLoadingScenario(true);
    setLoadError("");

    try {
      const res = await fetch("/api/scenarios/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarId,
          stats: currentStats,
          recentChoices: history,
          runId: getOrCreateRunId(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate scenario");
      }

      setScenario(data);
      setTurn(turnToSet);
    } catch (error) {
      setScenario(null);
      setLoadError(error?.message || "Scenario generation is unavailable.");
    } finally {
      setLoadingScenario(false);
    }
  }

  function handleSelectAvatar(avatarId) {
    const avatar = avatars.find((item) => item.id === avatarId);
    if (!avatar) return;

    startNewRun();
    setSelectedChoice(null);
    setRecentChoices([]);
    setTurn(1);
    setScenario(null);
    setSelectedAvatarId(avatar.id);
    setStats(avatar.startingStats);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCAL_AVATAR_KEY, avatar.id);
    }
  }

  function handleChangeAvatar() {
    setSelectedChoice(null);
    setScenario(null);
    setTurn(1);
    setRecentChoices([]);
    setStats(INITIAL_STATS);
    setSelectedAvatarId(null);
    setLoadError("");

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LOCAL_AVATAR_KEY);
      window.sessionStorage.removeItem(SESSION_RUN_ID_KEY);
    }
  }

  // ── handlers ──────────────────────────────────────────────────
  async function handleChoice(choice) {
    if (!scenario || !selectedAvatar) return;

    const finalChoice = applyRoleBonus(choice, selectedAvatarId);
    const newStats = applyChoice(stats, finalChoice);
    setStats(newStats);
    setSelectedChoice(finalChoice);

    const attemptPayload = {
      username: username.trim() || null,
      avatarId: selectedAvatar?.id ?? null,
      avatarName: selectedAvatar?.name ?? null,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      choiceId: finalChoice.id,
      choiceText: finalChoice.text,
      outcome: finalChoice.outcome,
      ...newStats,
      createdAt: new Date().toISOString(),
      statsAfter: newStats,
    };

    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: getOrCreateRunId(),
          username: username.trim() || null,
          avatarId: selectedAvatar?.id ?? null,
          avatarName: selectedAvatar?.name ?? null,
          scenarioId: scenario.id,
          scenarioTitle: scenario.title,
          choiceId:   finalChoice.id,
          choiceText: finalChoice.text,
          outcome:    finalChoice.outcome,
          ...newStats,
        }),
      });

      const savedAttempt = await res.json();
      if (!res.ok) throw new Error(savedAttempt?.error || "Failed to save attempt");

      setRecentChoices((current) => [savedAttempt, ...current].slice(0, 6));
    } catch (error) {
      setLoadError(error?.message || "Attempt save failed.");
    }
  }

  async function handleContinue() {
    if (!selectedAvatar) return;

    setSelectedChoice(null);

    // Final decision reached — the timeline summary lives on /history.
    if (turn >= GAME_TURN_LIMIT) {
      router.push("/history");
      return;
    }

    await requestNextScenario({
      avatarId: selectedAvatar.id,
      currentStats: stats,
      history: recentChoices,
      turnToSet: turn + 1,
    });
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
            {avatars.map((avatar) => (
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

  if (!scenario) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#1A1814]">
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6558] uppercase">
          {loadingScenario ? "Generating scenario..." : loadError || "No scenarios found"}
        </p>
        {!loadingScenario && (
          <button
            onClick={() =>
              requestNextScenario({
                avatarId: selectedAvatar.id,
                currentStats: stats,
                history: recentChoices,
                turnToSet: turn,
              })
            }
            className="font-display text-sm tracking-widest text-[#1A1814] bg-[#4ECDC4] px-5 py-2 hover:bg-[#F7C948] transition-colors"
          >
            Retry generation
          </button>
        )}
        <Link href="/" className="font-display text-sm tracking-widest text-[#4ECDC4]">
          ← Return
        </Link>
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
            <span className="font-mono text-[9px] tracking-[0.2em] text-[#4ECDC4] uppercase">
              Turn {turn} of {GAME_TURN_LIMIT}
            </span>
            <button
              onClick={handleChangeAvatar}
              className="font-mono text-[9px] tracking-[0.2em] text-[#6B6558] uppercase hover:text-[#4ECDC4] transition-colors"
            >
              ∷ Change avatar
            </button>
            <MuteButton />
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
        <div
          className="flex-1 grid items-start justify-items-center overflow-y-auto"
          style={{
            paddingLeft: "clamp(16px, 4vw, 40px)",
            paddingRight: "clamp(16px, 4vw, 40px)",
            paddingTop: "clamp(16px, 3vh, 28px)",
            paddingBottom: "max(32px, env(safe-area-inset-bottom))",
          }}
        >
          <OutcomeCard choice={selectedChoice} onContinue={handleContinue} />
        </div>
      ) : loadingScenario ? (
        /* Between-turn loading screen */
        <div className="flex-1 flex flex-col items-center justify-center gap-6 select-none"
          style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(78,205,196,0.07) 0%, transparent 65%)" }}>
          {/* Animated scan lines */}
          <div className="relative flex flex-col items-center gap-3">
            <div className="flex gap-1.5 mb-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-0.5 bg-[#4ECDC4] rounded-full animate-pulse"
                  style={{
                    height: `${14 + (i % 3) * 8}px`,
                    animationDelay: `${i * 120}ms`,
                    animationDuration: "900ms",
                    opacity: 0.6 + i * 0.08,
                  }}
                />
              ))}
            </div>
            <p className="font-mono text-[9px] tracking-[0.45em] text-[#4ECDC4] uppercase animate-pulse">
              Timeline diverging
            </p>
            <p
              className="font-display text-[#F0EAD6] tracking-wide text-center"
              style={{ fontSize: "clamp(26px, 5vw, 44px)" }}
            >
              TURN {turn + 1} OF {GAME_TURN_LIMIT}
            </p>
            <p className="font-mono text-[9px] tracking-[0.3em] text-[#6B6558] uppercase mt-1 animate-pulse"
              style={{ animationDelay: "400ms" }}>
              Calculating consequences…
            </p>
          </div>
        </div>
      ) : (
        /* Scenario + choices view */
        <div
          className="flex-1 w-full max-w-[1920px] mx-auto py-6 pb-10 sm:py-8 xl:pt-5 xl:pb-7"
          style={{
            paddingLeft: "clamp(16px, 2vw, 40px)",
            paddingRight: "clamp(16px, 2vw, 40px)",
            paddingBottom: "max(40px, env(safe-area-inset-bottom))",
          }}
        >
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(540px,0.82fr)] xl:items-stretch">
            <div className="flex min-h-0 flex-col">
              <ScenarioCard
                scenario={scenario}
                scenarioIndex={turn - 1}
                imageHeightClass="h-[220px] sm:h-[280px] xl:min-h-[250px] xl:h-auto xl:flex-1"
                bodyClassName="xl:h-[clamp(340px,34vh,420px)]"
              />
            </div>

            <div className="flex flex-col">
              <div>
                <p className="font-mono text-[9px] tracking-[0.3em] text-[#6B6558] uppercase mb-3">
                  Choose your action
                </p>
                <div className="flex flex-col gap-2.5">
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
              <div className="pt-5 pb-4 xl:hidden">
                {loadError && (
                  <p className="font-mono text-[9px] tracking-[0.2em] text-[#6B6558] uppercase mb-3">
                    {loadError}
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

            {/* Regular future message card */}
            <div className="xl:col-span-2">
              <FutureMessageCard
                message={scenario.futureMsg}
                daysAhead={365 + (turn - 1) * 7}
                futureImageUrl={futureImageUrl}
                futureLabel={`${selectedAvatar.name} - Future Self (${futureState})`}
              />
            </div>

            {/* History link */}
            <div className="hidden xl:block xl:col-span-2 pb-4">
              {loadError && (
                <p className="font-mono text-[9px] tracking-[0.2em] text-[#6B6558] uppercase mb-3">
                  {loadError}
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
        </div>
      )}
    </div>
  );
}
