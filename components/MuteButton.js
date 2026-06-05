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
      className={`font-mono text-[9px] tracking-[0.2em] uppercase transition-colors ${
        muted ? "text-[#8B1A1A]" : "text-[#6B6558] hover:text-[#4ECDC4]"
      } ${className}`}
    >
      {muted ? "♪ Sound off" : "♪ Sound on"}
    </button>
  );
}
