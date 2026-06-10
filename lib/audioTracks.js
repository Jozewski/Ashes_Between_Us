// lib/audioTracks.js
//
// Central manifest of every music track in the game. Keys are referenced by
// the scenario loop / ending maps and by MusicProvider.playMusic(trackKey).
//
// To add a track: drop the file in public/audio/music/ and add an entry here.

export const MUSIC_TRACKS = {
  // Landing / start screen
  start: {
    src: "/audio/music/start-screen.mp3",
    loop: true,
    volume: 0.35,
  },

  // Fallback scenario loop when no mapping matches
  default: {
    src: "/audio/music/scenario-low-ruins.mp3",
    loop: true,
    volume: 0.32,
  },

  // ── Scenario mood loops ──────────────────────────────────────
  lowRuins: {
    src: "/audio/music/scenario-low-ruins.mp3",
    loop: true,
    volume: 0.32,
  },
  radioTension: {
    src: "/audio/music/scenario-radio-tension.mp3",
    loop: true,
    volume: 0.34,
  },
  bunkerDread: {
    src: "/audio/music/scenario-bunker-dread.mp3",
    loop: true,
    volume: 0.3,
  },
  chaosPercussion: {
    src: "/audio/music/scenario-chaos-percussion.mp3",
    loop: true,
    volume: 0.36,
  },
  desertHighway: {
    src: "/audio/music/scenario-desert-highway.mp3",
    loop: true,
    volume: 0.34,
  },
  forestHope: {
    src: "/audio/music/scenario-forest-hope.mp3",
    loop: true,
    volume: 0.34,
  },
  timelineMystery: {
    src: "/audio/music/scenario-timeline-mystery.mp3",
    loop: true,
    volume: 0.33,
  },

  // ── Ending stings (non-looping) ──────────────────────────────
  endingBalanced: {
    src: "/audio/music/ending-balanced.mp3",
    loop: false,
    volume: 0.4,
  },
  endingBroken: {
    src: "/audio/music/ending-broken.mp3",
    loop: false,
    volume: 0.4,
  },
  endingChaotic: {
    src: "/audio/music/ending-chaotic.mp3",
    loop: false,
    volume: 0.42,
  },
  endingRebuilding: {
    src: "/audio/music/ending-rebuilding.mp3",
    loop: false,
    volume: 0.42,
  },
};

