// components/StartTransmissionButton.js
"use client";

import { useRouter } from "next/navigation";
import { useMusic } from "@/components/MusicProvider";

const LOCAL_AVATAR_KEY = "abu_avatar_v1";
const SESSION_RUN_ID_KEY = "abu_run_id_v1";

export default function StartTransmissionButton() {
  const router = useRouter();
  const { playMusic } = useMusic();

  function handleStart() {
    // The click is the user gesture that unlocks audio playback.
    playMusic("start");

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LOCAL_AVATAR_KEY);
      window.sessionStorage.removeItem(SESSION_RUN_ID_KEY);
    }

    router.push("/game?selectAvatar=1");
  }

  return (
    <button
      type="button"
      onClick={handleStart}
      className="group relative w-full max-w-sm overflow-hidden border border-[#4ECDC4]/55 bg-[#4ECDC4]/10 px-7 py-4 text-center transition-all duration-200 hover:border-[#F7C948]/80 hover:bg-[#F7C948]/10 active:scale-[0.99] animate-fade-up opacity-0 [animation-delay:1000ms] [animation-fill-mode:forwards]"
      style={{
        clipPath:
          "polygon(14px 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%)",
      }}
    >
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[#4ECDC4]/70 transition-colors duration-200 group-hover:bg-[#F7C948]/80" />
      <span className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-[#4ECDC4]/35 transition-colors duration-200 group-hover:bg-[#F7C948]/50" />
      <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-[#4ECDC4] transition-colors duration-200 group-hover:text-[#F7C948]">
        Begin run
      </span>
      <span className="mt-1 block font-display text-xl tracking-[0.12em] text-[#F0EAD6]">
        START TRANSMISSION
      </span>
    </button>
  );
}
