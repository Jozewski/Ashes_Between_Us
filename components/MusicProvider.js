// components/MusicProvider.js
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Howl, Howler } from "howler";
import { MUSIC_TRACKS } from "@/lib/audioTracks";

const MUTED_STORAGE_KEY = "abu-muted";
// Old track ducks out fast so it's effectively a clean switch (a tiny fade,
// not a full crossfade, avoids an audible pop). New track eases in.
const FADE_OUT_MS = 250;
const FADE_IN_MS = 600;

const MusicContext = createContext(null);

// Module-level state for music playback. Living outside the component means it
// survives provider remounts (React Strict Mode in dev, route transitions),
// so previous tracks can ALWAYS be found and stopped before a new one starts.
let activeMusic = null; // { sound: Howl, key: string }
// Registry of every music Howl we've created. Used to sweep up orphans so two
// tracks can never play at once, even if a remount lost a reference.
const allMusicSounds = new Set();

function destroyMusic(sound, fadeMs) {
  if (!sound) return;
  allMusicSounds.delete(sound);
  try {
    const fromVolume = sound.volume();
    sound.fade(fromVolume, 0, fadeMs);
  } catch {
    // volume() can throw if the sound is mid-load; ignore and stop below.
  }
  setTimeout(() => {
    try {
      sound.stop();
      sound.unload();
    } catch {
      // already torn down
    }
  }, fadeMs + 80);
}

// Stop every music track except the one we want to keep. Guarantees a single
// active track regardless of how the previous ones were created.
function stopAllMusicExcept(keepSound, fadeMs) {
  for (const sound of [...allMusicSounds]) {
    if (sound !== keepSound) destroyMusic(sound, fadeMs);
  }
}

export function MusicProvider({ children }) {
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  // Restore persisted mute preference.
  useEffect(() => {
    const saved = window.localStorage.getItem(MUTED_STORAGE_KEY);
    if (saved !== null) {
      setMuted(saved === "true");
    }
  }, []);

  // Apply mute globally and persist it.
  useEffect(() => {
    Howler.mute(muted);
    window.localStorage.setItem(MUTED_STORAGE_KEY, String(muted));
  }, [muted]);

  const playMusic = useCallback((trackKey) => {
    const track = MUSIC_TRACKS[trackKey] || MUSIC_TRACKS.default;
    if (!track?.src) return;

    // Already playing this exact track — leave it alone so it keeps looping.
    if (activeMusic?.key === trackKey && activeMusic.sound?.playing()) {
      setStarted(true);
      return;
    }

    const targetVolume = track.volume ?? 0.35;

    const nextSound = new Howl({
      src: [track.src],
      loop: track.loop ?? true,
      volume: 0,
      html5: true,
      onloaderror: () => {
        // Missing/placeholder file — fail quietly so gameplay is unaffected.
        allMusicSounds.delete(nextSound);
        if (activeMusic?.sound === nextSound) {
          activeMusic = null;
        }
      },
      onplayerror: () => {
        // Autoplay was blocked; retry once the audio context unlocks.
        nextSound.once("unlock", () => nextSound.play());
      },
    });

    // Claim the singleton and register BEFORE stopping others, so any
    // concurrent call sees the new track and tears down the right ones.
    allMusicSounds.add(nextSound);
    activeMusic = { sound: nextSound, key: trackKey };

    // Hard-stop everything that isn't the new track (fast duck-out).
    stopAllMusicExcept(nextSound, FADE_OUT_MS);

    nextSound.play();
    nextSound.fade(0, targetVolume, FADE_IN_MS);

    setStarted(true);
  }, []);

  const stopMusic = useCallback(() => {
    activeMusic = null;
    stopAllMusicExcept(null, FADE_OUT_MS);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((current) => !current);
  }, []);

  const value = {
    muted,
    started,
    playMusic,
    stopMusic,
    toggleMute,
    setMuted,
  };

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used inside MusicProvider");
  }
  return context;
}
