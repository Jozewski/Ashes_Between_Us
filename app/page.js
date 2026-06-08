import StartTransmissionButton from "@/components/StartTransmissionButton";
import MuteButton from "@/components/MuteButton";

export const metadata = {
  title: "Ashes Between Us",
  description:
    "An apocalyptic butterfly-effect RPG. Your future self is trying to reach you.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-center text-[#F0EAD6] md:grid md:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
      <section className="relative min-h-[58vh] overflow-hidden bg-[#050505] md:min-h-screen">
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/ui/title-screen-background.png')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/70 md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/65" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(180deg, transparent 0px, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)",
          }}
        />
      </section>

      <section
        className="relative flex min-h-[42vh] items-center justify-center overflow-hidden border-t border-white/10 bg-[#080604] bg-cover bg-center bg-no-repeat px-5 py-9 md:min-h-screen md:border-l md:border-t-0 md:px-6 lg:px-10 xl:px-14"
        style={{
          backgroundImage: "url('/images/items/timeline-fragment.png')",
        }}
      >
        <div className="absolute right-4 top-4 z-20 md:right-5 md:top-5">
          <MuteButton />
        </div>

        <div className="absolute inset-0 bg-black/75" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(78,205,196,0.18),transparent_58%)]" />

        <div className="relative z-10 flex w-full max-w-[360px] flex-col items-center xl:max-w-[420px]">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-[#4ECDC4] opacity-0 animate-fade-up [animation-delay:200ms] [animation-fill-mode:forwards] [text-shadow:0_0_14px_rgba(78,205,196,0.75)] xl:mb-5 xl:tracking-[0.35em]">
            Transmission received
          </p>

          <h1
            className="mb-4 font-display leading-none tracking-wide text-[#F0EAD6] opacity-0 animate-fade-up [animation-delay:400ms] [animation-fill-mode:forwards] xl:mb-5"
            style={{ fontSize: "clamp(32px, 4.6vw, 58px)" }}
          >
            Timeline unstable
          </h1>

          <p className="mb-4 font-display text-sm uppercase tracking-[0.16em] text-[#D4C9A8] opacity-0 animate-fade-up [animation-delay:600ms] [animation-fill-mode:forwards] xl:text-base xl:tracking-[0.18em]">
            An Apocalyptic Timeline RPG
          </p>

          <p className="mb-7 max-w-sm text-sm font-light leading-relaxed text-[#B8AC8D] opacity-0 animate-fade-up [animation-delay:800ms] [animation-fill-mode:forwards] xl:mb-8 xl:text-base">
            Your future self is trying to reach you. Every choice ripples
            forward, and some futures cannot be undone.
          </p>

          <StartTransmissionButton />

          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-[#C84B11] opacity-0 animate-pulse animate-fade-up [animation-delay:1200ms] [animation-fill-mode:forwards] [text-shadow:0_0_16px_rgba(200,75,17,0.7)]">
            Timeline divergence detected
          </p>
        </div>
      </section>
    </main>
  );
}
