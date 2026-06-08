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
  "weather-hidden-loyalties": "chaosPercussion",
  "contested-resource-hearing": "timelineMystery",
  "limited-evacuation-convoy": "timelineMystery",
  "refugee-border-crossing": "timelineMystery",
  "failed-rescue-witnesses": "lowRuins",
  "sabotaged-infrastructure-repair": "bunkerDread",
  "public-reckoning-ritual": "timelineMystery",
  "threatened-fog-market": "desertHighway",
  "quarantine-triage-dispute": "bunkerDread",
  "misinformation-radio-room": "radioTension",
  "shelter-leadership-vote": "timelineMystery",
  "unclear-salvage-claim": "desertHighway",

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

function getTrackLookupNames(imageUrl) {
  const baseName = getImageBaseName(imageUrl);
  if (!baseName) return [];
  const avatarlessName = baseName.replace(/^avatar-[a-z]+-/, "");
  return avatarlessName === baseName ? [baseName] : [baseName, avatarlessName];
}

// Resolve a scenario background image to a music track key. Any image that is
// not explicitly mapped falls back to "default" — which is a real, audible
// loop in lib/audioTracks.js — so a scenario can never be silent, regardless
// of whether the image came from seed data or live AI generation.
export function trackKeyForImage(imageUrl) {
  for (const name of getTrackLookupNames(imageUrl)) {
    if (IMAGE_NAME_TO_TRACK[name]) return IMAGE_NAME_TO_TRACK[name];
  }
  return "default";
}

// True when an image has its own dedicated track (i.e. it does NOT fall back
// to the default loop). Used to keep the AI's selectable background list in
// sync with the audio map so generated scenarios always get matched music.
export function hasDedicatedTrack(imageUrl) {
  return getTrackLookupNames(imageUrl).some((name) => name in IMAGE_NAME_TO_TRACK);
}
