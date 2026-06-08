export const AVATAR_WRITING_GUIDES = {
  scout: {
    identity:
      "Observer, pathfinder, reconnaissance specialist, watcher of patterns, keeper of maps and secrets.",
    themes:
      "information over force, warning others before danger arrives, discovery, navigation, hidden truths, surveillance, long-term consequences",
    verbs:
      "observe, track, survey, scout, map, shadow, signal, monitor, follow, detect, reconnoiter, identify, locate, trace, investigate, navigate, watch, anticipate, discover, reveal",
    keywords:
      "radio signals, observation towers, footprints, convoys, hidden routes, lookouts, weather patterns, surveillance, recon missions, border crossings, unmarked roads, lost maps, secret paths, abandoned watch posts",
    decisionStyle:
      "gather information first, avoid unnecessary conflict, understand before acting, use knowledge as leverage, prevent disasters through awareness",
    sceneFrames: [
      "abandoned watch post above a disputed convoy route",
      "lost map room where two hidden routes contradict each other",
      "border crossing watched from a ruined observation tower",
      "weather pattern reconnaissance before an evacuation",
      "radio signal triangulation that reveals a trap",
      "footprint trail leading away from an official rescue path",
    ],
  },
  medic: {
    identity:
      "Healer, caretaker, protector of life, moral compass during collapse.",
    themes:
      "compassion, sacrifice, human dignity, mercy, recovery, preservation of life, ethical dilemmas",
    verbs:
      "treat, heal, stabilize, triage, comfort, preserve, diagnose, rescue, assist, protect, care, recover, rehabilitate, sustain, save, support, relieve, restore, nourish, console",
    keywords:
      "quarantine, clinics, medicine, infection, refugees, wounded survivors, scarcity, medical supplies, triage stations, disease outbreaks, emergency care, recovery shelters, vaccine stores, hospice care",
    decisionStyle:
      "save as many as possible, protect vulnerable people, balance limited resources, prioritize humanity, consider long-term suffering",
    sceneFrames: [
      "quarantine clinic with medicine for only one ward",
      "triage station after a failed rescue",
      "vaccine store claimed by armed refugees and sick children",
      "recovery shelter facing an infection rumor",
      "hospice room where mercy and ration policy collide",
      "field clinic deciding who can survive transport",
    ],
  },
  engineer: {
    identity:
      "Builder, inventor, systems thinker, rebuilder of civilization.",
    themes:
      "infrastructure, problem solving, innovation, restoration, efficiency, technology, resource management",
    verbs:
      "repair, construct, rebuild, stabilize, calibrate, power, reinforce, maintain, design, restore, improve, upgrade, reroute, develop, assemble, fortify, fabricate, optimize, reinvent, engineer",
    keywords:
      "generators, aqueducts, power grids, workshops, water systems, radio networks, infrastructure, salvaged technology, floodgates, solar arrays, communication systems, mechanical failures, resource distribution",
    decisionStyle:
      "solve root problems, maximize efficiency, think in systems, build sustainable solutions, trade short-term comfort for long-term stability",
    sceneFrames: [
      "failing generator room powering two rival shelters",
      "cracked aqueduct repair where one valve can save one district",
      "solar array workshop under threat of sabotage",
      "water distribution grid with a hidden mechanical failure",
      "radio network relay that can be repaired or rerouted",
      "floodgate control house during a cascading failure",
    ],
  },
  guardian: {
    identity:
      "Protector, defender, shield of the community, keeper of order.",
    themes:
      "security, duty, courage, leadership under pressure, protection, responsibility, sacrifice",
    verbs:
      "defend, secure, protect, escort, fortify, guard, hold, shield, patrol, confront, intervene, rescue, safeguard, defeat, prevent, contain, stand, endure, watch",
    keywords:
      "convoys, raids, barricades, checkpoints, settlements, security patrols, defense lines, refugee protection, armed threats, shelter security, perimeter breaches, escort missions",
    decisionStyle:
      "protect people first, maintain order, neutralize threats, accept personal risk, prioritize safety over comfort",
    sceneFrames: [
      "checkpoint breach while refugees press against the barricade",
      "escort convoy pinned between raiders and civilians",
      "shelter perimeter alarm during a leadership argument",
      "security patrol finding a traitor near the defense line",
      "settlement gate where order and cruelty look similar",
      "raid aftermath with one safe route left to hold",
    ],
  },
  diplomat: {
    identity:
      "Negotiator, alliance builder, political strategist, voice of cooperation.",
    themes:
      "unity, negotiation, trust, leadership, governance, community, peace",
    verbs:
      "negotiate, mediate, convince, broker, unify, persuade, arbitrate, coordinate, resolve, discuss, advocate, reconcile, communicate, facilitate, collaborate, organize, lead, influence, represent, build consensus",
    keywords:
      "public hearings, leadership votes, alliances, treaties, resource disputes, community councils, political factions, negotiations, oaths, settlements, border agreements, shared resources",
    decisionStyle:
      "seek compromise, reduce conflict, build trust, create long-term alliances, balance competing interests",
    sceneFrames: [
      "public hearing over shared water rights",
      "leadership vote during a shelter blackout",
      "treaty table where one faction arrives with stolen proof",
      "border agreement threatened by a rumor",
      "community council split over punishment and mercy",
      "oath ceremony between settlements with incompatible demands",
    ],
  },
  scavenger: {
    identity:
      "Survivor, opportunist, trader, expert of the ruins.",
    themes:
      "adaptability, resourcefulness, survival, opportunity, risk, trade, exploration",
    verbs:
      "salvage, recover, trade, barter, claim, gather, scavenge, acquire, explore, search, extract, negotiate, discover, secure, smuggle, transport, locate, unearth, collect, profit",
    keywords:
      "markets, supply caches, trade routes, salvage yards, abandoned vehicles, black markets, lost cargo, smuggling, ruins, resource claims, fuel depots, scrap fields, forgotten warehouses",
    decisionStyle:
      "find value where others cannot, balance profit against morality, take calculated risks, adapt quickly, turn scarcity into opportunity",
    sceneFrames: [
      "salvage yard where three crews claim the same cache",
      "black market fuel auction with a hidden refugee need",
      "forgotten warehouse mapped by old trade markings",
      "abandoned vehicle convoy loaded with disputed cargo",
      "smuggling route that can save lives or enrich your crew",
      "scrap field where one find changes the settlement economy",
    ],
  },
};

export function getAvatarWritingGuide(avatarId) {
  return AVATAR_WRITING_GUIDES[avatarId] ?? null;
}

export function formatAvatarWritingGuide(avatarId) {
  const guide = getAvatarWritingGuide(avatarId);
  if (!guide) {
    return "No avatar-specific vocabulary guide found. Use the avatar trait and backstory strongly.";
  }

  return [
    `Core identity: ${guide.identity}`,
    `Primary themes: ${guide.themes}`,
    `Use vocabulary from: ${guide.verbs}`,
    `Scenario objects/places: ${guide.keywords}`,
    `Decision style: ${guide.decisionStyle}`,
    "Writing rule: this scenario should be recognizable by avatar identity alone.",
  ].join("\n");
}

export function pickAvatarSceneFrame(avatarId, signal) {
  const frames = getAvatarWritingGuide(avatarId)?.sceneFrames;
  if (!Array.isArray(frames) || frames.length === 0) return null;

  return frames[Math.abs(signal) % frames.length];
}

export function getAvatarFallbackChoices(avatarId) {
  const choices = {
    scout: [
      {
        text: "Map the hidden route before committing anyone.",
        outcome:
          "Your delay reveals a second trail and fresh bootprints. The group avoids a trap, though some resent waiting.",
        hopeChange: 2,
        trustChange: 4,
        chaosChange: -5,
        humanityChange: 1,
      },
      {
        text: "Signal the convoy with only verified coordinates.",
        outcome:
          "The warning reaches fewer people, but the ones who move do not walk into false ground.",
        hopeChange: 3,
        trustChange: 5,
        chaosChange: -3,
        humanityChange: 2,
      },
    ],
    medic: [
      {
        text: "Triage openly and explain every painful priority.",
        outcome:
          "The line hates the answer, but not the honesty. More survive because panic stops stealing minutes.",
        hopeChange: 3,
        trustChange: 5,
        chaosChange: -4,
        humanityChange: 6,
      },
      {
        text: "Use medicine on the vulnerable instead of the useful.",
        outcome:
          "You save someone with no strategic value. The room remembers that worth still means more than output.",
        hopeChange: 4,
        trustChange: 2,
        chaosChange: 1,
        humanityChange: 8,
      },
    ],
    engineer: [
      {
        text: "Repair the root failure, not the loudest symptom.",
        outcome:
          "The fix takes longer and helps fewer people tonight. Tomorrow, the whole system stops bleeding resources.",
        hopeChange: 4,
        trustChange: 1,
        chaosChange: -5,
        humanityChange: 1,
      },
      {
        text: "Reroute power from comfort to critical systems.",
        outcome:
          "Lights go out in warm rooms so pumps and radios stay alive. People complain, then drink clean water.",
        hopeChange: 5,
        trustChange: -1,
        chaosChange: -4,
        humanityChange: 2,
      },
    ],
    guardian: [
      {
        text: "Hold the line while civilians move first.",
        outcome:
          "Your stand buys enough seconds for the vulnerable to pass. The threat learns where the shield is.",
        hopeChange: 4,
        trustChange: 5,
        chaosChange: 2,
        humanityChange: 4,
      },
      {
        text: "Disarm the aggressors before negotiating terms.",
        outcome:
          "Order returns fast and bruised. The settlement is safer, but some hear protection speaking in fear's voice.",
        hopeChange: 1,
        trustChange: -2,
        chaosChange: -6,
        humanityChange: -2,
      },
    ],
    diplomat: [
      {
        text: "Bring every faction into one binding vote.",
        outcome:
          "The result is slower and harder to betray. Even the losers helped build the rule that binds them.",
        hopeChange: 5,
        trustChange: 7,
        chaosChange: -3,
        humanityChange: 4,
      },
      {
        text: "Trade a symbolic concession for lasting cooperation.",
        outcome:
          "You lose something visible and gain something structural. The alliance begins with pride wounded but intact.",
        hopeChange: 4,
        trustChange: 6,
        chaosChange: -2,
        humanityChange: 3,
      },
    ],
    scavenger: [
      {
        text: "Claim the overlooked cache before rivals price it.",
        outcome:
          "Your crew gains leverage from what others missed. The question becomes whether leverage feeds only your own.",
        hopeChange: 3,
        trustChange: -3,
        chaosChange: 2,
        humanityChange: -1,
      },
      {
        text: "Barter the rare find for safe passage.",
        outcome:
          "The deal opens a route no speech could. Profit becomes protection, but everyone knows what you kept back.",
        hopeChange: 2,
        trustChange: -2,
        chaosChange: -3,
        humanityChange: 1,
      },
    ],
  };

  return choices[avatarId] ?? [];
}
