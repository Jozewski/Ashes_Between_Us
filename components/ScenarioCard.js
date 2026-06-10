// components/ScenarioCard.js
import Image from "next/image";

export default function ScenarioCard({
  scenario,
  scenarioIndex,
  imageHeightClass = "h-[220px]",
  bodyClassName = "",
}) {
  return (
    <div className="flex min-h-0 flex-col gap-3.5">

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

      <div data-testid="scenario-media-copy" className={`flex min-h-0 flex-col gap-3.5 ${bodyClassName}`}>
        {/* Scene image */}
        <div
          className={`w-full relative overflow-hidden flex items-center justify-center bg-[#120F0C] ${imageHeightClass}`}
          style={{
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {scenario.imageUrl ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#1A1814]/45" />
              <Image
                src={scenario.imageUrl}
                alt={scenario.title}
                fill
                sizes="(max-width: 1280px) 100vw, 960px"
                className="relative z-10 object-cover object-center scale-[1.035]"
                priority={scenarioIndex === 0}
              />
            </>
          ) : (
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

    </div>
  );
}
