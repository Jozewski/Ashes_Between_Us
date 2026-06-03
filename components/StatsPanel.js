// components/StatsPanel.js
"use client";

const STATS = [
  { key: "hope",     label: "Hope",     color: "#F7C948" },
  { key: "trust",    label: "Trust",    color: "#4ECDC4" },
  { key: "chaos",    label: "Chaos",    color: "#8B1A1A" },
  { key: "humanity", label: "Humanity", color: "#A8C4A2" },
];

export default function StatsPanel({ stats }) {
  return (
    <div className="flex gap-5">
      {STATS.map(({ key, label, color }) => {
        const value = stats[key] ?? 0;
        return (
          <div key={key} className="flex flex-col items-center">
            <span className="font-mono text-[9px] tracking-[0.2em] text-[#6B6558] uppercase mb-1">
              {label}
            </span>
            <span
              className="font-display text-xl tracking-wide leading-none"
              style={{ color }}
            >
              {value}
            </span>
            <div className="w-12 h-[3px] bg-white/10 mt-1 overflow-hidden">
              <div
                className="h-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
