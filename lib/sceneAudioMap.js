// lib/sceneAudioMap.js
//
// Maps each scenario background image to a music track key from
// lib/audioTracks.js. Music follows the picture so audio and visuals
// always stay in sync, regardless of which scenario is drawn.
//
// Only the file name is matched (path and extension are ignored), so both
// "/images/backgrounds/ruined-city.png" and any future location resolve the
// same way.

const IMAGE_NAME_TO_TRACK = {
  // Backgrounds
  "ruined-city": "lowRuins",
  "bunker": "bunkerDread",
  "forest-safe-zone": "forestHope",
  "radio-tower": "radioTension",
  "desert-highway": "desertHighway",

  // Skyscapes — ethereal / uncertain
  "aurora-mountain-storm": "chaosPercussion",
  "aurora-lake-sunset": "timelineMystery",
  "aurora-winter-forest": "timelineMystery",
  "aurora-coastal-beacon": "timelineMystery",

  // Outcome "future" vistas used as late-game scenario backgrounds
  "ending-rebuilding-future": "forestHope",
  "ending-balanced-future": "timelineMystery",
  "ending-chaotic-future": "chaosPercussion",
  "ending-broken-future": "lowRuins",
};

function getImageBaseName(imageUrl) {
  if (typeof imageUrl !== "string" || !imageUrl) return null;
  const fileName = imageUrl.split("/").pop() ?? "";
  return fileName.replace(/\.[^.]+$/, "").toLowerCase();
}

// Resolve a scenario background image to a music track key. Any image that is
// not explicitly mapped falls back to "default" — which is a real, audible
// loop in lib/audioTracks.js — so a scenario can never be silent, regardless
// of whether the image came from seed data or live AI generation.
export function trackKeyForImage(imageUrl) {
  const baseName = getImageBaseName(imageUrl);
  if (!baseName) return "default";
  return IMAGE_NAME_TO_TRACK[baseName] ?? "default";
}

// True when an image has its own dedicated track (i.e. it does NOT fall back
// to the default loop). Used to keep the AI's selectable background list in
// sync with the audio map so generated scenarios always get matched music.
export function hasDedicatedTrack(imageUrl) {
  const baseName = getImageBaseName(imageUrl);
  return baseName != null && baseName in IMAGE_NAME_TO_TRACK;
}
