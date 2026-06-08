// app/page.js
import StartTransmissionButton from "@/components/StartTransmissionButton";
import MuteButton from "@/components/MuteButton";

export const metadata = {
  title: "Ashes Between Us",
  description: "An apocalyptic butterfly-effect RPG. Your future self is trying to reach you.",
};

export default function LandingPage() {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#1A1814] bg-cover bg-center bg-no-repeat px-6 py-20 text-center"
      style={{
        backgroundImage: "url('/images/ui/title-screen-background.png')",
      }}
    >

      {/* Sound on/off toggle */}
      <div className="absolute top-5 right-5 z-20">
        <MuteButton />
      </div>

      {/* Readability overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-black/65" />

      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "repeating-linear-gradient(180deg, transparent 0px, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)",
        }}
      />

      {/* Red radial glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(139,26,26,0.28) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">

        {/* Eyebrow */}
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#4ECDC4] uppercase mb-6 animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]">
          Transmission received ∷ Timeline unstable
        </p>

        {/* Title */}
        <h1
          className="font-display leading-[0.88] tracking-wide text-[#F0EAD6] mb-2 animate-fade-up opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]"
          style={{ fontSize: "clamp(56px, 11vw, 104px)", textShadow: "0 0 60px rgba(200,75,17,0.35)" }}
        >
          ASHES<br />
          <span className="text-[#C84B11]">BETWEEN</span><br />
          US
        </h1>

        {/* Subtitle */}
        <p className="font-display text-[#6B6558] tracking-[0.14em] mb-10 animate-fade-up opacity-0 [animation-delay:600ms] [animation-fill-mode:forwards]"
          style={{ fontSize: "clamp(14px, 2.5vw, 22px)" }}>
          An Apocalyptic Timeline RPG
        </p>

        {/* Tagline */}
        <p className="text-sm text-[#6B6558] font-light leading-relaxed max-w-xs mb-12 animate-fade-up opacity-0 [animation-delay:800ms] [animation-fill-mode:forwards]">
          Your future self is trying to reach you. Every choice you make ripples forward. Some futures cannot be undone.
        </p>

        {/* CTA */}
        <StartTransmissionButton />

        {/* Warning strip */}
        <p className="mt-12 font-mono text-[10px] tracking-[0.25em] text-[#8B1A1A] animate-pulse animate-fade-up opacity-0 [animation-delay:1200ms] [animation-fill-mode:forwards]">
          ⚠ WARNING: TIMELINE DIVERGENCE DETECTED ⚠
        </p>

      </div>
    </main>
  );
}
