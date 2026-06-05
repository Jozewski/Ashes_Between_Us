// lib/endingAudioMap.js
//
// Maps a derived ending state (see lib/endingEngine.js deriveEndingState)
// to a music track key from lib/audioTracks.js.

const ENDING_STATE_TO_TRACK = {
  balanced: "endingBalanced",
  broken: "endingBroken",
  chaotic: "endingChaotic",
  rebuilding: "endingRebuilding",
};

export function trackKeyForEnding(endingState) {
  return ENDING_STATE_TO_TRACK[endingState] ?? "endingBalanced";
}
