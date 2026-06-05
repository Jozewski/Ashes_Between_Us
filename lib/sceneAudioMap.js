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

export function trackKeyForImage(imageUrl) {
  const baseName = getImageBaseName(imageUrl);
  if (!baseName) return "default";
  return IMAGE_NAME_TO_TRACK[baseName] ?? "default";
}
