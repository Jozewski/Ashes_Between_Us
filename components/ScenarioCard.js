// components/ScenarioCard.js

export default function ScenarioCard({ scenario, scenarioIndex, imageHeightClass = "h-[220px]" }) {
  return (
    <div className="flex flex-col gap-3.5">

      {/* Tag + title */}
      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6558] uppercase">
          Scenario {String(scenarioIndex + 1).padStart(2, "0")} ∷ Day {14 + scenarioIndex * 7} Post-Collapse
        </p>
        <h2
          className="font-display tracking-wide text-[#F0EAD6] leading-none mt-1"
          style={{ fontSize: "clamp(28px, 5vw, 40px)" }}
        >
          {scenario.title.toUpperCase()}
        </h2>
      </div>

      {/* Scene image */}
      <div
        className={`w-full relative overflow-hidden flex items-center justify-center ${imageHeightClass}`}
        style={{
          background:
            scenario.imageUrl
              ? `linear-gradient(to bottom, transparent 40%, #1A1814 100%), url(${scenario.imageUrl}) center/cover`
              : "linear-gradient(135deg, #2A2218 0%, #1C2830 50%, #221A1A 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {!scenario.imageUrl && (
          <span className="font-mono text-[10px] tracking-[0.2em] text-white/20">
            [ scenario background image ]
          </span>
        )}
      </div>

      {/* Setting text */}
      <p className="text-base text-[#8F856D] font-light leading-relaxed">
        {scenario.setting}
      </p>

    </div>
  );
}
