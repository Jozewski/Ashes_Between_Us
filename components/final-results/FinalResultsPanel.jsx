"use client";

import Image from "next/image";
import Link from "next/link";
import TimelineHistory from "@/components/TimelineHistory";

export default function FinalResultsPanel({
  attempts,
  loading,
  source,
  loadError,
  playerProfile,
  latestAvatar,
  latestAttempt,
  endingNarrative,
  endingStory,
  endingState,
  endingScore,
  finalStats,
  futureImageUrl,
  onNewGame,
}) {
  const endingTitle =
    endingStory?.title ??
    endingNarrative?.title ??
    "Timeline Recorded";
  const endingText =
    endingStory?.summary ??
    endingNarrative?.narrative ??
    latestAttempt?.outcome ??
    playerProfile?.backstory ??
    "";
  const futureSelfDescription = latestAvatar
    ? `${latestAvatar.name} reaches this future as a ${endingState ?? "recorded"} survivor, shaped by the last branch${latestAttempt?.scenarioTitle ? ` at ${latestAttempt.scenarioTitle}` : ""}. This image is the version that looks back, not another warning note.`
    : "Your future self reflects the outcome created by this run and the final branch recorded in the archive.";

  return (
    <div className="grid min-w-0 items-stretch gap-4 sm:gap-5 xl:min-h-[calc(100vh-176px)] xl:grid-cols-[minmax(290px,0.92fr)_minmax(420px,1.18fr)_minmax(300px,0.9fr)]">
      <section className="order-2 min-w-0 flex h-full flex-col gap-3.5 xl:order-1">
        <div>
          <p className="mb-2 font-mono text-[10px] tracking-[0.3em] text-[#6B6558] uppercase">
            Final archive
          </p>
          <h1
            className="font-display tracking-wide text-[#F0EAD6]"
            style={{ fontSize: "clamp(34px, 6vw, 58px)", lineHeight: 0.92 }}
          >
            {endingTitle}
          </h1>
          <p className="mt-3 font-mono text-[9px] tracking-[0.24em] text-[#4ECDC4] uppercase">
            {latestAvatar?.name ?? "Unknown survivor"}
            {endingState ? ` / ${endingState}` : ""}
            {endingScore !== null && endingScore !== undefined
              ? ` / score ${endingScore}`
              : ""}
          </p>
        </div>

        {latestAvatar && (
          <div className="relative aspect-[4/5] min-h-[220px] overflow-hidden border border-white/10 bg-black/20 sm:min-h-[260px]">
            <Image
              src={latestAvatar.imageUrl}
              alt={latestAvatar.name}
              fill
              sizes="(max-width: 1280px) 100vw, 360px"
              className="object-contain object-center p-3"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase">
                {latestAvatar.trait}
              </p>
              <p className="font-display text-2xl leading-none tracking-wide text-[#F0EAD6]">
                {latestAvatar.name}
              </p>
            </div>
          </div>
        )}

        <div className="border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-2 font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase">
            Survivor record
          </p>
          {playerProfile?.profileTitle && (
            <p className="mb-2 font-display text-2xl leading-none tracking-wide text-[#F0EAD6]">
              {playerProfile.profileTitle}
            </p>
          )}
          <p className="text-base leading-relaxed text-[#B8AC8D]">
            {playerProfile?.bio ??
              "Complete a timeline to generate a survivor record from your choices."}
          </p>
        </div>

        <div className="flex-1 border border-white/10 bg-white/[0.03] p-4 xl:min-h-0">
          <p className="mb-2 font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase">
            Beginning story
          </p>
          <p className="whitespace-pre-line text-base leading-relaxed text-[#B8AC8D]">
            {playerProfile?.backstory
              ? playerProfile.backstory
              : latestAvatar?.backstory ??
                "The archive will fill in as your run creates more choices."}
          </p>
        </div>
      </section>

      <main className="order-1 min-w-0 flex h-full flex-col gap-4 xl:order-2">
        <section className="border border-white/10 bg-black/20">
          <div className="grid md:grid-cols-[0.85fr_1fr]">
            <div className="relative min-h-[260px] overflow-hidden bg-black/35">
              {futureImageUrl && (
                <Image
                  src={futureImageUrl}
                  alt={`Future state: ${endingState}`}
                  fill
                  sizes="(max-width: 1280px) 100vw, 420px"
                  className="object-contain object-center p-3"
                />
              )}
            </div>
            <div className="flex flex-col justify-center p-4 sm:p-5">
              <p className="mb-2 font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase">
                Future self
              </p>
              <h3 className="font-display text-3xl leading-none tracking-wide text-[#F0EAD6]">
                {(endingState ?? "unknown").toUpperCase()}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-[#B8AC8D]">
                {futureSelfDescription}
              </p>
            </div>
          </div>
        </section>

        <article className="flex-1 border border-[#4ECDC4]/30 bg-[#4ECDC4]/5 p-5 sm:p-6 xl:min-h-0">
          <div className="mb-3.5 flex items-start gap-3">
            {endingNarrative?.icon && (
              <span className="text-4xl leading-none">{endingNarrative.icon}</span>
            )}
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] text-[#4ECDC4] uppercase">
                Final outcome
              </p>
              <h2 className="mt-1 font-display text-3xl leading-none tracking-wide text-[#F0EAD6] sm:text-4xl">
                {endingTitle}
              </h2>
            </div>
          </div>
          <p className="whitespace-pre-line text-[17px] leading-relaxed text-[#D4C9A8]">
            {endingText || "No final narrative is available yet."}
          </p>
          {endingStory?.futureSignalReading && (
            <div className="mt-5 border-t border-[#4ECDC4]/20 pt-4">
              <p className="mb-2 font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase">
                Future signal reading
              </p>
              <p className="text-base leading-relaxed text-[#B8AC8D]">
                {endingStory.futureSignalReading}
              </p>
            </div>
          )}
          {endingStory?.closingLine && (
            <p className="mt-5 font-display text-2xl leading-tight tracking-wide text-[#F0EAD6]">
              {endingStory.closingLine}
            </p>
          )}
        </article>
      </main>

      <aside className="order-3 min-w-0 flex h-full flex-col gap-3.5">
        {finalStats && (
          <section className="border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-4 font-mono text-[9px] tracking-[0.25em] text-[#6B6558] uppercase">
              Final stats
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {finalStats.map(({ label, value, color }) => (
                <div key={label} className="border border-white/10 bg-black/15 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-mono text-[9px] tracking-[0.18em] text-[#B8AC8D] uppercase">
                      {label}
                    </p>
                    <p className="font-display text-2xl leading-none" style={{ color }}>
                      {value}
                    </p>
                  </div>
                  <div className="h-2 bg-white/[0.06]">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${Math.max(0, Math.min(100, Number(value) || 0))}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-2 font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase">
            Future notes
          </p>
          <ul className="space-y-2.5 text-base leading-relaxed text-[#B8AC8D]">
            {(playerProfile?.futureNotes ?? [
              "Finish one full scenario chain to seed the profile system.",
              "Your stat direction shapes this panel dynamically.",
              "Future warnings become more specific with more choices.",
            ]).map((note) => (
              <li key={note} className="border-l border-[#4ECDC4]/25 pl-3">
                {note}
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-2 font-mono text-[9px] tracking-[0.25em] text-[#4ECDC4] uppercase">
            Latest branch
          </p>
          {latestAttempt ? (
            <p className="text-base leading-relaxed text-[#D4C9A8]">
              {latestAttempt.choiceText ?? latestAttempt.outcome}
            </p>
          ) : (
            <p className="text-base leading-relaxed text-[#6B6558]">
              No timeline branch yet.
            </p>
          )}
        </section>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onNewGame}
            className="bg-[#4ECDC4] px-5 py-3 font-display text-sm tracking-[0.12em] text-[#1A1814] transition-colors hover:bg-[#F7C948]"
          >
            NEW TIMELINE
          </button>
          <Link
            href="/game"
            className="border border-white/10 px-5 py-3 text-center font-mono text-[9px] tracking-[0.2em] text-[#B8AC8D] uppercase transition-colors hover:border-[#4ECDC4]/40 hover:text-[#4ECDC4]"
          >
            Continue current run
          </Link>
        </div>

        <section className="min-h-[300px] flex-1 border border-white/10 bg-white/[0.03] p-4 sm:min-h-[380px] xl:min-h-0">
          <div className="mb-4">
            <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6558] uppercase">
              Timeline record
            </p>
            <h2 className="font-display text-3xl tracking-wide text-[#F0EAD6]">
              Your choices
            </h2>
          </div>

          {!loading && source === "none" && loadError && (
            <p className="mb-4 font-mono text-[9px] tracking-[0.2em] text-[#C84B11] uppercase">
              {loadError}
            </p>
          )}

          {loading ? (
            <p className="font-mono text-[10px] tracking-[0.3em] text-[#6B6558] uppercase animate-pulse">
              Loading timeline...
            </p>
          ) : (
            <TimelineHistory attempts={attempts} />
          )}
        </section>
      </aside>
    </div>
  );
}
