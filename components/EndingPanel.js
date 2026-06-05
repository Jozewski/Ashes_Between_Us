// components/EndingPanel.js
"use client";

import Link from "next/link";

export default function EndingPanel({ stats, avatarName, endingData, turn, onNewGame }) {
  const statsList = [
    { label: "Hope", value: stats.hope, color: "#F7C948" },
    { label: "Trust", value: stats.trust, color: "#4ECDC4" },
    { label: "Chaos", value: stats.chaos, color: "#8B1A1A" },
    { label: "Humanity", value: stats.humanity, color: "#A8C4A2" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Ending title and icon */}
      <div className="mb-6">
        <div className="text-4xl mb-3">{endingData.icon}</div>
        <h2 className="font-display text-2xl tracking-wide text-[#F0EAD6] mb-2">
          {endingData.title}
        </h2>
        <p className="font-mono text-[9px] tracking-[0.15em] text-[#4ECDC4] uppercase">
          {avatarName} ∷ After {turn} {turn === 1 ? "decision" : "decisions"}
        </p>
      </div>

      {/* Ending narrative */}
      <div className="mb-6 p-4 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] flex-1">
        <p className="text-sm text-[#D4C5A0] font-light leading-relaxed">
          {endingData.narrative}
        </p>
      </div>

      {/* Final stats */}
      <div className="mb-6 p-4 border border-[rgba(255,255,255,0.08)]">
        <p className="font-mono text-[9px] tracking-[0.2em] text-[#6B6558] uppercase mb-3">
          Final Stats
        </p>
        <div className="grid grid-cols-2 gap-3">
          {statsList.map(({ label, value, color }) => (
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

      {/* Action buttons */}
      <div className="flex flex-col gap-2 pt-4 border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={onNewGame}
          className="w-full font-display text-sm tracking-[0.1em] text-[#1A1814] bg-[#4ECDC4] px-4 py-3 transition-all duration-200 hover:bg-[#F7C948] active:scale-95"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
        >
          NEW TIMELINE
        </button>
        <Link href="/history" className="w-full">
          <button className="w-full font-mono text-[9px] tracking-[0.15em] text-[#4ECDC4] border border-[#4ECDC4] px-4 py-2 transition-colors duration-200 hover:bg-[rgba(78,205,196,0.1)]">
            VIEW HISTORY
          </button>
        </Link>
      </div>
    </div>
  );
}
