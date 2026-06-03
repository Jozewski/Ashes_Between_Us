// app/game/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StatsPanel from "@/components/StatsPanel";
import FutureMessageCard from "@/components/FutureMessageCard";
import ScenarioCard from "@/components/ScenarioCard";
import ChoiceButton from "@/components/ChoiceButton";
import OutcomeCard from "@/components/OutcomeCard";
import { MOCK_SCENARIOS, INITIAL_STATS } from "@/lib/mockData";

const LOCAL_ATTEMPTS_KEY = "abu_local_attempts_v1";

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

// ─── page ──────────────────────────────────────────────────────
export default function GamePage() {
  const [scenarios, setScenarios]       = useState([]);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stats, setStats]               = useState(INITIAL_STATS);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [saveMode, setSaveMode] = useState(null);
  const [loading, setLoading]           = useState(true);

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

  const scenario = scenarios[scenarioIndex];

  // ── handlers ──────────────────────────────────────────────────
  async function handleChoice(choice) {
    const newStats = applyChoice(stats, choice);
    setStats(newStats);
    setSelectedChoice(choice);

    const attemptPayload = {
      id: `local-${Date.now()}`,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      choiceId: choice.id,
      choiceText: choice.text,
      outcome: choice.outcome,
      ...newStats,
      createdAt: new Date().toISOString(),
    };

    // Save attempt — swallows error gracefully if API isn't up yet.
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: scenario.id,
          choiceId:   choice.id,
          outcome:    choice.outcome,
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

  return (
    <div className="min-h-screen flex flex-col bg-[#1A1814]"
      style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(139,26,26,0.18) 0%, transparent 55%), #1A1814" }}>

      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link href="/" className="font-display text-lg tracking-[0.1em] text-[#4ECDC4]">
          ASHES BETWEEN US
        </Link>
        <StatsPanel stats={stats} />
      </header>

      {/* ── Body ── */}
      {selectedChoice ? (
        /* Outcome view */
        <OutcomeCard choice={selectedChoice} onContinue={handleContinue} />
      ) : (
        /* Scenario + choices view */
        <div className="flex-1 flex flex-col gap-6 px-6 py-8 max-w-2xl mx-auto w-full">

          <ScenarioCard scenario={scenario} scenarioIndex={scenarioIndex} />

          <FutureMessageCard message={scenario.futureMsg} />

          <div>
            <p className="font-mono text-[9px] tracking-[0.3em] text-[#6B6558] uppercase mb-3">
              Choose your action
            </p>
            <div className="flex flex-col gap-3">
              {scenario.choices.map((choice, i) => (
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
          <div className="pt-2 pb-4">
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
      )}
    </div>
  );
}
