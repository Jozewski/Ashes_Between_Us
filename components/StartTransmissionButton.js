// components/StartTransmissionButton.js
"use client";

import { useRouter } from "next/navigation";
import { useMusic } from "@/components/MusicProvider";

export default function StartTransmissionButton() {
  const router = useRouter();
  const { playMusic } = useMusic();

  function handleStart() {
    // The click is the user gesture that unlocks audio playback.
    playMusic("start");
    router.push("/game");
  }

  return (
    <button
      type="button"
      onClick={handleStart}
      className="font-display text-lg tracking-[0.15em] text-[#1A1814] bg-[#4ECDC4] px-12 py-4 transition-all duration-200 hover:bg-[#F7C948] hover:scale-105 active:scale-100 animate-fade-up opacity-0 [animation-delay:1000ms] [animation-fill-mode:forwards]"
      style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}
    >
      ⬡ START TRANSMISSION
    </button>
  );
}
