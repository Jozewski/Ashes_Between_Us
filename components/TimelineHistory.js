// components/TimelineHistory.js

const STAT_META = {
  hope:     { label: "Hope",     color: "#F7C948" },
  trust:    { label: "Trust",    color: "#4ECDC4" },
  chaos:    { label: "Chaos",    color: "#8B1A1A" },
  humanity: { label: "Humanity", color: "#A8C4A2" },
};

function formatTimestampUtc(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const month = months[date.getUTCMonth()];
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");

  return `${month} ${day}, ${hour}:${minute} UTC`;
}

export default function TimelineHistory({ attempts }) {
  if (!attempts || attempts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6558] uppercase">
          No choices recorded yet
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {attempts.map((attempt, i) => (
        <div key={attempt.id} className="flex gap-6 relative">

          {/* Timeline line */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-[1px] flex-1 bg-white/10" style={{ minHeight: i === 0 ? 24 : 0 }} />
            <div className="w-2 h-2 rounded-full bg-[#C84B11] flex-shrink-0" />
            <div className="w-[1px] flex-1 bg-white/10" />
          </div>

          {/* Content */}
          <div className="pb-8 pt-4 flex-1">
            <p className="font-mono text-[9px] tracking-[0.25em] text-[#6B6558] uppercase mb-1">
              Decision {String(i + 1).padStart(2, "0")} ∷{" "}
              {formatTimestampUtc(attempt.createdAt)}
            </p>

            <h3 className="font-display text-lg tracking-wide text-[#F0EAD6] mb-1">
              {attempt.scenarioTitle ?? "Unknown Scenario"}
            </h3>

            {attempt.avatarName && (
              <p className="font-mono text-[9px] tracking-[0.2em] text-[#4ECDC4] uppercase mb-2">
                {attempt.avatarName}
              </p>
            )}

            <p className="text-sm text-[#6B6558] font-light leading-snug mb-3">
              {attempt.choiceText ?? attempt.outcome}
            </p>

            {/* Stat snapshot */}
            <div className="flex flex-wrap gap-3">
              {Object.entries(STAT_META).map(([key, { label, color }]) => (
                <div key={key} className="flex items-center gap-1">
                  <span
                    className="font-mono text-[9px] tracking-[0.1em] text-[#6B6558] uppercase"
                  >
                    {label}
                  </span>
                  <span className="font-display text-sm" style={{ color }}>
                    {attempt[key] ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}
