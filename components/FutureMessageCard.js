// components/FutureMessageCard.js

import Image from "next/image";

export default function FutureMessageCard({
  message,
  daysAhead = 47,
  futureImageUrl,
  futureLabel = "Future self",
}) {
  return (
    <div
      className="px-4 py-4 sm:px-5 sm:py-5"
      style={{
        background: "rgba(78,205,196,0.04)",
        border: "1px solid rgba(78,205,196,0.15)",
        borderLeft: "3px solid #4ECDC4",
      }}
    >
      <p className="font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase mb-2">
        Future signal
      </p>

      {/* Header row */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-[6px] h-[6px] rounded-full bg-[#4ECDC4] animate-pulse" />
        <span className="font-mono text-[9px] tracking-[0.3em] text-[#4ECDC4] uppercase">
          Incoming transmission ∷ Source: +{daysAhead} days
        </span>
      </div>

      {/* Message */}
      <p className="text-base text-[#D4C9A8] font-light italic leading-relaxed">
        &ldquo;{message}&rdquo;
      </p>

      {futureImageUrl && (
        <div className="mt-3.5 flex items-center gap-3">
          <div className="relative w-11 h-11 overflow-hidden"
            style={{ border: "1px solid rgba(78,205,196,0.35)" }}>
            <Image
              src={futureImageUrl}
              alt={futureLabel}
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
          <p className="font-mono text-[9px] tracking-[0.2em] text-[#6B6558] uppercase">
            {futureLabel}
          </p>
        </div>
      )}
    </div>
  );
}
