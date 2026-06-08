// lib/endingEngine.js
// Generates avatar-aware, stat-rich ending narratives

export function analyzeStatProfile(stats) {
  const { hope, trust, chaos, humanity } = stats;
  
  return {
    hope: hope >= 75 ? "high" : hope >= 50 ? "moderate" : hope >= 25 ? "low" : "critical",
    trust: trust >= 75 ? "high" : trust >= 50 ? "moderate" : trust >= 25 ? "low" : "critical",
    chaos: chaos >= 75 ? "high" : chaos >= 50 ? "moderate" : chaos >= 25 ? "low" : "critical",
    humanity: humanity >= 75 ? "high" : humanity >= 50 ? "moderate" : humanity >= 25 ? "low" : "critical",
  };
}

export function calculateEndingScore(stats) {
  // IMPROVED FORMULA (based on TDD analysis):
  // Hope (60%) + Humanity (40%) = constructive forces
  // Chaos (40%) + low Trust (60%) = destructive forces
  //
  // Key changes from original:
  // - Hope weighs MORE than humanity (60/40) - motivation > ethics for survival
  // - Trust weighs MORE than chaos (60/40) - social cohesion > disorder control
  const constructive = (stats.hope * 0.6) + (stats.humanity * 0.4);
  const destructive = (stats.chaos * 0.4) + ((100 - stats.trust) * 0.6);
  return Math.round(constructive - destructive);
}

export const ENDING_SYMBOL_ITEMS = {
  balanced: [
    {
      name: "Water Valve",
      imageUrl: "/images/items/water-valve.png",
      meaning: "Infrastructure",
    },
    {
      name: "Voting Token",
      imageUrl: "/images/items/voting-token.png",
      meaning: "Democracy",
    },
    {
      name: "Medical Kit",
      imageUrl: "/images/items/medical-kit.png",
      meaning: "Care",
    },
  ],
  broken: [
    {
      name: "Empty Fuel Canister",
      imageUrl: "/images/items/fuel-canister.png",
      meaning: "Lost opportunities",
    },
    {
      name: "Damaged Ledger",
      imageUrl: "/images/items/ration-ledger.png",
      meaning: "Failed systems",
    },
    {
      name: "Broken Convoy Pass",
      imageUrl: "/images/items/convoy-pass.png",
      meaning: "Collapse",
    },
  ],
  rebuilding: [
    {
      name: "Medical Kit",
      imageUrl: "/images/items/medical-kit.png",
      meaning: "Healing",
    },
    {
      name: "Salvage Tag",
      imageUrl: "/images/items/salvage-claim-tag.png",
      meaning: "Recovery",
    },
    {
      name: "Water Valve",
      imageUrl: "/images/items/water-valve.png",
      meaning: "Reconstruction",
    },
  ],
  chaotic: [
    {
      name: "Cracked Radio",
      imageUrl: "/images/items/cracked-radio.png",
      meaning: "Fractured warnings",
    },
    {
      name: "Fuel Canister",
      imageUrl: "/images/items/fuel-canister.png",
      meaning: "Volatile scarcity",
    },
    {
      name: "Timeline Fragment",
      imageUrl: "/images/items/timeline-fragment.png",
      meaning: "Unstable futures",
    },
  ],
};

export function getEndingSymbolItems(endingState) {
  return ENDING_SYMBOL_ITEMS[endingState] ?? ENDING_SYMBOL_ITEMS.balanced;
}

const AVATAR_NARRATIVES = {
  scout: {
    profiles: {
      "high-high-low-high": {
        title: "THE PATHFINDER",
        narrative: "You found routes no one else dared to map. High hopes pushed you forward; deep humanity made you share every discovery freely. Trust was fragile—some thought you were reckless. But the lives you moved through those corridors will tell stories about the scout who opened the world.",
        icon: "🗺️"
      },
      "high-low-high-low": {
        title: "THE LONE RUNNER",
        narrative: "You moved fast and alone, burning bright through chaos. Hope kept you running, but trust evaporated—and you stopped caring about the people left behind. The routes you found belong to the scavengers now. The future remembers: speed without soul.",
        icon: "⚡"
      },
      "low-high-low-high": {
        title: "THE CAREFUL GUIDE",
        narrative: "You built trust slowly, moving only when others could follow. Humanity drove every choice—no one abandoned, no shortcuts taken. Hope wavered, but community held. Generations will know safety because you refused to run alone.",
        icon: "🤝"
      },
      "low-low-high-low": {
        title: "THE LOST SCOUT",
        narrative: "Chaos consumed your routes. Hope faded. Trust shattered. You ran corridors alone, leaving nothing behind but closed doors and burned bridges. The future asks: was the scout ever really there?",
        icon: "🌑"
      }
    },
    default: {
      title: "THE SCOUT",
      narrative: "Your routes shaped the future. Some survived because you found the way. Others remember your choices—careful or reckless—when the world narrowed. The paths you left behind still echo.",
      icon: "🧭"
    }
  },

  medic: {
    profiles: {
      "high-high-low-high": {
        title: "THE HEALER",
        narrative: "You triaged with precision and compassion. Trust built clinic by clinic. Hope never dimmed—every patient was a victory. Chaos stayed locked outside your doors. The future flows with health because you refused to choose who lived.",
        icon: "❤️"
      },
      "high-low-high-low": {
        title: "THE PRAGMATIST",
        narrative: "You made hard calls: who got medicine, who waited, who didn't make it. Hope told you each choice mattered. But trust collapsed when choices became patterns. Chaos bled into your wards. Survivors carry both gratitude and scars.",
        icon: "⚔️"
      },
      "low-high-low-high": {
        title: "THE GENTLE HAND",
        narrative: "You couldn't save them all, and that broke something in you. But trust held—people came back, kept coming back. Humanity glowed even as hope faded. Generations grew up in clinics you staffed with quiet grief and endless care.",
        icon: "🌿"
      },
      "low-low-high-low": {
        title: "THE BURNT-OUT",
        narrative: "The wards consumed you. You numbed the failures with protocol. Chaos spun through shortages and deaths you couldn't prevent. Trust vanished when you stopped trying. The future asks: did the medic ever truly heal?",
        icon: "🔥"
      }
    },
    default: {
      title: "THE MEDIC",
      narrative: "Your hands carried the weight of survival. Every shift rewritten people's futures. Some remember salvation. Others remember only waiting. The clinics you built still echo with your choices.",
      icon: "🏥"
    }
  },

  engineer: {
    profiles: {
      "high-high-low-high": {
        title: "THE REBUILDER",
        narrative: "You restored systems with vision and care. Trust built as power returned, water ran clean, walls held. Hope sang through every repair. You didn't just fix infrastructure—you rebuilt community. The future runs on foundations you poured.",
        icon: "🏗️"
      },
      "high-low-high-low": {
        title: "THE CHAOS ENGINEER",
        narrative: "You made systems work through improvisation and shortcuts. Chaos crackled through your projects—elegant but unpredictable. Hope never faltered, but trust collapsed when the quick fixes failed. Communities learned: progress has a cost.",
        icon: "⚙️"
      },
      "low-high-low-high": {
        title: "THE GUARDIAN OF SYSTEMS",
        narrative: "You maintained the fragile networks others had built. Hope faded when breakdowns came faster than repairs. But humanity shaped every choice—you ensured no one froze, starved, or drowned. Trust became your only tool. It was enough.",
        icon: "🔧"
      },
      "low-low-high-low": {
        title: "THE FAILED ENGINEER",
        narrative: "Systems collapsed under your watch. Chaos reigned. Trust evaporated when people realized the infrastructure was held together by borrowed time. Hope died in the dark. The future rebuilt without you.",
        icon: "💥"
      }
    },
    default: {
      title: "THE ENGINEER",
      narrative: "Your systems kept people alive. Some hummed perfectly. Others barely held. Every repair was a choice about whose life mattered most. The infrastructure of tomorrow carries your decisions in its steel and concrete.",
      icon: "🔩"
    }
  },

  guardian: {
    profiles: {
      "high-high-low-high": {
        title: "THE PROTECTOR",
        narrative: "You held the line with an open hand. Hope and humanity guided every gate decision. Trust deepened as people realized you'd never turn them away. Chaos stayed outside your perimeter. Families grew safe because you chose compassion under pressure.",
        icon: "🛡️"
      },
      "high-low-high-high": {
        title: "THE HARD SHIELD",
        narrative: "You protected through force and fear. Hope burned bright—the compound was safe, walls held. But trust shattered. Chaos simmered at the gate. Humanity wrestled with your methods. Protection came at a price everyone remembers.",
        icon: "⚔️"
      },
      "low-high-low-high": {
        title: "THE RELUCTANT GUARDIAN",
        narrative: "You never wanted the weapon. Hope wavered at every crisis. But trust never broke—people knew you'd stand the line when it mattered. Humanity shone through every hesitation. You protected despite yourself. That restraint became legendary.",
        icon: "🕊️"
      },
      "low-low-high-low": {
        title: "THE FALLEN GUARD",
        narrative: "Chaos breached your perimeter. Hope abandoned you first, then trust crumbled. You became the threat. Humanity fled. The gates fell because the guardian was gone. History erased you from the story.",
        icon: "🌑"
      }
    },
    default: {
      title: "THE GUARDIAN",
      narrative: "You stood the gate. Some remember salvation. Others remember hardship. Every person you turned away or welcomed shaped futures you'll never fully know. The perimeters of tomorrow were drawn by your hand.",
      icon: "🏰"
    }
  },

  diplomat: {
    profiles: {
      "high-high-low-high": {
        title: "THE UNIFIER",
        narrative: "You built coalitions through transparency and fairness. Hope never wavered—you believed all voices mattered. Trust deepened with every joint audit. Chaos stayed negotiated rather than violent. The future breathes because you chose equality over expedience.",
        icon: "🤝"
      },
      "high-low-high-low": {
        title: "THE REALIST",
        narrative: "You backed the strong to keep the peace. Hope told you stability mattered most. But trust collapsed—weaker partners felt betrayed. Chaos simmered beneath ceasefire. Humanity questioned every alliance. History calls you pragmatic. Some call you cruel.",
        icon: "📋"
      },
      "low-high-low-high": {
        title: "THE VOICE FOR THE VOICELESS",
        narrative: "You fought for minority camps even when hope faded. Trust became your currency. Every negotiation centered forgotten communities. Humanity glowed through careful procedure. Peace came slowly, but it held because it was fair. Future generations will know your name.",
        icon: "📢"
      },
      "low-low-high-low": {
        title: "THE FAILED NEGOTIATOR",
        narrative: "Coalitions splintered under your watch. Hope died first. Trust evaporated in endless disputes. Chaos erupted where treaties should have held. Humanity became collateral damage. The future fragments without you. Alliances rebuilt elsewhere, stronger without your voice.",
        icon: "💔"
      }
    },
    default: {
      title: "THE DIPLOMAT",
      narrative: "You spoke for the survival of multiple futures. Some alliances held. Others fractured. Every word carried the weight of communities depending on your credibility. The peace that exists today was negotiated by your choices.",
      icon: "🗣️"
    }
  },

  scavenger: {
    profiles: {
      "high-high-low-high": {
        title: "THE FAIR FINDER",
        narrative: "You secured resources and shared them freely. Hope told you abundance lived in generosity. Trust deepened with every discovery—people knew you'd never hoard. Humanity drove every run. The future grows because you chose people over profit.",
        icon: "🎁"
      },
      "high-low-high-low": {
        title: "THE LONE SCAVENGER",
        narrative: "You maximized hauls and hoarded them. Hope burned bright—you'd secure your own survival. But trust evaporated when community realized you'd sell anything. Chaos bled from black markets. Humanity was luxury you couldn't afford. The future remembers your greed.",
        icon: "💰"
      },
      "low-high-low-high": {
        title: "THE SAFETY SCOUT",
        narrative: "You searched carefully, bringing everyone home. Hope wavered at scarcity. But trust held—crews followed because you valued their lives over yield. Humanity glowed through every choice to slow down. Communities grew because you refused to lose people for profit.",
        icon: "🔍"
      },
      "low-low-high-low": {
        title: "THE HOLLOW FINDER",
        narrative: "You ran into dangers alone and never came back. Chaos consumed the hazard zones. Hope died in sealed vaults. Trust shattered when the crew realized you'd abandoned them. Humanity bled out with each failed run. The future searches without you.",
        icon: "🌑"
      }
    },
    default: {
      title: "THE SCAVENGER",
      narrative: "You found resources in ruins. Some choices saved communities. Others fed black markets. Every run balanced survival against ethics. The camps that endure were built on materials you risked everything to unearth.",
      icon: "⛏️"
    }
  }
};

export function generateEndingNarrative(stats, avatarId) {
  const profile = analyzeStatProfile(stats);
  const profileKey = `${profile.hope}-${profile.trust}-${profile.chaos}-${profile.humanity}`;
  
  const avatarData = AVATAR_NARRATIVES[avatarId];
  if (!avatarData) {
    return {
      title: "THE SURVIVOR",
      narrative: "You walked through ash and made choices. The future remembers. Exactly which future depends on the weight you carried.",
      icon: "🌅"
    };
  }

  // Try exact profile match first
  if (avatarData.profiles?.[profileKey]) {
    return avatarData.profiles[profileKey];
  }

  // Fall back to avatar's default
  return avatarData.default;
}

export function deriveEndingState(stats) {
  const { hope, trust, chaos, humanity } = stats;

  // PRIORITY CHANGE: Check "broken" (critical hope/humanity) BEFORE "chaotic"
  // When hope or humanity are critically low (≤25), the survivors are broken
  // regardless of chaos levels - this is the dominant narrative
  if (hope <= 25 || humanity <= 25) return "broken";
  if (chaos <= 20 && trust <= 35) return "broken";

  // Chaotic checks - only apply if hope/humanity are NOT critically low
  if (chaos >= 75 && humanity <= 45) return "chaotic";
  if (chaos >= 70) return "chaotic";

  // STRICTER REBUILDING: Changed threshold from chaos ≤55 to ≤40
  // True rebuilding requires better chaos control
  if (hope >= 75 && humanity >= 70 && chaos <= 40) return "rebuilding";

  return "balanced";
}
