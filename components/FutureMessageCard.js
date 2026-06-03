// components/FutureMessageCard.js

export default function FutureMessageCard({ message, daysAhead = 47 }) {
  return (
    <div
      className="relative pl-14 pr-5 py-5"
      style={{
        background: "rgba(78,205,196,0.04)",
        border: "1px solid rgba(78,205,196,0.15)",
        borderLeft: "3px solid #4ECDC4",
      }}
    >
      {/* Vertical label */}
      <span
        className="absolute left-4 top-5 font-display text-[10px] tracking-[0.15em] text-[#4ECDC4]"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        FUTURE SIGNAL
      </span>

      {/* Header row */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-[6px] h-[6px] rounded-full bg-[#4ECDC4] animate-pulse" />
        <span className="font-mono text-[9px] tracking-[0.3em] text-[#4ECDC4] uppercase">
          Incoming transmission ∷ Source: +{daysAhead} days
        </span>
      </div>

      {/* Message */}
      <p className="text-sm text-[#D4C9A8] font-light italic leading-relaxed">
        &ldquo;{message}&rdquo;
      </p>
    </div>
  );
}
