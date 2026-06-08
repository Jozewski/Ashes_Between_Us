export const AVATAR_IDS = [
  "scout",
  "medic",
  "engineer",
  "guardian",
  "diplomat",
  "scavenger",
];

export const SHARED_BACKGROUND_IMAGES = [
  "/images/backgrounds/bunker.png",
  "/images/backgrounds/desert-highway.png",
  "/images/backgrounds/forest-safe-zone.png",
  "/images/backgrounds/radio-tower.png",
  "/images/backgrounds/ruined-city.png",
  "/images/backgrounds/contested-resource-hearing.png",
  "/images/backgrounds/failed-rescue-witnesses.png",
  "/images/backgrounds/sabotaged-infrastructure-repair.png",
  "/images/backgrounds/public-reckoning-ritual.png",
  "/images/backgrounds/threatened-fog-market.png",
  "/images/backgrounds/limited-evacuation-convoy.png",
  "/images/backgrounds/quarantine-triage-dispute.png",
  "/images/backgrounds/misinformation-radio-room.png",
  "/images/backgrounds/shelter-leadership-vote.png",
  "/images/backgrounds/refugee-border-crossing.png",
  "/images/backgrounds/unclear-salvage-claim.png",
  "/images/backgrounds/weather-hidden-loyalties.png",
];

export const ENDING_IMAGES = [
  "/images/endings/ending-balanced-future.png",
  "/images/endings/ending-broken-future.png",
  "/images/endings/ending-chaotic-future.png",
  "/images/endings/ending-rebuilding-future.png",
];

export const SCENARIO_IMAGES_BY_AVATAR = {
  scout: [
    "avatar-scout-the-cartographers-debt.png",
    "avatar-scout-mountain-observation-point.png",
    "avatar-scout-hidden-convoy-route.png",
    "avatar-scout-weather-hidden-loyalties.png",
    "avatar-scout-radio-signal-echo.png",
    "avatar-scout-abandoned-watch-post.png",
    "avatar-scout-failed-rescue-witnesses.png",
    "avatar-scout-misinformation-radio-room.png",
    "avatar-scout-refugee-border-crossing.png",
    "avatar-scout-limited-evacuation-convoy.png",
  ],
  medic: [
    "avatar-medic-fever-ward-overflow.png",
    "avatar-medic-vaccine-lottery.png",
    "avatar-medic-limited-evacuation-convoy.png",
    "avatar-medic-last-antibiotic.png",
    "avatar-medic-refugee-border-crossing.png",
    "avatar-medic-orphaned-patient.png",
    "avatar-medic-public-reckoning-ritual.png",
    "avatar-medic-quarantine-triage-dispute.png",
    "avatar-medic-collapse-of-the-clinic.png",
    "avatar-medic-failed-rescue-witnesses.png",
  ],
  engineer: [
    "avatar-engineer-last-working-generator.png",
    "avatar-engineer-failing-water-grid.png",
    "avatar-engineer-bridge-restoration-project.png",
    "avatar-engineer-shelter-leadership-vote.png",
    "avatar-engineer-sabotaged-infrastructure-repair.png",
    "avatar-engineer-unclear-salvage-claim.png",
    "avatar-engineer-damaged-solar-array.png",
    "avatar-engineer-contested-resource-hearing.png",
    "avatar-engineer-reactor-cooling-failure.png",
    "avatar-engineer-misinformation-radio-room.png",
  ],
  guardian: [
    "avatar-guardian-refugee-border-crossing.png",
    "avatar-guardian-barricade-under-siege.png",
    "avatar-guardian-night-watch-breach.png",
    "avatar-guardian-public-reckoning-ritual.png",
    "avatar-guardian-shelter-defense-line.png",
    "avatar-guardian-convoy-escort-mission.png",
    "avatar-guardian-limited-evacuation-convoy.png",
    "avatar-guardian-weather-hidden-loyalties.png",
    "avatar-guardian-last-safe-passage.png",
    "avatar-guardian-failed-rescue-witnesses.png",
  ],
  diplomat: [
    "avatar-diplomat-disputed-water-rights.png",
    "avatar-diplomat-unclear-salvage-claim.png",
    "avatar-diplomat-border-treaty-negotiation.png",
    "avatar-diplomat-council-of-rivals.png",
    "avatar-diplomat-contested-resource-hearing.png",
    "avatar-diplomat-shelter-leadership-vote.png",
    "avatar-diplomat-misinformation-radio-room.png",
    "avatar-diplomat-the-last-neutral-ground.png",
    "avatar-diplomat-public-reckoning-ritual.png",
    "avatar-diplomat-shared-harvest-accord.png",
  ],
  scavenger: [
    "avatar-scavenger-forgotten-warehouse.png",
    "avatar-scavenger-black-market-auction.png",
    "avatar-scavenger-buried-supply-truck.png",
    "avatar-scavenger-threatened-fog-market.png",
    "avatar-scavenger-refugee-border-crossing.png",
    "avatar-scavenger-unclear-salvage-claim.png",
    "avatar-scavenger-weather-hidden-loyalties.png",
    "avatar-scavenger-limited-evacuation-convoy.png",
    "avatar-scavenger-scrapyard-ownership-dispute.png",
    "avatar-scavenger-abandoned-fuel-depot.png",
  ],
};

export const IMAGE_MATCH_ALIASES = {
  "contested-resource-hearing": [
    "contested resource hearing",
    "resource hearing",
    "public hearing",
    "ration hearing",
    "water rights hearing",
    "resource dispute",
    "council hearing",
  ],
  "failed-rescue-witnesses": [
    "failed rescue",
    "rescue witnesses",
    "collapsed rescue",
    "witnesses",
    "overpass rescue",
    "rescue scene",
  ],
  "sabotaged-infrastructure-repair": [
    "sabotaged infrastructure",
    "infrastructure repair",
    "repair site",
    "aqueduct repair",
    "floodgate repair",
    "damaged machinery",
  ],
  "public-reckoning-ritual": [
    "public reckoning",
    "ritual",
    "trial",
    "oath ceremony",
    "public punishment",
    "reckoning",
  ],
  "threatened-fog-market": [
    "fog market",
    "threatened market",
    "market",
    "barter market",
    "black market",
    "traders",
  ],
  "limited-evacuation-convoy": [
    "limited evacuation",
    "evacuation convoy",
    "convoy",
    "too few seats",
    "fuel carriers",
    "transport",
  ],
  "quarantine-triage-dispute": [
    "quarantine",
    "triage",
    "clinic",
    "medical dispute",
    "infection",
    "medicine",
    "ward",
  ],
  "misinformation-radio-room": [
    "misinformation",
    "radio room",
    "radio",
    "broadcast",
    "signal",
    "false warning",
    "accused broadcaster",
  ],
  "shelter-leadership-vote": [
    "shelter vote",
    "leadership vote",
    "vote",
    "council",
    "ballots",
    "governance",
  ],
  "refugee-border-crossing": [
    "refugee border",
    "border crossing",
    "refugees",
    "checkpoint",
    "guards",
    "crossing",
  ],
  "unclear-salvage-claim": [
    "salvage claim",
    "unclear claim",
    "salvage yard",
    "resource claim",
    "scrap",
    "ownership dispute",
  ],
  "weather-hidden-loyalties": [
    "weather disaster",
    "hidden loyalties",
    "storm",
    "mountain storm",
    "flash flood",
    "forced shelter",
  ],
  "the-cartographers-debt": [
    "cartographer",
    "maps",
    "lost maps",
    "route debt",
    "map room",
  ],
  "mountain-observation-point": [
    "mountain observation",
    "observation point",
    "lookout",
    "high vantage",
    "watch ridge",
  ],
  "hidden-convoy-route": [
    "hidden convoy route",
    "hidden route",
    "convoy route",
    "secret path",
    "unmarked road",
  ],
  "radio-signal-echo": [
    "radio signal echo",
    "signal echo",
    "radio signal",
    "triangulation",
  ],
  "abandoned-watch-post": [
    "abandoned watch post",
    "watch post",
    "lookout post",
    "observation tower",
  ],
  "fever-ward-overflow": ["fever ward", "overflow ward", "sick ward", "disease outbreak"],
  "vaccine-lottery": ["vaccine lottery", "vaccine", "lottery", "medicine allocation"],
  "last-antibiotic": ["last antibiotic", "antibiotic", "scarce medicine"],
  "orphaned-patient": ["orphaned patient", "patient", "child patient"],
  "collapse-of-the-clinic": ["clinic collapse", "collapsed clinic", "clinic failure"],
  "last-working-generator": ["last working generator", "generator", "power failure"],
  "failing-water-grid": ["failing water grid", "water grid", "water system"],
  "bridge-restoration-project": ["bridge restoration", "bridge repair", "restoration project"],
  "damaged-solar-array": ["damaged solar array", "solar array", "solar panels"],
  "reactor-cooling-failure": ["reactor cooling", "cooling failure", "reactor"],
  "barricade-under-siege": ["barricade", "siege", "under siege", "gate attack"],
  "last-safe-passage": ["last safe passage", "safe passage", "escape route"],
  "shelter-defense-line": ["defense line", "shelter defense", "perimeter"],
  "convoy-escort-mission": ["convoy escort", "escort mission", "escort"],
  "night-watch-breach": ["night watch", "breach", "perimeter breach"],
  "border-treaty-negotiation": ["border treaty", "treaty negotiation", "negotiation"],
  "council-of-rivals": ["council of rivals", "rival council", "council"],
  "disputed-water-rights": ["disputed water rights", "water rights", "water dispute"],
  "the-last-neutral-ground": ["last neutral ground", "neutral ground", "neutral zone"],
  "shared-harvest-accord": ["shared harvest", "harvest accord", "accord"],
  "abandoned-fuel-depot": ["fuel depot", "abandoned fuel depot", "fuel"],
  "buried-supply-truck": ["buried supply truck", "supply truck", "buried truck"],
  "black-market-auction": ["black market auction", "auction", "black market"],
  "forgotten-warehouse": ["forgotten warehouse", "warehouse"],
  "scrapyard-ownership-dispute": ["scrapyard", "ownership dispute", "scrap yard"],
};

export function getAvatarScenarioImages(avatarId) {
  return (SCENARIO_IMAGES_BY_AVATAR[avatarId] ?? []).map(
    (fileName) => `/images/scenarios/${avatarId}/${fileName}`,
  );
}

export function getImageSlug(imageUrl) {
  return imageUrl
    .split("/")
    .pop()
    ?.replace(/\.[^.]+$/, "")
    .replace(/^avatar-[a-z]+-/, "") ?? "";
}

export function getImageMatchAliases(imageUrl) {
  const slug = getImageSlug(imageUrl);
  return IMAGE_MATCH_ALIASES[slug] ?? [];
}

export function getAvatarSceneLabels(avatarId) {
  return getAvatarScenarioImages(avatarId).map(getImageSlug);
}

export function getSeedScenarioImage({ avatarId, scenarioIndex }) {
  const fileName = SCENARIO_IMAGES_BY_AVATAR[avatarId]?.[scenarioIndex] ?? null;
  return fileName ? `/images/scenarios/${avatarId}/${fileName}` : null;
}

export function getSelectableScenarioImages(avatarId) {
  const avatarImages = getAvatarScenarioImages(avatarId);
  return [...avatarImages, ...SHARED_BACKGROUND_IMAGES, ...ENDING_IMAGES];
}
