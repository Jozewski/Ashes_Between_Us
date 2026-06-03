// app/history/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TimelineHistory from "@/components/TimelineHistory";

const LOCAL_ATTEMPTS_KEY = "abu_local_attempts_v1";

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

  return (
    <div
      className="min-h-screen flex flex-col bg-[#1A1814]"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(139,26,26,0.15) 0%, transparent 55%), #1A1814" }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link href="/" className="font-display text-lg tracking-[0.1em] text-[#4ECDC4]">
          ASHES BETWEEN US
        </Link>
        <Link
          href="/game"
          className="font-mono text-[9px] tracking-[0.25em] text-[#6B6558] uppercase hover:text-[#4ECDC4] transition-colors"
        >
          ← Continue timeline
        </Link>
      </header>

      {/* Body */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">

        <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6558] uppercase mb-2">
          Timeline record
        </p>
        <h1
          className="font-display tracking-wide text-[#F0EAD6] mb-10"
          style={{ fontSize: "clamp(32px, 6vw, 48px)" }}
        >
          YOUR CHOICES
        </h1>

        {!loading && source === "local" && (
          <p className="font-mono text-[9px] tracking-[0.2em] text-[#6B6558] uppercase mb-6">
            Showing locally saved timeline records
          </p>
        )}

        {loading ? (
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6558] uppercase animate-pulse">
            Loading timeline…
          </p>
        ) : (
          <TimelineHistory attempts={attempts} />
        )}

      </div>
    </div>
  );
}
