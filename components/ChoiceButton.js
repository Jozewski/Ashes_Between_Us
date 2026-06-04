// components/ChoiceButton.js
"use client";

const KEYS = ["A", "B", "C", "D", "E", "F"

];

function StatTag({ label, value }) {
  const isPos = value > 0;
  const isNeg = value < 0;
  const display = isPos ? `${label} +${value}` : isNeg ? `${label} ${value}` : `${label} ±0`;

  const style = isPos
    ? { color: "#F7C948", border: "1px solid rgba(247,201,72,0.25)", background: "rgba(247,201,72,0.05)" }
    : isNeg
    ? { color: "#8B1A1A", border: "1px solid rgba(139,26,26,0.4)", background: "rgba(139,26,26,0.05)" }
    : { color: "#4ECDC4", border: "1px solid rgba(78,205,196,0.25)", background: "rgba(78,205,196,0.05)" };

  return (
    <span className="font-mono text-[9px] tracking-[0.15em] px-2 py-[3px]" style={style}>
      {display}
    </span>
  );
}

export default function ChoiceButton({ choice, index, onClick, disabled }) {
  const letter = KEYS[index] ?? String(index);

  return (
    <button
      onClick={() => onClick(choice)}
      disabled={disabled}
      className="group w-full text-left flex items-start gap-4 px-5 py-4 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        e.currentTarget.style.borderColor = "rgba(200,75,17,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      {/* Left accent bar */}
      <span
        className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#C84B11] scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-bottom"
      />

      {/* Key letter */}
      <span className="font-display text-xl text-[#C84B11] flex-shrink-0 leading-none pt-[2px]">
        {letter}
      </span>

      {/* Text + stat tags */}
      <div className="flex flex-col gap-2">
        <p className="text-sm text-[#D4C9A8] leading-snug">{choice.text}</p>
        <div className="flex flex-wrap gap-2">
          {choice.hopeChange !== 0     && <StatTag label="HOPE"     value={choice.hopeChange} />}
          {choice.trustChange !== 0    && <StatTag label="TRUST"    value={choice.trustChange} />}
          {choice.chaosChange !== 0    && <StatTag label="CHAOS"    value={choice.chaosChange} />}
          {choice.humanityChange !== 0 && <StatTag label="HUMANITY" value={choice.humanityChange} />}
        </div>
      </div>
    </button>
  );
}
