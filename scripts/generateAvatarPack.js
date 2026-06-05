import fs from "fs";
import path from "path";

const avatarId = (process.argv[2] || "").trim().toLowerCase();
const total = Number(process.argv[3] || 60);

if (!avatarId) {
  throw new Error("Usage: node scripts/generateAvatarPack.js <avatarId> [count]");
}

const validAvatars = new Set([
  "scout",
  "medic",
  "engineer",
  "guardian",
  "diplomat",
  "scavenger",
]);

if (!validAvatars.has(avatarId)) {
  throw new Error(`Invalid avatarId: ${avatarId}`);
}

if (!Number.isInteger(total) || total < 1) {
  throw new Error(`Invalid count: ${total}`);
}

const imagePool = [
  "/images/backgrounds/radio-tower.png",
  "/images/backgrounds/ruined-city.png",
  "/images/backgrounds/forest-safe-zone.png",
  "/images/backgrounds/desert-highway.png",
  "/images/backgrounds/bunker.png",
];

const zones = [
  "relay ridge",
  "dry canal",
  "subway junction",
  "collapsed overpass",
  "grain terminal",
  "water district",
  "museum vault",
  "solar field",
  "rail depot",
  "watchline park",
  "signal quarry",
  "river barricade",
];

const threats = [
  "raider scouts",
  "ash storm fronts",
  "signal spoofers",
  "bridge snipers",
  "drone sweep patterns",
  "infected stragglers",
  "supply thieves",
  "false distress calls",
  "flood surges",
  "fuel riots",
  "checkpoint corruption",
  "tower blackouts",
];

const objectives = [
  "secure a safe corridor",
  "verify a refugee rumor",
  "recover map fragments",
  "open a low-risk trade lane",
  "mark an evacuation route",
  "observe militia movement",
  "track missing couriers",
  "locate clean-water points",
  "confirm a weather window",
  "prepare a silent extraction",
  "audit relay integrity",
  "protect medical convoys",
];

const medicClinics = [
  "triage annex",
  "field infirmary",
  "cold-storage clinic",
  "checkpoint aid tent",
  "shelter isolation wing",
  "mobile trauma bay",
  "riverfront treatment post",
  "schoolhouse recovery ward",
  "underground pharmacy",
  "junction emergency station",
];

const medicPressures = [
  "oxygen reserve collapse",
  "antibiotic shortage",
  "fever cluster spike",
  "burn-case overflow",
  "waterborne infection surge",
  "power loss for refrigeration",
  "staff exhaustion cascade",
  "supply convoy delay",
  "triage capacity breach",
  "contamination zone expansion",
];

const medicGoals = [
  "stabilize critical patients",
  "distribute medicines fairly",
  "prevent infection spread",
  "restore emergency protocols",
  "secure supply chains",
  "triage incoming wounded",
  "document treatment outcomes",
  "maintain staff morale",
  "coordinate with other clinics",
  "prepare contingency plans",
];

const engineerFacilities = [
  "water treatment plant",
  "power substation",
  "communications tower",
  "fuel distribution hub",
  "shelter structural supports",
  "irrigation canal network",
  "waste containment system",
  "medical supply sterilization",
  "renewable energy station",
  "bridge reinforcement project",
];

const engineerFailures = [
  "pump seal rupture",
  "electrical grid cascade failure",
  "structural fatigue cracking",
  "chemical spill containment breach",
  "backup generator fuel depletion",
  "water pipeline freeze risk",
  "solar panel reflective corrosion",
  "communications antenna misalignment",
  "waste system backup overflow",
  "foundation settlement acceleration",
];

const engineerObjectives = [
  "restore water pressure to safe levels",
  "rebuild power distribution redundancy",
  "repair structural load-bearing walls",
  "prevent hazardous chemical leaks",
  "restore reliable fuel supply flow",
  "prevent infrastructure cascade failure",
  "improve emergency response systems",
  "reduce maintenance downtime",
  "increase system resilience",
  "document repair procedures",
];

const guardianFronts = [
  "north perimeter line",
  "south entry checkpoint",
  "east corridor junction",
  "west shelter approaches",
  "central plaza control",
  "refugee screening zone",
  "supply route authority",
  "medical access gates",
  "emergency evacuation pathways",
  "scout patrol rally points",
];

const guardianRisks = [
  "militia reconnaissance probe",
  "civilian panic stampede risk",
  "armed group territorial claim",
  "false refugee infiltration attempt",
  "supply convoy interception threat",
  "perimeter defense fatigue breakdown",
  "unauthorized access corridor breach",
  "weapon cache discovery panic",
  "retaliation threat chatter",
  "curfew breakdown",
  "gate breach feint",
];

const guardianObjectives = [
  "protect vulnerable civilians",
  "hold perimeter discipline",
  "reduce escalation risk",
  "maintain fair entry control",
  "prevent retaliatory cycles",
  "stabilize shelter access",
  "secure aid distribution",
  "keep medevac lanes clear",
  "preserve trust under pressure",
  "avoid unnecessary force",
];

const diplomatTables = [
  "water-sharing council",
  "corridor ceasefire forum",
  "aid allocation chamber",
  "trade terms assembly",
  "refugee rights hearing",
  "cross-camp mediation hall",
  "border protocol summit",
  "resource audit roundtable",
  "hostage release channel",
  "coalition continuity council",
];

const diplomatConflicts = [
  "ration theft accusations",
  "border crossing disputes",
  "water quota violations",
  "escort duty refusals",
  "aid convoy extortion claims",
  "retaliation demand pressure",
  "black-market permit abuse",
  "medical access discrimination",
  "ceasefire breach allegations",
  "representation legitimacy challenges",
];

const diplomatAims = [
  "preserve coalition trust",
  "de-escalate armed tension",
  "secure transparent quotas",
  "protect neutral access routes",
  "prevent revenge spirals",
  "stabilize inter-camp trade",
  "keep ceasefire verification credible",
  "defend minority camp rights",
  "restore procedural legitimacy",
  "close exploitative loopholes",
];

const scavengerSites = [
  "collapsed warehouse district",
  "sealed vault compound",
  "flooded basement network",
  "overgrown industrial park",
  "radioactive slag heap",
  "contamination zone perimeter",
  "mine shaft tunnel system",
  "buried fuel depot",
  "wrecked supply train",
  "abandoned research facility",
];

const scavengerHazards = [
  "structural collapse risk",
  "toxic exposure warning",
  "unexploded ordnance presence",
  "rival crew territorial claim",
  "equipment failure cascade",
  "contaminated water seepage",
  "looter gang interception",
  "sealed gate lockdown",
  "radiation spike alerts",
  "supply cache theft",
];

const scavengerMissions = [
  "secure critical medicines",
  "recover fuel reserves",
  "extract working electronics",
  "salvage construction materials",
  "gather water-treatment filters",
  "liberate food stocks",
  "find textile and clothing",
  "locate battery packs",
  "rescue trapped supplies",
  "map new resource zones",
];

const archetypes = {
  scout: {
    roleLabel: "recon lead",
    context: "Long-range observation and route control define this operation.",
  },
  medic: {
    roleLabel: "field medic",
    context: "Clinical triage and medicine distribution determine survivability.",
  },
  engineer: {
    roleLabel: "systems engineer",
    context: "Infrastructure stability and repair sequencing are the main constraints.",
  },
  guardian: {
    roleLabel: "perimeter guardian",
    context: "Security posture and civilian protection create the core tension.",
  },
  diplomat: {
    roleLabel: "civil envoy",
    context: "Alliance trust, mediation, and legitimacy are in play.",
  },
  scavenger: {
    roleLabel: "resource scout",
    context: "Acquisition logistics and scarcity ethics drive each decision.",
  },
};

const choiceTemplates = {
  scout: [
    {
      id: "a",
      text: "Broadcast a public route update.",
      outcome: "Civilians move faster, but hostile groups triangulate your path.",
      delta: { hope: 7, trust: -2, chaos: 8, humanity: 1 },
    },
    {
      id: "b",
      text: "Share coordinates only with trusted allies.",
      outcome: "Your core network strengthens and movement stays controlled.",
      delta: { hope: 3, trust: 7, chaos: -2, humanity: 2 },
    },
    {
      id: "c",
      text: "Hold position and gather more intel.",
      outcome: "You reduce uncertainty but lose critical momentum.",
      delta: { hope: -1, trust: 2, chaos: -1, humanity: -1 },
    },
    {
      id: "d",
      text: "Deploy a decoy path to mislead threats.",
      outcome: "Immediate danger drops, though your ethics take a hit.",
      delta: { hope: 1, trust: -3, chaos: -3, humanity: -2 },
    },
    {
      id: "e",
      text: "Escort vulnerable survivors first.",
      outcome: "You protect lives now, at the cost of tactical flexibility.",
      delta: { hope: 5, trust: 4, chaos: -1, humanity: 6 },
    },
    {
      id: "f",
      text: "Cut lights and move the team silently overnight.",
      outcome: "You avoid detection but morale and visibility both drop.",
      delta: { hope: -3, trust: 1, chaos: -2, humanity: -1 },
    },
  ],
  medic: [
    {
      id: "a",
      text: "Treat acute cases first, strict triage protocol.",
      outcome: "Critical patients stabilize, but some chronic conditions worsen.",
      delta: { hope: 4, trust: 6, chaos: -1, humanity: 3 },
    },
    {
      id: "b",
      text: "Distribute medications evenly across all cases.",
      outcome: "More people improve gradually, but acute risk remains high.",
      delta: { hope: 2, trust: 5, chaos: 2, humanity: 4 },
    },
    {
      id: "c",
      text: "Focus resources on the most salvageable cases.",
      outcome: "Success rate improves for chosen patients, but others suffer.",
      delta: { hope: 3, trust: -2, chaos: 1, humanity: -4 },
    },
    {
      id: "d",
      text: "Request emergency supply airlift and ration carefully.",
      outcome: "Supply arrives but creates dependency and logistics strain.",
      delta: { hope: 5, trust: 2, chaos: 2, humanity: 3 },
    },
    {
      id: "e",
      text: "Train non-medics as emergency responders.",
      outcome: "Coverage expands but error risk increases.",
      delta: { hope: 3, trust: 3, chaos: 1, humanity: 2 },
    },
    {
      id: "f",
      text: "Implement quarantine protocol immediately.",
      outcome: "Disease containment works but triggers public fear.",
      delta: { hope: -2, trust: 1, chaos: -1, humanity: -2 },
    },
  ],
  engineer: [
    {
      id: "a",
      text: "Run emergency repairs on critical systems only.",
      outcome: "Vital functions restore, but secondary infrastructure fails.",
      delta: { hope: 5, trust: 3, chaos: -2, humanity: 2 },
    },
    {
      id: "b",
      text: "Implement a staged repair timeline across all systems.",
      outcome: "Everything improves gradually, but resilience gaps remain.",
      delta: { hope: 3, trust: 5, chaos: 0, humanity: 3 },
    },
    {
      id: "c",
      text: "Recruit more hands and speed up all repairs.",
      outcome: "Faster progress, but mistakes and injuries increase.",
      delta: { hope: 4, trust: 2, chaos: 3, humanity: 1 },
    },
    {
      id: "d",
      text: "Salvage parts from non-essential systems.",
      outcome: "Priority systems revive, but new bottlenecks form.",
      delta: { hope: 3, trust: -1, chaos: 1, humanity: -2 },
    },
    {
      id: "e",
      text: "Document procedures and train others for future maintenance.",
      outcome: "System knowledge spreads but immediate repairs slow down.",
      delta: { hope: 2, trust: 6, chaos: -1, humanity: 3 },
    },
    {
      id: "f",
      text: "Accept partial failures and reinforce remaining systems.",
      outcome: "You stabilize what works but lose some capacity.",
      delta: { hope: 1, trust: 2, chaos: -2, humanity: 1 },
    },
  ],
  guardian: [
    {
      id: "a",
      text: "Open access immediately and absorb risk.",
      outcome: "You protect many people quickly, but hostile infiltration risk rises.",
      delta: { hope: 7, trust: 2, chaos: 6, humanity: 6 },
    },
    {
      id: "b",
      text: "Run strict screening lanes with clear rules.",
      outcome: "Order holds and trust improves, though tempers spike at delays.",
      delta: { hope: 4, trust: 7, chaos: -2, humanity: 3 },
    },
    {
      id: "c",
      text: "Escort high-risk civilians through a protected corridor.",
      outcome: "Critical lives are protected while perimeter resources thin out.",
      delta: { hope: 6, trust: 4, chaos: 0, humanity: 7 },
    },
    {
      id: "d",
      text: "Lock down entry and hold defensive posture.",
      outcome: "Threat exposure drops, but community trust and morale deteriorate.",
      delta: { hope: -4, trust: -3, chaos: -1, humanity: -5 },
    },
    {
      id: "e",
      text: "Negotiate de-escalation terms with opposing scouts.",
      outcome: "Immediate violence risk falls and breathing room opens.",
      delta: { hope: 3, trust: 5, chaos: -3, humanity: 4 },
    },
    {
      id: "f",
      text: "Use warning shots to disperse the crowd.",
      outcome: "The line clears fast, but long-term hostility hardens.",
      delta: { hope: -2, trust: -6, chaos: 4, humanity: -4 },
    },
  ],
  diplomat: [
    {
      id: "a",
      text: "Back the stronger bloc for immediate stability.",
      outcome: "Violence risk drops now, but weaker partners disengage long-term.",
      delta: { hope: 2, trust: -4, chaos: 1, humanity: -2 },
    },
    {
      id: "b",
      text: "Enforce equal terms with transparent quotas.",
      outcome: "Fairness rises gradually as all sides test enforcement.",
      delta: { hope: 4, trust: 7, chaos: -2, humanity: 4 },
    },
    {
      id: "c",
      text: "Publish joint logs and independent audits.",
      outcome: "Disinformation weakens while accountability grows.",
      delta: { hope: 3, trust: 8, chaos: -3, humanity: 3 },
    },
    {
      id: "d",
      text: "Trade exceptions for urgent labor commitments.",
      outcome: "Output improves, but perceived favoritism increases.",
      delta: { hope: 3, trust: -1, chaos: 1, humanity: -1 },
    },
    {
      id: "e",
      text: "Pause transfers until verification teams report.",
      outcome: "Escalation cools, but anxiety and scarcity spike briefly.",
      delta: { hope: -1, trust: 2, chaos: -1, humanity: 0 },
    },
    {
      id: "f",
      text: "Invite neutral mediators with binding oversight.",
      outcome: "Negotiations slow down yet agreements become stickier.",
      delta: { hope: 5, trust: 5, chaos: -2, humanity: 4 },
    },
  ],
  scavenger: [
    {
      id: "a",
      text: "Push deep and maximize haul per trip.",
      outcome: "Yield spikes, but team exposure risk rises sharply.",
      delta: { hope: 3, trust: -2, chaos: 4, humanity: -1 },
    },
    {
      id: "b",
      text: "Work slow with full safety protocol.",
      outcome: "Everyone returns, but scarcity pressure grows.",
      delta: { hope: 1, trust: 5, chaos: -2, humanity: 3 },
    },
    {
      id: "c",
      text: "Split team and cover multiple sites.",
      outcome: "Redundancy improves, coordination strain increases.",
      delta: { hope: 2, trust: 2, chaos: 1, humanity: 1 },
    },
    {
      id: "d",
      text: "Trade high-value finds with rival crew.",
      outcome: "Access expands, but dependency grows.",
      delta: { hope: 4, trust: -3, chaos: 2, humanity: -2 },
    },
    {
      id: "e",
      text: "Scout first, then extract with allies.",
      outcome: "Losses drop and alliances deepen.",
      delta: { hope: 4, trust: 6, chaos: -3, humanity: 3 },
    },
    {
      id: "f",
      text: "Sell exact locations to highest bidder.",
      outcome: "Immediate wealth flows, but camp loses extraction advantage.",
      delta: { hope: 2, trust: -5, chaos: 2, humanity: -4 },
    },
  ],
};

function progressionBand(index) {
  if (index <= 20) return "early";
  if (index <= 40) return "mid";
  return "late";
}

function upperStart(text) {
  if (!text) return text;
  return text[0].toUpperCase() + text.slice(1);
}

function scenarioFor(index) {
  if (avatarId === "medic") {
    return medicScenarioFor(index);
  }

  if (avatarId === "engineer") {
    return engineerScenarioFor(index);
  }

  if (avatarId === "guardian") {
    return guardianScenarioFor(index);
  }

  if (avatarId === "diplomat") {
    return diplomatScenarioFor(index);
  }

  if (avatarId === "scavenger") {
    return scavengerScenarioFor(index);
  }

  const zone = zones[(index - 1) % zones.length];
  const threat = threats[(index - 1) % threats.length];
  const objective = objectives[(index - 1) % objectives.length];
  const band = progressionBand(index);
  const imageUrl = imagePool[(index - 1) % imagePool.length];
  const padded = String(index).padStart(3, "0");
  const meta = archetypes[avatarId];

  const intensity =
    band === "early" ? "fragile" : band === "mid" ? "escalating" : "critical";

  return {
    id: `${avatarId}-${padded}`,
    title: `${upperStart(avatarId)} Operation ${padded}: ${upperStart(objective)}`,
    setting: `At ${zone}, your ${meta.roleLabel} team detects ${threat} while trying to ${objective}. The timeline is ${intensity}. ${meta.context}`,
    futureMsg: `Future-you warns that in operation ${padded}, overexposure around ${zone} creates chain reactions. Verify before acting, reduce panic, and protect non-combatants first.`,
    imageUrl,
    progressionBand: band,
    weight: band === "early" ? 2 : band === "mid" ? 3 : 4,
    choices: choiceTemplates[avatarId].map((tpl, idx) => {
      const volatility = (index + idx) % 3;
      const trustAdjust = volatility === 0 ? 1 : volatility === 1 ? 0 : -1;
      const chaosAdjust = volatility === 2 ? 1 : 0;

      return {
        id: tpl.id,
        text: tpl.text,
        outcome: `${tpl.outcome} [Operation ${padded}-${tpl.id.toUpperCase()}]`,
        hopeChange: tpl.delta.hope,
        trustChange: tpl.delta.trust + trustAdjust,
        chaosChange: tpl.delta.chaos + chaosAdjust,
        humanityChange: tpl.delta.humanity,
      };
    }),
  };
}

function medicScenarioFor(index) {
  const clinic = medicClinics[(index - 1) % medicClinics.length];
  const pressure = medicPressures[(index - 1) % medicPressures.length];
  const goal = medicGoals[(index - 1) % medicGoals.length];
  const band = progressionBand(index);
  const imageUrl = imagePool[(index - 1) % imagePool.length];
  const padded = String(index).padStart(3, "0");

  const severity =
    band === "early" ? "moderate" : band === "mid" ? "acute" : "critical";

  return {
    id: `${avatarId}-${padded}`,
    title: `Medic Session ${padded}: ${upperStart(goal)}`,
    setting: `At the ${clinic}, you face ${pressure}. Severity is ${severity}, and you must decide how to ${goal} while managing limited resources and patient ethics.`,
    futureMsg: `Future-you marks session ${padded} as a triage integrity test. Prioritize life-saving care, communicate limits clearly, and never abandon patients for convenience.`,
    imageUrl,
    progressionBand: band,
    weight: band === "early" ? 2 : band === "mid" ? 3 : 4,
    choices: choiceTemplates.medic.map((tpl, idx) => {
      const volatility = (index + idx) % 3;
      const trustAdjust = volatility === 0 ? 1 : volatility === 1 ? 0 : -1;
      const chaosAdjust = volatility === 2 ? 1 : 0;

      return {
        id: tpl.id,
        text: tpl.text,
        outcome: `${tpl.outcome} [Session ${padded}-${tpl.id.toUpperCase()}]`,
        hopeChange: tpl.delta.hope,
        trustChange: tpl.delta.trust + trustAdjust,
        chaosChange: tpl.delta.chaos + chaosAdjust,
        humanityChange: tpl.delta.humanity,
      };
    }),
  };
}

function engineerScenarioFor(index) {
  const facility = engineerFacilities[(index - 1) % engineerFacilities.length];
  const failure = engineerFailures[(index - 1) % engineerFailures.length];
  const objective =
    engineerObjectives[(index - 1) % engineerObjectives.length];
  const band = progressionBand(index);
  const imageUrl = imagePool[(index - 1) % imagePool.length];
  const padded = String(index).padStart(3, "0");

  const urgency =
    band === "early" ? "growing" : band === "mid" ? "acute" : "critical";

  return {
    id: `${avatarId}-${padded}`,
    title: `Engineer Job ${padded}: ${upperStart(objective)}`,
    setting: `At the ${facility}, you diagnose ${failure}. Urgency is ${urgency}, and you must decide how to ${objective} while managing technical constraints and crew safety.`,
    futureMsg: `Future-you records job ${padded} as a systems integrity test. Verify all repairs with redundancy checks, prevent cascading failures, and document changes thoroughly.`,
    imageUrl,
    progressionBand: band,
    weight: band === "early" ? 2 : band === "mid" ? 3 : 4,
    choices: choiceTemplates.engineer.map((tpl, idx) => {
      const volatility = (index + idx) % 3;
      const trustAdjust = volatility === 0 ? 1 : volatility === 1 ? 0 : -1;
      const chaosAdjust = volatility === 2 ? 1 : 0;

      return {
        id: tpl.id,
        text: tpl.text,
        outcome: `${tpl.outcome} [Job ${padded}-${tpl.id.toUpperCase()}]`,
        hopeChange: tpl.delta.hope,
        trustChange: tpl.delta.trust + trustAdjust,
        chaosChange: tpl.delta.chaos + chaosAdjust,
        humanityChange: tpl.delta.humanity,
      };
    }),
  };
}

function guardianScenarioFor(index) {
  const front = guardianFronts[(index - 1) % guardianFronts.length];
  const risk = guardianRisks[(index - 1) % guardianRisks.length];
  const objective = guardianObjectives[(index - 1) % guardianObjectives.length];
  const band = progressionBand(index);
  const imageUrl = imagePool[(index - 1) % imagePool.length];
  const padded = String(index).padStart(3, "0");

  const tension =
    band === "early" ? "simmering" : band === "mid" ? "elevated" : "extreme";

  return {
    id: `${avatarId}-${padded}`,
    title: `Guardian Post ${padded}: ${upperStart(objective)}`,
    setting: `At the ${front}, you anticipate ${risk}. Tension is ${tension}, and you must decide how to ${objective} while protecting civilians and maintaining security.`,
    futureMsg: `Future-you marks post ${padded} as a protective integrity test. Use minimum necessary force, prioritize civilian safety, and never compromise on fair treatment.`,
    imageUrl,
    progressionBand: band,
    weight: band === "early" ? 2 : band === "mid" ? 3 : 4,
    choices: choiceTemplates.guardian.map((tpl, idx) => {
      const volatility = (index + idx) % 3;
      const trustAdjust = volatility === 0 ? 1 : volatility === 1 ? 0 : -1;
      const chaosAdjust = volatility === 2 ? 1 : 0;

      return {
        id: tpl.id,
        text: tpl.text,
        outcome: `${tpl.outcome} [Post ${padded}-${tpl.id.toUpperCase()}]`,
        hopeChange: tpl.delta.hope,
        trustChange: tpl.delta.trust + trustAdjust,
        chaosChange: tpl.delta.chaos + chaosAdjust,
        humanityChange: tpl.delta.humanity,
      };
    }),
  };
}

function diplomatScenarioFor(index) {
  const table = diplomatTables[(index - 1) % diplomatTables.length];
  const conflict = diplomatConflicts[(index - 1) % diplomatConflicts.length];
  const aim = diplomatAims[(index - 1) % diplomatAims.length];
  const band = progressionBand(index);
  const imageUrl = imagePool[(index - 1) % imagePool.length];
  const padded = String(index).padStart(3, "0");

  const stakes =
    band === "early" ? "moderate" : band === "mid" ? "high" : "existential";

  return {
    id: `${avatarId}-${padded}`,
    title: `Diplomat Session ${padded}: ${upperStart(aim)}`,
    setting: `At the ${table}, you navigate ${conflict}. Stakes are ${stakes}, and you must decide how to ${aim} while maintaining all-camp relationships and procedural integrity.`,
    futureMsg: `Future-you records session ${padded} as a legitimacy integrity test. Choose fairness over expedience, honor all voices, and never sacrifice weaker partners for coalition stability.`,
    imageUrl,
    progressionBand: band,
    weight: band === "early" ? 2 : band === "mid" ? 3 : 4,
    choices: choiceTemplates.diplomat.map((tpl, idx) => {
      const volatility = (index + idx) % 3;
      const trustAdjust = volatility === 0 ? 1 : volatility === 1 ? 0 : -1;
      const chaosAdjust = volatility === 2 ? 1 : 0;

      return {
        id: tpl.id,
        text: tpl.text,
        outcome: `${tpl.outcome} [Session ${padded}-${tpl.id.toUpperCase()}]`,
        hopeChange: tpl.delta.hope,
        trustChange: tpl.delta.trust + trustAdjust,
        chaosChange: tpl.delta.chaos + chaosAdjust,
        humanityChange: tpl.delta.humanity,
      };
    }),
  };
}

function scavengerScenarioFor(index) {
  const site = scavengerSites[(index - 1) % scavengerSites.length];
  const hazard = scavengerHazards[(index - 1) % scavengerHazards.length];
  const mission = scavengerMissions[(index - 1) % scavengerMissions.length];
  const band = progressionBand(index);
  const imageUrl = imagePool[(index - 1) % imagePool.length];
  const padded = String(index).padStart(3, "0");

  const difficulty =
    band === "early" ? "moderate" : band === "mid" ? "acute" : "extreme";

  return {
    id: `${avatarId}-${padded}`,
    title: `Scavenger Run ${padded}: ${upperStart(mission)}`,
    setting: `At the ${site}, your crew faces ${hazard}. Difficulty is ${difficulty}, and you must decide how to ${mission} while managing team safety and resource scarcity ethics.`,
    futureMsg: `Future-you marks run ${padded} as a survival integrity test. Prioritize crew safety over surplus, share discoveries fairly, and never abandon people for profit margins.`,
    imageUrl,
    progressionBand: band,
    weight: band === "early" ? 2 : band === "mid" ? 3 : 4,
    choices: choiceTemplates.scavenger.map((tpl, idx) => {
      const volatility = (index + idx) % 3;
      const trustAdjust = volatility === 0 ? 1 : volatility === 1 ? 0 : -1;
      const chaosAdjust = volatility === 2 ? 1 : 0;

      return {
        id: tpl.id,
        text: tpl.text,
        outcome: `${tpl.outcome} [Run ${padded}-${tpl.id.toUpperCase()}]`,
        hopeChange: tpl.delta.hope,
        trustChange: tpl.delta.trust + trustAdjust,
        chaosChange: tpl.delta.chaos + chaosAdjust,
        humanityChange: tpl.delta.humanity,
      };
    }),
  };
}

const scenarios = Array.from({ length: total }, (_, i) =>
  scenarioFor(i + 1)
);

const pack = {
  packId: `${avatarId}-v1`,
  version: "1.0.0",
  avatars: [
    {
      avatarId,
      scenarios,
    },
  ],
};

const outDir = path.join(process.cwd(), "data", "seed-packs");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `${avatarId}-pack.json`);
fs.writeFileSync(outPath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");

console.log(`Wrote ${outPath} with ${scenarios.length} scenarios.`);
