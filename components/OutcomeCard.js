// components/OutcomeCard.js
"use client";

const STAT_META = {
  hope:     { label: "Hope",     color: "#F7C948" },
  trust:    { label: "Trust",    color: "#4ECDC4" },
  chaos:    { label: "Chaos",    color: "#8B1A1A" },
  humanity: { label: "Humanity", color: "#A8C4A2" },
};

export default function OutcomeCard({ choice, onContinue }) {
  const changes = [
    { key: "hope",     val: choice.hopeChange },
    { key: "trust",    val: choice.trustChange },
    { key: "chaos",    val: choice.chaosChange },
    { key: "humanity", val: choice.humanityChange },
  ].filter((c) => c.val !== 0);

  return (
    <div className="flex flex-col items-center text-center max-w-xl xl:max-w-2xl mx-auto w-full px-6 py-8 sm:py-10 xl:py-14">

      <p className="font-mono text-[10px] xl:text-[11px] tracking-[0.3em] text-[#6B6558] uppercase mb-5 xl:mb-6">
        Timeline branch locked
      </p>

      <h2
        className="font-display tracking-wide text-[#F0EAD6] mb-4 xl:mb-5"
        style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
      >
        CONSEQUENCE
      </h2>

      <p className="text-base xl:text-xl text-[#6B6558] font-light leading-relaxed mb-9 xl:mb-12 max-w-sm xl:max-w-2xl">
        {choice.outcome}
      </p>

      {/* Stat changes */}
      {changes.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 xl:gap-5 mb-10 xl:mb-14">
          {changes.map(({ key, val }) => {
            const { label, color } = STAT_META[key];
            const isPos = val > 0;
            return (
              <div
                key={key}
                className="px-5 py-3 xl:px-7 xl:py-4 text-center"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="font-mono text-[9px] xl:text-[10px] tracking-[0.2em] text-[#6B6558] uppercase mb-1">
                  {label}
                </p>
                <p
                  className="font-display text-3xl xl:text-5xl tracking-wide"
                  style={{ color: isPos ? color : "#8B1A1A" }}
                >
                  {isPos ? `+${val}` : val}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={onContinue}
        className="font-display text-lg xl:text-2xl tracking-[0.15em] text-[#1A1814] bg-[#4ECDC4] px-11 py-4 xl:px-14 xl:py-5 transition-all duration-200 hover:bg-[#F7C948] hover:scale-105 active:scale-100"
        style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}
      >
        CONTINUE TIMELINE →
      </button>

    </div>
  );
}
