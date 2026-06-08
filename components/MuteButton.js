// components/MuteButton.js
"use client";

import { useMusic } from "@/components/MusicProvider";

export default function MuteButton({ className = "" }) {
  const { muted, toggleMute } = useMusic();

  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-pressed={muted}
      aria-label={muted ? "Unmute sound" : "Mute sound"}
      title={muted ? "Unmute sound" : "Mute sound"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/45 font-mono text-lg leading-none backdrop-blur transition-colors hover:border-[#4ECDC4]/45 hover:bg-black/65 ${
        muted ? "text-[#C84B11]" : "text-[#4ECDC4]"
      } ${className}`}
    >
      <span aria-hidden="true">♪</span>
    </button>
  );
}
