// lib/mockData.js
// Drop-in mock data for Project Discovery: Apocalypse.
// Swap this out once the backend /api/scenarios is live.
//
// Notes:
// - The base Scenario/Choice fields match your current frontend mock shape.
// - `requiredRole` and `roleBonus` are frontend-only mock helpers for avatar-specific gameplay.
// - If you later seed Prisma directly from this file, either strip those two fields or add schema support for them.

export const AVATARS = [
  {
    "id": "scout",
    "name": "The Scout",
    "trait": "Observant",
    "description": "Sees danger before others do.",
    "imageUrl": "/images/avatars/avatar-scout.png",
    "futureImageUrl": "/images/avatars/future/balanced/future-scout-balanced.png",
    "futureImageByState": {
      "balanced": "/images/avatars/future/balanced/future-scout-balanced.png",
      "broken": "/images/avatars/future/broken/future-scout-broken.png",
      "chaotic": "/images/avatars/future/chaotic/future-scout-chaotic.png",
      "rebuilding": "/images/avatars/future/rebuilding/future-scout-rebuilding.png"
    },
    "startingStats": {
      "hope": 5,
      "trust": 6,
      "chaos": 3,
      "humanity": 5
    }
  },
  {
    "id": "medic",
    "name": "The Medic",
    "trait": "Compassionate",
    "description": "Fights to keep people alive.",
    "imageUrl": "/images/avatars/avatar-medic.png",
    "futureImageUrl": "/images/avatars/future/balanced/future-medic-balanced.png",
    "futureImageByState": {
      "balanced": "/images/avatars/future/balanced/future-medic-balanced.png",
      "broken": "/images/avatars/future/broken/future-medic-broken.png",
      "chaotic": "/images/avatars/future/chaotic/future-medic-chaotic.png",
      "rebuilding": "/images/avatars/future/rebuilding/future-medic-rebuilding.png"
    },
    "startingStats": {
      "hope": 6,
      "trust": 5,
      "chaos": 2,
      "humanity": 7
    }
  },
  {
    "id": "engineer",
    "name": "The Engineer",
    "trait": "Practical",
    "description": "Rebuilds systems under pressure.",
    "imageUrl": "/images/avatars/avatar-engineer.png",
    "futureImageUrl": "/images/avatars/future/balanced/future-engineer-balanced.png",
    "futureImageByState": {
      "balanced": "/images/avatars/future/balanced/future-engineer-balanced.png",
      "broken": "/images/avatars/future/broken/future-engineer-broken.png",
      "chaotic": "/images/avatars/future/chaotic/future-engineer-chaotic.png",
      "rebuilding": "/images/avatars/future/rebuilding/future-engineer-rebuilding.png"
    },
    "startingStats": {
      "hope": 6,
      "trust": 5,
      "chaos": 3,
      "humanity": 4
    }
  },
  {
    "id": "guardian",
    "name": "The Guardian",
    "trait": "Protective",
    "description": "Stands between danger and the vulnerable.",
    "imageUrl": "/images/avatars/avatar-guardian.png",
    "futureImageUrl": "/images/avatars/future/balanced/future-guardian-balanced.png",
    "futureImageByState": {
      "balanced": "/images/avatars/future/balanced/future-guardian-balanced.png",
      "broken": "/images/avatars/future/broken/future-guardian-broken.png",
      "chaotic": "/images/avatars/future/chaotic/future-guardian-chaotic.png",
      "rebuilding": "/images/avatars/future/rebuilding/future-guardian-rebuilding.png"
    },
    "startingStats": {
      "hope": 4,
      "trust": 6,
      "chaos": 5,
      "humanity": 4
    }
  },
  {
    "id": "diplomat",
    "name": "The Diplomat",
    "trait": "Persuasive",
    "description": "Builds alliances before battles.",
    "imageUrl": "/images/avatars/avatar-diplomat.png",
    "futureImageUrl": "/images/avatars/future/balanced/future-diplomat-balanced.png",
    "futureImageByState": {
      "balanced": "/images/avatars/future/balanced/future-diplomat-balanced.png",
      "broken": "/images/avatars/future/broken/future-diplomat-broken.png",
      "chaotic": "/images/avatars/future/chaotic/future-diplomat-chaotic.png",
      "rebuilding": "/images/avatars/future/rebuilding/future-diplomat-rebuilding.png"
    },
    "startingStats": {
      "hope": 7,
      "trust": 5,
      "chaos": 2,
      "humanity": 6
    }
  },
  {
    "id": "scavenger",
    "name": "The Scavenger",
    "trait": "Resourceful",
    "description": "Finds value in the ruins.",
    "imageUrl": "/images/avatars/avatar-scavenger.png",
    "futureImageUrl": "/images/avatars/future/balanced/future-scavenger-balanced.png",
    "futureImageByState": {
      "balanced": "/images/avatars/future/balanced/future-scavenger-balanced.png",
      "broken": "/images/avatars/future/broken/future-scavenger-broken.png",
      "chaotic": "/images/avatars/future/chaotic/future-scavenger-chaotic.png",
      "rebuilding": "/images/avatars/future/rebuilding/future-scavenger-rebuilding.png"
    },
    "startingStats": {
      "hope": 3,
      "trust": 6,
      "chaos": 4,
      "humanity": 4
    }
  }
];

export const MOCK_SCENARIOS = [
  {
    id: "scenario-01",
    title: "The Radio Tower",
    setting:
      "Day 14 post-collapse. You find a working radio tower on the edge of town. Static crackles across every channel — then a voice breaks through. Someone is broadcasting coordinates. The signal is strong. Others nearby can hear it too.",
    futureMsg:
      "Don't broadcast the coordinates publicly. I know it feels like the right thing — people need shelter. But the wrong group finds that location first, and everything you've built burns. Share them privately with the ones you trust.",
    imageUrl: "/images/backgrounds/radio-tower.png",
    choices: [
      {
        id: "c-01a",
        text: "Broadcast the coordinates on all channels. Everyone deserves a chance.",
        outcome:
          "You open the channel. Within hours, over sixty people arrive. Most are desperate families — but a militia unit follows the signal too. The shelter holds, barely. The future shifts in ways you can't yet see.",
        hopeChange: 12,
        trustChange: -8,
        chaosChange: 20,
        humanityChange: 2,
        roleBonus: {
          diplomat: {
            outcome:
              "You add a peace protocol and identity challenge before sharing. Some bad actors are filtered out, and the crowd organizes faster.",
            trustChange: 2,
            chaosChange: -4,
            humanityChange: 2,
          },
          guardian: {
            outcome:
              "You warn your people before the crowds arrive and organize the gate into triage lanes. Fewer people are crushed in the rush.",
            trustChange: 1,
            chaosChange: -3,
          },
        },
      },
      {
        id: "c-01b",
        text: "Share the coordinates only with your inner group. Keep quiet for now.",
        outcome:
          "Your group reaches the shelter before dawn. It is cramped but safe. Somewhere behind you, others are still searching. The weight of that choice settles slowly.",
        hopeChange: -5,
        trustChange: 15,
        chaosChange: 0,
        humanityChange: -4,
        roleBonus: {
          scout: {
            outcome:
              "You post lookouts before moving. Your team reaches shelter unseen, and nearby scavenger routes are mapped for later rescue runs.",
            trustChange: 2,
            chaosChange: -2,
            humanityChange: 2,
          },
          engineer: {
            outcome:
              "You harden the relay with rotating passcodes before sharing. The shelter stays hidden from signal triangulation.",
            trustChange: 1,
            chaosChange: -2,
          },
        },
      },
      {
        id: "c-01c",
        text: "Destroy the transmitter. No one should have this information.",
        outcome:
          "The tower goes dark. No one finds the shelter tonight. In the silence afterward, you wonder if you made the right call — or just the safe one.",
        hopeChange: -15,
        trustChange: 0,
        chaosChange: -10,
        humanityChange: -12,
        roleBonus: {
          engineer: {
            outcome:
              "Instead of smashing it, you pull the transmitter core and keep the receiver alive. The tower is silent, but you can still listen.",
            hopeChange: 3,
            chaosChange: -3,
            humanityChange: 4,
          },
          guardian: {
            outcome:
              "You disable only the long-range broadcast and establish a guarded local channel. Immediate panic drops, but your reputation hardens.",
            trustChange: 1,
            chaosChange: -3,
          },
        },
      },
      {
        id: "c-01d",
        requiredRole: "scout",
        text: "Climb the tower and watch who moves toward the signal before answering.",
        outcome:
          "From above, you spot three groups converging: refugees, raiders, and a lone courier waving a white cloth. You answer only the courier and avoid the trap.",
        hopeChange: 5,
        trustChange: 8,
        chaosChange: -6,
        humanityChange: 3,
      },
      {
        id: "c-01e",
        requiredRole: "medic",
        text: "Ask for injury reports before sharing your location.",
        outcome:
          "You triage callers by urgency. Two families are rescued quickly, but your medical stock drops before sunrise.",
        hopeChange: 8,
        trustChange: 5,
        chaosChange: -2,
        humanityChange: 10,
      },
      {
        id: "c-01f",
        requiredRole: "diplomat",
        text: "Send a neutral coded message offering terms for safe contact.",
        outcome:
          "A cautious neighboring group answers with their own code phrase. You establish first-contact protocol and avoid a firefight.",
        hopeChange: 7,
        trustChange: 8,
        chaosChange: -4,
        humanityChange: 6,
      },
      {
        id: "c-01g",
        requiredRole: "scavenger",
        text: "Trade the relay access schedule for fuel and filters.",
        outcome:
          "Your settlement gains critical supplies, but rumors spread that access now depends on what people can pay.",
        hopeChange: 1,
        trustChange: -3,
        chaosChange: 4,
        humanityChange: -4,
      },
    ],
  },
  {
    id: "scenario-02",
    title: "The Supply Cache",
    setting:
      "Day 21. Your scout returns with news: an untouched pharmacy two blocks east. Enough medicine to keep your group healthy for weeks. But another group is camped nearby — they look desperate.",
    futureMsg:
      "You share the medicine. I know that sounds naive from where you're standing, but the group you help today becomes your closest allies in week six. Don't let fear make this decision for you.",
    imageUrl: "/images/backgrounds/ruined-city.png",
    choices: [
      {
        id: "c-02a",
        text: "Take everything and leave before the other group notices.",
        outcome:
          "Your group is well-stocked. The other group finds nothing. Two weeks later, you recognize their faces — on the other side of a barricade.",
        hopeChange: 0,
        trustChange: -10,
        chaosChange: 5,
        humanityChange: -15,
        roleBonus: {
          scavenger: {
            outcome:
              "You leave a fake trail and hide a small emergency kit in the alley. It is not kindness exactly, but it keeps the other group alive.",
            trustChange: 2,
            humanityChange: 4,
          },
          guardian: {
            outcome:
              "Your people feel safer with the stockpile full, but the other camp posts armed lookouts before sunset.",
            trustChange: 2,
            chaosChange: 3,
          },
        },
      },
      {
        id: "c-02b",
        text: "Approach the other group and propose splitting the cache.",
        outcome:
          "It's tense at first. Then someone laughs at something — and the tension breaks. You leave with half the medicine and something more valuable: allies.",
        hopeChange: 18,
        trustChange: 20,
        chaosChange: -5,
        humanityChange: 15,
        roleBonus: {
          diplomat: {
            outcome:
              "You write a simple mutual-aid agreement on the pharmacy wall. Both groups sign it in charcoal.",
            trustChange: 4,
            chaosChange: -3,
          },
          medic: {
            outcome:
              "You identify which meds are most urgent and prevent waste. The sickest people get help first.",
            hopeChange: 2,
            humanityChange: 4,
          },
        },
      },
      {
        id: "c-02c",
        text: "Leave the cache hidden and return with a larger plan.",
        outcome:
          "You mark the location and retreat. By morning, someone else has broken in. The cache is half gone, but no blood was spilled because of you.",
        hopeChange: -4,
        trustChange: 2,
        chaosChange: 1,
        humanityChange: 3,
        roleBonus: {
          scout: {
            outcome:
              "You hide two critical crates under floor tiles before leaving. Your restraint costs less than it could have.",
            hopeChange: 3,
            trustChange: 2,
          },
          engineer: {
            outcome:
              "You seal the temperature-sensitive medicine in a working cooler. What remains is still usable when you return.",
            hopeChange: 4,
            humanityChange: 2,
          },
        },
      },
      {
        id: "c-02d",
        requiredRole: "medic",
        text: "Set up a triage table and distribute medicine by medical urgency.",
        outcome:
          "People grumble until the feverish children stop shaking. The system feels harsh, but it is fair enough to hold.",
        hopeChange: 10,
        trustChange: 9,
        chaosChange: -4,
        humanityChange: 12,
      },
      {
        id: "c-02e",
        requiredRole: "scavenger",
        text: "Search the back rooms before anyone divides the visible shelves.",
        outcome:
          "Behind a false panel you find antibiotics, batteries, and a working flashlight. You can share the front shelves without leaving your group empty-handed.",
        hopeChange: 8,
        trustChange: 4,
        chaosChange: -2,
        humanityChange: 4,
      },
      {
        id: "c-02f",
        requiredRole: "guardian",
        text: "Guard the entrance while both groups inventory the cache together.",
        outcome:
          "Nobody likes being watched, but nobody panics. By dusk, everyone leaves with supplies and no one draws a weapon.",
        hopeChange: 5,
        trustChange: 8,
        chaosChange: -6,
        humanityChange: 5,
      },
    ],
  },
  {
    id: "scenario-03",
    title: "The Bunker Door",
    setting:
      "Day 28. Beneath the old courthouse, you find a sealed blast door with scratches around the handle. Someone is knocking from the other side. Their voices are hoarse. Your people lift their weapons without being told.",
    futureMsg:
      "Do not open the door all at once. We did that before. The people inside were not monsters — just terrified, starving, and armed. Control the first minute, or the first minute controls everything after it.",
    imageUrl: "/images/backgrounds/bunker.png",
    choices: [
      {
        id: "c-03a",
        text: "Open the bunker immediately. People are trapped inside.",
        outcome:
          "The door groans open and panic pours through it. A frightened survivor fires at a shadow. No one dies, but trust shatters before names are exchanged.",
        hopeChange: 6,
        trustChange: -9,
        chaosChange: 12,
        humanityChange: 7,
        roleBonus: {
          medic: {
            outcome:
              "You shout medical instructions before anyone fires again. The wounded calm down when they hear a healer's voice.",
            trustChange: 4,
            chaosChange: -5,
            humanityChange: 3,
          },
          guardian: {
            outcome:
              "You keep your group's weapons lowered but ready. The line holds without turning into a massacre.",
            trustChange: 2,
            chaosChange: -4,
          },
        },
      },
      {
        id: "c-03b",
        text: "Speak through the door and establish rules before opening it.",
        outcome:
          "You trade names, numbers, and promises through steel. When the door opens, everyone steps back from fear instead of forward into violence.",
        hopeChange: 10,
        trustChange: 12,
        chaosChange: -6,
        humanityChange: 8,
        roleBonus: {
          diplomat: {
            outcome:
              "You turn the rules into a ritual: hands visible, names first, weapons down. People remember it later as the Courthouse Accord.",
            hopeChange: 2,
            trustChange: 4,
            chaosChange: -3,
          },
        },
      },
      {
        id: "c-03c",
        text: "Walk away. A sealed bunker may be sealed for a reason.",
        outcome:
          "You leave them behind. The knocking follows you up the stairs in memory. Three days later, someone else opens the door with less patience.",
        hopeChange: -10,
        trustChange: 3,
        chaosChange: 4,
        humanityChange: -14,
        roleBonus: {
          scout: {
            outcome:
              "You mark the exits and watch from across the street. When raiders arrive, you have time to intervene or disappear.",
            trustChange: 1,
            chaosChange: -2,
            humanityChange: 2,
          },
        },
      },
      {
        id: "c-03d",
        requiredRole: "engineer",
        text: "Repair the side airlock and open the bunker one chamber at a time.",
        outcome:
          "The airlock becomes a buffer between terror and daylight. People exit in pairs. Weapons are collected, names are recorded, and no one dies.",
        hopeChange: 12,
        trustChange: 10,
        chaosChange: -8,
        humanityChange: 8,
      },
      {
        id: "c-03e",
        requiredRole: "scavenger",
        text: "Search for the maintenance hatch before touching the main door.",
        outcome:
          "You find a narrow service crawlspace and pass food through first. Hunger stops driving the conversation, and the door can wait.",
        hopeChange: 7,
        trustChange: 6,
        chaosChange: -5,
        humanityChange: 6,
      },
      {
        id: "c-03f",
        requiredRole: "medic",
        text: "Ask the people inside to describe symptoms before opening the seal.",
        outcome:
          "Their confusion is dehydration, not infection. You prepare water and blankets before the door opens, avoiding panic and misdiagnosis.",
        hopeChange: 8,
        trustChange: 7,
        chaosChange: -4,
        humanityChange: 11,
      },
    ],
  },
  {
    id: "scenario-04",
    title: "The Burning Market",
    setting:
      "Day 32. The old night market is burning. People are trapped in the second-floor apartments, but the stalls below still hold food, batteries, and tools. Smoke turns the sunset copper-red.",
    futureMsg:
      "Save the people before the supplies. We counted cans instead of names, and every meal after that tasted like ash. The market can burn. The living cannot be replaced.",
    imageUrl: "/images/backgrounds/ruined-city.png",
    choices: [
      {
        id: "c-04a",
        text: "Rush upstairs and evacuate the trapped families first.",
        outcome:
          "You lose most of the supplies, but five people make it down the stairs alive. Later, they bring skills no crate could have carried.",
        hopeChange: 14,
        trustChange: 8,
        chaosChange: 6,
        humanityChange: 16,
        roleBonus: {
          guardian: {
            outcome:
              "You organize a fire line and carry the last survivor through a collapsing hallway. Your authority feels earned instead of taken.",
            trustChange: 4,
            chaosChange: -2,
          },
          medic: {
            outcome:
              "You treat smoke inhalation on the street and prevent the rescue from becoming a second disaster.",
            hopeChange: 2,
            humanityChange: 3,
            chaosChange: -2,
          },
        },
      },
      {
        id: "c-04b",
        text: "Secure the food and batteries before the fire spreads.",
        outcome:
          "Your group eats well for a week. Nobody says much at dinner. Everyone heard the screams above the market.",
        hopeChange: 4,
        trustChange: -5,
        chaosChange: -2,
        humanityChange: -18,
        roleBonus: {
          scavenger: {
            outcome:
              "You move fast enough to grab supplies and still open one stairwell. It is not a clean victory, but it is not pure loss either.",
            hopeChange: 4,
            humanityChange: 7,
          },
        },
      },
      {
        id: "c-04c",
        text: "Let the market burn and keep your group away from the danger.",
        outcome:
          "No one from your group is hurt. The fire draws raiders by midnight, and the neighborhood becomes a scar people avoid.",
        hopeChange: -12,
        trustChange: 2,
        chaosChange: 5,
        humanityChange: -10,
      },
      {
        id: "c-04d",
        requiredRole: "engineer",
        text: "Cut power to the lower stalls and collapse a firewall to slow the flames.",
        outcome:
          "The fire loses its teeth. You save three apartments and enough supplies to make the rescue feel like a beginning.",
        hopeChange: 12,
        trustChange: 10,
        chaosChange: -5,
        humanityChange: 10,
      },
      {
        id: "c-04e",
        requiredRole: "scout",
        text: "Find a roof route before sending anyone into the smoke.",
        outcome:
          "You lead survivors across a sagging billboard and down an adjacent fire escape. The route becomes a story people repeat when they need courage.",
        hopeChange: 9,
        trustChange: 9,
        chaosChange: -4,
        humanityChange: 9,
      },
      {
        id: "c-04f",
        requiredRole: "diplomat",
        text: "Recruit bystanders into a bucket line with a promise of shared supplies.",
        outcome:
          "Strangers become a rescue crew. The market still burns, but the crowd chooses order over panic for the first time in days.",
        hopeChange: 11,
        trustChange: 12,
        chaosChange: -6,
        humanityChange: 8,
      },
    ],
  },
  {
    id: "scenario-05",
    title: "The Forest Safe Zone",
    setting:
      "Day 39. A hidden forest settlement offers shelter, gardens, clean water, and a rule carved into cedar: no weapons beyond the bridge. Your group is exhausted. Some refuse to disarm.",
    futureMsg:
      "The bridge is a test, not a trap. If you enter like conquerors, they answer like a fortress. If you enter like neighbors, the forest becomes the first place we remember as home.",
    imageUrl: "/images/backgrounds/forest-safe-zone.png",
    choices: [
      {
        id: "c-05a",
        text: "Accept the rule and leave weapons at the bridge.",
        outcome:
          "The bridge guards relax when your people step forward with empty hands. The first meal tastes impossible: beans, herbs, clean water, and silence without fear.",
        hopeChange: 18,
        trustChange: 14,
        chaosChange: -8,
        humanityChange: 12,
        roleBonus: {
          diplomat: {
            outcome:
              "You offer a reciprocal pledge: your group follows their law, and your people help repair the south fence. Trust deepens quickly.",
            trustChange: 4,
            hopeChange: 2,
          },
        },
      },
      {
        id: "c-05b",
        text: "Hide a few weapons before crossing. Trust has limits.",
        outcome:
          "You enter safely, but a child finds the hidden pistol before dinner. The settlement does not exile you, but every conversation gets colder.",
        hopeChange: 5,
        trustChange: -12,
        chaosChange: 6,
        humanityChange: -4,
        roleBonus: {
          scavenger: {
            outcome:
              "Your hiding place is too good. The pistol is never found, but the secret changes how your people look at peace.",
            trustChange: 2,
            chaosChange: -2,
            humanityChange: -2,
          },
        },
      },
      {
        id: "c-05c",
        text: "Refuse the rule and keep moving.",
        outcome:
          "You keep your weapons and lose the gardens. The forest closes behind you like a door you may never find again.",
        hopeChange: -10,
        trustChange: 3,
        chaosChange: 1,
        humanityChange: -6,
        roleBonus: {
          guardian: {
            outcome:
              "Your people feel protected by the refusal, but several wonder if safety has become your only language.",
            trustChange: 2,
            humanityChange: -2,
          },
        },
      },
      {
        id: "c-05d",
        requiredRole: "scout",
        text: "Survey the safe zone perimeter before deciding.",
        outcome:
          "You find no ambush — only trip lines meant to warn, not kill. Your report convinces the doubters to cross peacefully.",
        hopeChange: 11,
        trustChange: 9,
        chaosChange: -6,
        humanityChange: 8,
      },
      {
        id: "c-05e",
        requiredRole: "medic",
        text: "Offer to help in their clinic before asking for shelter.",
        outcome:
          "The clinic is overwhelmed. By nightfall, you have treated infected cuts and earned a bed for every member of your group.",
        hopeChange: 13,
        trustChange: 11,
        chaosChange: -5,
        humanityChange: 14,
      },
      {
        id: "c-05f",
        requiredRole: "engineer",
        text: "Inspect their failing solar grid as a gesture of good faith.",
        outcome:
          "You restore two panels before sunset. The bridge rule remains, but now it feels like a shared agreement rather than surrender.",
        hopeChange: 12,
        trustChange: 10,
        chaosChange: -4,
        humanityChange: 7,
      },
    ],
  },
  {
    id: "scenario-06",
    title: "The Desert Convoy",
    setting:
      "Day 46. On an abandoned desert highway, you find a convoy half-buried in dust. Water drums, fuel cans, and locked cargo trucks sit under a boiling orange sky. A sandstorm is less than an hour away.",
    futureMsg:
      "Do not stay too long. We thought one more truck meant one more week of life. The storm buried the road, the engines, and three people whose names I still say when I can't sleep.",
    imageUrl: "/images/backgrounds/desert-highway.png",
    choices: [
      {
        id: "c-06a",
        text: "Grab only what your group can carry and leave before the storm hits.",
        outcome:
          "You leave fuel behind, but everyone survives the storm inside a drainage tunnel. Hunger is easier to face than funerals.",
        hopeChange: 2,
        trustChange: 7,
        chaosChange: -5,
        humanityChange: 5,
        roleBonus: {
          scout: {
            outcome:
              "You spot the drainage tunnel before the first wall of sand hits. The retreat becomes disciplined instead of desperate.",
            trustChange: 3,
            chaosChange: -3,
          },
        },
      },
      {
        id: "c-06b",
        text: "Risk the storm to salvage the fuel truck.",
        outcome:
          "The fuel truck starts, but the storm catches you on open asphalt. You gain fuel and lose time, visibility, and some of your people's faith in your judgment.",
        hopeChange: 8,
        trustChange: -7,
        chaosChange: 10,
        humanityChange: -2,
        roleBonus: {
          engineer: {
            outcome:
              "You bypass the ignition fast enough to beat the worst of the storm. The risk still frightens people, but the convoy moves.",
            hopeChange: 4,
            trustChange: 3,
            chaosChange: -5,
          },
        },
      },
      {
        id: "c-06c",
        text: "Send half the group ahead while half salvages supplies.",
        outcome:
          "The split works until radio contact fails. Everyone eventually regroups, but the hours apart seed rumors about who was worth protecting.",
        hopeChange: 5,
        trustChange: -4,
        chaosChange: 7,
        humanityChange: 1,
        roleBonus: {
          guardian: {
            outcome:
              "You assign escorts to both groups and keep a clear fallback route. The split feels dangerous, not reckless.",
            trustChange: 4,
            chaosChange: -4,
          },
          diplomat: {
            outcome:
              "You let each family choose who goes ahead and who stays. The choice is hard, but resentment has less room to grow.",
            trustChange: 3,
            humanityChange: 2,
          },
        },
      },
      {
        id: "c-06d",
        requiredRole: "scavenger",
        text: "Open only the lead truck and ignore the tempting locked trailers.",
        outcome:
          "You find water, filters, and road flares in the cab compartment. It is less than greed wanted and more than survival needed.",
        hopeChange: 8,
        trustChange: 6,
        chaosChange: -6,
        humanityChange: 4,
      },
      {
        id: "c-06e",
        requiredRole: "medic",
        text: "Search the passenger bus for survivors before touching the cargo.",
        outcome:
          "You find two dehydrated drivers under a tarp. One knows the buried service road that leads around the storm wash.",
        hopeChange: 11,
        trustChange: 7,
        chaosChange: -5,
        humanityChange: 12,
      },
      {
        id: "c-06f",
        requiredRole: "guardian",
        text: "Set a hard fifteen-minute timer and enforce the retreat.",
        outcome:
          "People curse you while leaving full crates behind. They thank you later when the storm swallows the convoy whole.",
        hopeChange: 4,
        trustChange: 10,
        chaosChange: -8,
        humanityChange: 5,
      },
    ],
  },
  {
    id: "scenario-07",
    title: "The Aurora Warning",
    setting:
      "Day 51. Midnight turns green, violet, and impossible. An aurora blooms over the lake even though the old world said it should not be visible this far south. Your cracked radio whispers in your own voice.",
    futureMsg:
      "The sky is not beautiful by accident. It is the timeline bleeding through. Listen, but do not obey every voice that sounds like you. Some futures learned to lie.",
    imageUrl: "/images/skyscapes/aurora-lake-sunset.png",
    choices: [
      {
        id: "c-07a",
        text: "Follow the aurora toward the strongest signal.",
        outcome:
          "The light leads you to a lake shore covered in glassy ash. You find a timeline fragment humming in the mud, and every compass points toward it.",
        hopeChange: 9,
        trustChange: -2,
        chaosChange: 8,
        humanityChange: 1,
        roleBonus: {
          scout: {
            outcome:
              "You mark the way back by carving symbols into dead trees. When the signal loops, your group does not get lost.",
            trustChange: 3,
            chaosChange: -4,
          },
        },
      },
      {
        id: "c-07b",
        text: "Record the message but refuse to act until morning.",
        outcome:
          "At sunrise, the recording still exists. So does a second track underneath it: your future self sobbing the coordinates to a place that has not happened yet.",
        hopeChange: 4,
        trustChange: 5,
        chaosChange: -3,
        humanityChange: 2,
        roleBonus: {
          engineer: {
            outcome:
              "You isolate the hidden carrier wave and prove the message was layered across two timelines, not one.",
            hopeChange: 3,
            trustChange: 2,
            chaosChange: -2,
          },
        },
      },
      {
        id: "c-07c",
        text: "Smash the radio and tell everyone the sky is only weather.",
        outcome:
          "The group sleeps. The sky fades. By morning, three people have identical dreams of a city rebuilt in sunlight — and one refuses to look at you.",
        hopeChange: -6,
        trustChange: -5,
        chaosChange: -4,
        humanityChange: -3,
        roleBonus: {
          guardian: {
            outcome:
              "You prevent panic, but your certainty becomes a wall. People feel protected and silenced at the same time.",
            trustChange: 2,
            humanityChange: -2,
          },
        },
      },
      {
        id: "c-07d",
        requiredRole: "diplomat",
        text: "Let the group hear the message together and vote on the next move.",
        outcome:
          "Fear spreads, but so does ownership. When the vote ends, even the losing side accepts the risk because the choice belongs to everyone.",
        hopeChange: 8,
        trustChange: 11,
        chaosChange: -4,
        humanityChange: 7,
      },
      {
        id: "c-07e",
        requiredRole: "medic",
        text: "Check everyone for radiation sickness before approaching the light.",
        outcome:
          "The symptoms are neurological, not radiation. You identify who is hearing the signal clearly and who is hallucinating details.",
        hopeChange: 6,
        trustChange: 6,
        chaosChange: -6,
        humanityChange: 8,
      },
      {
        id: "c-07f",
        requiredRole: "scavenger",
        text: "Use the aurora to locate anything metallic the pulse uncovered.",
        outcome:
          "The strange light reveals buried caches by reflection. You find batteries, copper wire, and a cracked device that should not have power.",
        hopeChange: 8,
        trustChange: 3,
        chaosChange: 2,
        humanityChange: 0,
      },
    ],
  },
  {
    id: "scenario-08",
    title: "The Water Filter",
    setting:
      "Day 59. The settlement's water filter begins coughing rust. The creek is running clear, but three people who drank from it last week are feverish. The spare filter is locked inside a flooded utility station.",
    futureMsg:
      "The water is where we lost the future. Not because it poisoned everyone at once — because suspicion did. Test first. Share results. Do not let thirst turn neighbors into enemies.",
    imageUrl: "/images/backgrounds/bunker.png",
    choices: [
      {
        id: "c-08a",
        text: "Ration the remaining clean water until you can repair the filter.",
        outcome:
          "The ration line is tense and humiliating, but nobody drinks from the creek. By morning, the settlement is angry, alive, and still together.",
        hopeChange: -3,
        trustChange: 4,
        chaosChange: -5,
        humanityChange: 3,
        roleBonus: {
          diplomat: {
            outcome:
              "You make ration logs public and rotate line duty. Transparency keeps the queue from becoming a powder keg.",
            trustChange: 4,
            chaosChange: -3,
          },
        },
      },
      {
        id: "c-08b",
        text: "Let people drink from the creek if they accept the risk.",
        outcome:
          "Some thank you for trusting them. Others get sick. Personal choice feels less noble when the fever spreads through shared rooms.",
        hopeChange: 4,
        trustChange: -3,
        chaosChange: 9,
        humanityChange: -6,
        roleBonus: {
          medic: {
            outcome:
              "You set up a watch list and isolate early symptoms. The outbreak is contained before it becomes a collapse.",
            trustChange: 4,
            chaosChange: -5,
            humanityChange: 4,
          },
        },
      },
      {
        id: "c-08c",
        text: "Break into the flooded station tonight and retrieve the spare filter.",
        outcome:
          "The station is unstable. You recover the filter, but one volunteer is injured when the stairs give way. Clean water returns with a cost.",
        hopeChange: 10,
        trustChange: 2,
        chaosChange: 5,
        humanityChange: -2,
        roleBonus: {
          guardian: {
            outcome:
              "You tie lifelines and rotate entry teams. The injury is minor because retreat was part of the plan.",
            trustChange: 3,
            chaosChange: -3,
            humanityChange: 2,
          },
        },
      },
      {
        id: "c-08d",
        requiredRole: "engineer",
        text: "Build a temporary charcoal filter from bunker scrap and garden sand.",
        outcome:
          "It is ugly, slow, and lifesaving. The first clean cup of water is passed hand to hand like a sacred thing.",
        hopeChange: 14,
        trustChange: 10,
        chaosChange: -8,
        humanityChange: 8,
      },
      {
        id: "c-08e",
        requiredRole: "scout",
        text: "Trace the creek upstream before anyone drinks more.",
        outcome:
          "You find a dead animal caught near the intake and a cleaner spring beyond the ridge. The route is dangerous, but the water is real.",
        hopeChange: 10,
        trustChange: 8,
        chaosChange: -4,
        humanityChange: 6,
      },
      {
        id: "c-08f",
        requiredRole: "scavenger",
        text: "Trade with a nearby garage camp for purifier cartridges.",
        outcome:
          "The trade costs tools you wanted to keep, but it buys time. The garage camp asks for a future favor you cannot yet judge.",
        hopeChange: 9,
        trustChange: 4,
        chaosChange: 1,
        humanityChange: 3,
      },
    ],
  },
  {
    id: "scenario-09",
    title: "Trial at Gate Nine",
    setting:
      "Day 67. A teenager is caught stealing rations from the storehouse. He says his little sister was starving. The crowd wants punishment. His hands will not stop shaking.",
    futureMsg:
      "Gate Nine is where we taught people what justice meant after the end. In one timeline, we chose fear and called it order. In another, we chose mercy with structure. Only one of those futures survived winter.",
    imageUrl: "/images/backgrounds/forest-safe-zone.png",
    choices: [
      {
        id: "c-09a",
        text: "Exile him to prove theft has consequences.",
        outcome:
          "The ration thefts stop for a while. So do the jokes, the music, and the small acts of honesty people used to offer freely.",
        hopeChange: -8,
        trustChange: 5,
        chaosChange: -4,
        humanityChange: -18,
        roleBonus: {
          guardian: {
            outcome:
              "You escort him to a known camp instead of the open road. The punishment is hard, but not a death sentence.",
            humanityChange: 6,
            chaosChange: -1,
          },
        },
      },
      {
        id: "c-09b",
        text: "Create a restitution sentence: work duty, public apology, and food support for his sister.",
        outcome:
          "Some call it soft. Then the teenager works twice as hard as anyone expected, and the storehouse line grows less afraid.",
        hopeChange: 12,
        trustChange: 9,
        chaosChange: -3,
        humanityChange: 14,
        roleBonus: {
          diplomat: {
            outcome:
              "You let the crowd shape the restitution terms. Because people were heard, fewer people undermine the verdict later.",
            trustChange: 4,
            chaosChange: -3,
          },
          medic: {
            outcome:
              "You discover his sister is malnourished and sick. The trial becomes a warning about your food system, not just one hungry kid.",
            hopeChange: 2,
            humanityChange: 4,
          },
        },
      },
      {
        id: "c-09c",
        text: "Cover it up quietly to avoid public anger.",
        outcome:
          "The crowd never hears about the theft, but rumors spread anyway. People trust the storehouse less than if you had told the truth.",
        hopeChange: -2,
        trustChange: -10,
        chaosChange: 5,
        humanityChange: 3,
        roleBonus: {
          scavenger: {
            outcome:
              "You replace the stolen ration from your own hidden stash. The lie holds, but you teach yourself that secrets can solve hunger.",
            trustChange: 2,
            humanityChange: -2,
          },
        },
      },
      {
        id: "c-09d",
        requiredRole: "scout",
        text: "Investigate whether the storehouse theft was part of a larger pattern.",
        outcome:
          "You find three ration logs altered by an adult guard. The teenager stole food, but someone else created the shortage.",
        hopeChange: 8,
        trustChange: 10,
        chaosChange: -2,
        humanityChange: 8,
      },
      {
        id: "c-09e",
        requiredRole: "engineer",
        text: "Build a transparent ration ledger everyone can inspect.",
        outcome:
          "Numbers do not solve hunger, but they starve suspicion. The settlement starts arguing from shared facts instead of fear.",
        hopeChange: 9,
        trustChange: 12,
        chaosChange: -6,
        humanityChange: 5,
      },
      {
        id: "c-09f",
        requiredRole: "medic",
        text: "Treat the sister first, then return to the question of justice.",
        outcome:
          "A sick child in a blanket changes the room. The crowd is still angry, but punishment no longer feels like the only proof of order.",
        hopeChange: 10,
        trustChange: 5,
        chaosChange: -3,
        humanityChange: 13,
      },
    ],
  },
  {
    id: "scenario-10",
    title: "Children of the Overpass",
    setting:
      "Day 74. A group of children controls the overpass with ropes, mirrors, and slingshots. They demand tolls from every traveler. Their leader is twelve, maybe thirteen, and speaks like someone twice that age.",
    futureMsg:
      "Do not mistake them for helpless. Do not mistake them for enemies either. In the future where we scared them, they became raiders. In the future where we listened, they became messengers.",
    imageUrl: "/images/backgrounds/desert-highway.png",
    choices: [
      {
        id: "c-10a",
        text: "Pay the toll and move on without getting involved.",
        outcome:
          "The children lower the rope and let you pass. You keep the peace, but the toll system remains for the next desperate travelers.",
        hopeChange: 1,
        trustChange: 2,
        chaosChange: -2,
        humanityChange: 1,
        roleBonus: {
          scavenger: {
            outcome:
              "You pay in useful scraps instead of food and quietly map their hiding places. The exchange is smarter than it looks.",
            trustChange: 2,
            chaosChange: -1,
          },
        },
      },
      {
        id: "c-10b",
        text: "Force your way through before they can organize.",
        outcome:
          "Your group crosses fast, but one child falls from the guardrail in the chaos. He lives. The look on his face follows you longer than the road.",
        hopeChange: -6,
        trustChange: -5,
        chaosChange: 10,
        humanityChange: -14,
        roleBonus: {
          guardian: {
            outcome:
              "You disarm the trap without striking anyone. It still feels like force, but it avoids blood.",
            chaosChange: -4,
            humanityChange: 4,
          },
        },
      },
      {
        id: "c-10c",
        text: "Offer them food in exchange for guiding travelers safely.",
        outcome:
          "Their leader pretends not to care. An hour later, three children guide your group through side streets only they understand.",
        hopeChange: 12,
        trustChange: 11,
        chaosChange: -5,
        humanityChange: 12,
        roleBonus: {
          diplomat: {
            outcome:
              "You create the first messenger pact: food for warnings, shelter for information, no weapons pointed at children.",
            trustChange: 4,
            hopeChange: 2,
            chaosChange: -2,
          },
          medic: {
            outcome:
              "You treat an infected scrape on the leader's arm. The toll becomes a conversation instead of a standoff.",
            trustChange: 3,
            humanityChange: 4,
          },
        },
      },
      {
        id: "c-10d",
        requiredRole: "scout",
        text: "Challenge their leader to show you the safest route, then follow respectfully.",
        outcome:
          "You let the child be the expert. By sunset, your group has bypassed two raider checkpoints and gained a young informant network.",
        hopeChange: 10,
        trustChange: 10,
        chaosChange: -5,
        humanityChange: 8,
      },
      {
        id: "c-10e",
        requiredRole: "engineer",
        text: "Repair the overpass warning bell and teach them how to maintain it.",
        outcome:
          "The children stop needing tolls from fear. The bell lets them warn travelers of danger before danger reaches the bridge.",
        hopeChange: 11,
        trustChange: 9,
        chaosChange: -6,
        humanityChange: 8,
      },
      {
        id: "c-10f",
        requiredRole: "guardian",
        text: "Train them to retreat instead of fight when adults threaten the bridge.",
        outcome:
          "They laugh at your drills until the second ambush. Then every child vanishes safely before the first shot is fired.",
        hopeChange: 7,
        trustChange: 8,
        chaosChange: -4,
        humanityChange: 9,
      },
    ],
  },
  {
    id: "scenario-11",
    title: "The Warlord's Offer",
    setting:
      "Day 82. A convoy marked with red cloth arrives at sunset. Their leader offers protection, fuel, and ammunition in exchange for your settlement's loyalty. No one says the word surrender, but everyone hears it.",
    futureMsg:
      "He does protect us. That is what makes the offer dangerous. Safety bought with obedience grows teeth. Refuse him without humiliating him, or defeat him without becoming him.",
    imageUrl: "/images/backgrounds/radio-tower.png",
    choices: [
      {
        id: "c-11a",
        text: "Accept the offer. Protection matters more than pride.",
        outcome:
          "The red cloth goes up over your gate. Patrols stop harassing you. So do travelers asking for help. People learn quickly who now owns the road.",
        hopeChange: 8,
        trustChange: -8,
        chaosChange: -8,
        humanityChange: -16,
        roleBonus: {
          guardian: {
            outcome:
              "You negotiate local command over your own defenses. The leash is longer, but it is still a leash.",
            trustChange: 3,
            humanityChange: 2,
          },
          scavenger: {
            outcome:
              "You hide surplus supplies before signing. If the alliance turns, your people will not be empty-handed.",
            trustChange: 2,
            chaosChange: 2,
          },
        },
      },
      {
        id: "c-11b",
        text: "Refuse publicly and dare them to attack.",
        outcome:
          "The settlement cheers until the convoy turns around without a word. The next two nights are sleepless. Pride is loud; fear is patient.",
        hopeChange: 7,
        trustChange: 6,
        chaosChange: 12,
        humanityChange: 1,
        roleBonus: {
          guardian: {
            outcome:
              "Your defiance rallies the defenders, but it also paints a target on every wall.",
            trustChange: 3,
            chaosChange: 3,
          },
        },
      },
      {
        id: "c-11c",
        text: "Offer a neutral trade pact without loyalty.",
        outcome:
          "The warlord smiles like someone deciding whether you are brave or useful. He accepts one trade route, watched closely by both sides.",
        hopeChange: 6,
        trustChange: 4,
        chaosChange: -2,
        humanityChange: 4,
        roleBonus: {
          diplomat: {
            outcome:
              "You frame the pact as mutual strength, not resistance. His pride stays intact, and your gate stays yours.",
            trustChange: 5,
            chaosChange: -5,
            humanityChange: 3,
          },
        },
      },
      {
        id: "c-11d",
        requiredRole: "scout",
        text: "Track the convoy before answering and learn what they fear.",
        outcome:
          "You discover their fuel reserves are nearly gone. The offer is not confidence — it is desperation with armor.",
        hopeChange: 8,
        trustChange: 6,
        chaosChange: -4,
        humanityChange: 2,
      },
      {
        id: "c-11e",
        requiredRole: "engineer",
        text: "Offer repairs to their failing vehicles instead of allegiance.",
        outcome:
          "Machines give both sides a way to stand down. You repair two engines and turn a conquest into a contract.",
        hopeChange: 10,
        trustChange: 8,
        chaosChange: -6,
        humanityChange: 6,
      },
      {
        id: "c-11f",
        requiredRole: "medic",
        text: "Treat their wounded before negotiations begin.",
        outcome:
          "The warlord's lieutenant survives because of you. It complicates the power dynamic, but it also makes immediate violence harder for them to justify.",
        hopeChange: 7,
        trustChange: 5,
        chaosChange: -4,
        humanityChange: 11,
      },
    ],
  },
  {
    id: "scenario-12",
    title: "The Timeline Fragment",
    setting:
      "Day 90. The shard from the aurora pulses in a sealed crate. It shows flashes of futures: a city garden, a war camp, an empty road, a child's drawing of the sun. Everyone wants a different future from it.",
    futureMsg:
      "This is where the timeline becomes a mirror. The shard will not tell you who to be. It magnifies who you already are. Choose with the person you want to become, not the person fear made today.",
    imageUrl: "/images/skyscapes/aurora-mountain-storm.png",
    choices: [
      {
        id: "c-12a",
        text: "Use the fragment to glimpse the safest path forward.",
        outcome:
          "The shard shows a narrow future where your people survive by closing every gate. It is safe, quiet, and almost completely alone.",
        hopeChange: 3,
        trustChange: 4,
        chaosChange: -10,
        humanityChange: -7,
        roleBonus: {
          scout: {
            outcome:
              "You notice the vision has blind spots. The safest path hides threats by refusing to see the people outside the walls.",
            humanityChange: 4,
            hopeChange: 2,
          },
        },
      },
      {
        id: "c-12b",
        text: "Break the fragment and end its influence.",
        outcome:
          "The shard splits into dust and light. The future becomes less certain, but the room exhales. For the first time in weeks, no one is being watched by tomorrow.",
        hopeChange: 8,
        trustChange: 7,
        chaosChange: 3,
        humanityChange: 6,
        roleBonus: {
          guardian: {
            outcome:
              "You destroy it cleanly and keep people back from the blast. Your decisiveness feels like protection instead of control.",
            trustChange: 4,
            chaosChange: -3,
          },
        },
      },
      {
        id: "c-12c",
        text: "Share the visions publicly so everyone can help choose the future.",
        outcome:
          "The meeting nearly tears itself apart. Then people start naming what they are afraid to lose. A future is not chosen that night, but a community is.",
        hopeChange: 13,
        trustChange: 11,
        chaosChange: 5,
        humanityChange: 13,
        roleBonus: {
          diplomat: {
            outcome:
              "You turn the chaos into a council. Every faction names one non-negotiable value, then one sacrifice they can live with.",
            trustChange: 5,
            chaosChange: -4,
            humanityChange: 3,
          },
          medic: {
            outcome:
              "You stop the meeting when panic starts becoming physical. People return after rest, food, and breath.",
            chaosChange: -3,
            humanityChange: 2,
          },
        },
      },
      {
        id: "c-12d",
        requiredRole: "engineer",
        text: "Build a containment rig that lets the shard power the radio without controlling decisions.",
        outcome:
          "The rig works. Future messages become clearer, but you install a manual cutoff that anyone can pull. Technology serves the group instead of ruling it.",
        hopeChange: 14,
        trustChange: 10,
        chaosChange: -7,
        humanityChange: 8,
      },
      {
        id: "c-12e",
        requiredRole: "scavenger",
        text: "Trade one sliver of the fragment to learn who else is hunting timeline tech.",
        outcome:
          "The trade reveals a map of shard sites and a list of groups already changed by them. You gain knowledge, but now others know you have a shard too.",
        hopeChange: 7,
        trustChange: -2,
        chaosChange: 8,
        humanityChange: 0,
      },
      {
        id: "c-12f",
        requiredRole: "medic",
        text: "Test whether prolonged exposure is changing people's minds or bodies.",
        outcome:
          "You find memory overlap, sleep loss, and shared grief in people who handled the shard. Naming the harm helps the group stop worshiping it.",
        hopeChange: 9,
        trustChange: 8,
        chaosChange: -6,
        humanityChange: 10,
      },
    ],
  },
  {
    id: "generated-act2-13",
    title: "Signal On The Ridge",
    setting:
      "Day 98. A faint beacon pulses from a burned ridge. Your own voice is carried in the static, promising a hidden route to water and warning of a trap ahead.",
    futureMsg:
      "The signal knows the person you have become. It offers a choice between using your instincts and trusting a future that may already be trying to rewrite you.",
    imageUrl: "/images/backgrounds/radio-tower.png",
    choices: [
      {
        id: "generated-choice-act2-13a",
        text: "Use the signal to navigate to the water source.",
        outcome:
          "You follow the ridge and find a small cache of clean water. The path is dangerous, but the signal kept you from the worst of the collapse.",
        hopeChange: 10,
        trustChange: -2,
        chaosChange: 8,
        humanityChange: 2,
      },
      {
        id: "generated-choice-act2-13b",
        text: "Ignore the beacon and scout the ridge yourself.",
        outcome:
          "You move quietly and discover the route on your own terms. The water is real, but the cost is measured in patrols missed and time lost.",
        hopeChange: 4,
        trustChange: 6,
        chaosChange: -3,
        humanityChange: 1,
      },
      {
        id: "generated-choice-act2-13c",
        text: "Destroy the beacon before others can follow it.",
        outcome:
          "The signal dies and the ridge grows silent. You keep the secret route for your people, but the future becomes a little darker.",
        hopeChange: -6,
        trustChange: 1,
        chaosChange: -12,
        humanityChange: -5,
      },
    ],
  },
  {
    id: "generated-act2-14",
    title: "The Broken Dam",
    setting:
      "Day 104. A cracked dam holds back a reservoir that could save the settlement. The structure is old, the mortar failing, and a group of desperate travelers waits below.",
    futureMsg:
      "Water can build futures. It can also wash away the fragile trust you have left. Every repair you make now changes how the next drought feels.",
    imageUrl: "/images/backgrounds/ruined-city.png",
    choices: [
      {
        id: "generated-choice-act2-14a",
        text: "Repair the dam and keep the water for your settlement.",
        outcome:
          "You shore up the breach and slow the flow. Your people breathe easier, but the travelers below learn the price of keeping the gate closed.",
        hopeChange: 6,
        trustChange: -5,
        chaosChange: -2,
        humanityChange: -8,
      },
      {
        id: "generated-choice-act2-14b",
        text: "Open the leak and let the desperate travelers refill their canteens.",
        outcome:
          "The water rushes wider and the travelers drink deeply. Your group gives life away, and the dam will need another fix sooner than hoped.",
        hopeChange: 10,
        trustChange: 8,
        chaosChange: 4,
        humanityChange: 12,
      },
      {
        id: "generated-choice-act2-14c",
        text: "Use traps to slow the flow and bargain safe passage with the travelers.",
        outcome:
          "You trade control of the water for a promise of protection. The deal is uneasy, but the reservoir stays mostly intact.",
        hopeChange: 3,
        trustChange: 7,
        chaosChange: 5,
        humanityChange: 0,
      },
    ],
  },
  {
    id: "generated-act2-15",
    title: "The Bridge Jury",
    setting:
      "Day 112. A child is accused of stealing tools from the bridge watch. The bridge is the only path between two camps. The crowd wants a quick verdict.",
    futureMsg:
      "Justice on a bridge shapes whether the future travels in fear or in responsibility. Let the choice show what kind of leaders you have become.",
    imageUrl: "/images/backgrounds/forest-safe-zone.png",
    choices: [
      {
        id: "generated-choice-act2-15a",
        text: "Sentence the child to repair the bridge under watch.",
        outcome:
          "They work under supervision and learn the cost of the stolen tools. The bridge stays safe, but some voices say the punishment was too public.",
        hopeChange: 4,
        trustChange: 6,
        chaosChange: -2,
        humanityChange: 2,
      },
      {
        id: "generated-choice-act2-15b",
        text: "Release the child and ask the community to guard the tools together.",
        outcome:
          "The theft becomes a lesson for everyone. The bridge crossing feels less like control and more like shared responsibility.",
        hopeChange: 8,
        trustChange: 14,
        chaosChange: -6,
        humanityChange: 10,
      },
      {
        id: "generated-choice-act2-15c",
        text: "Send the child to the other camp as a warning.",
        outcome:
          "The other camp hears the story and the bridge grows colder. Your people cross, but the path feels edged with fear.",
        hopeChange: -9,
        trustChange: -4,
        chaosChange: 5,
        humanityChange: -12,
      },
    ],
  },
  {
    id: "generated-act2-16",
    title: "Storm Relay",
    setting:
      "Day 118. A strange aurora pulses over the mountain radio relay. The lights and static speak of timing, sacrifice, and a chance to reroute the storm.",
    futureMsg:
      "The sky is both warning and opportunity. Your next choice decides whether this storm becomes a disaster or the same thing that finally wakes the world.",
    imageUrl: "/images/skyscapes/aurora-mountain-storm.png",
    choices: [
      {
        id: "generated-choice-act2-16a",
        text: "Use the relay to warn nearby settlements before the storm hits.",
        outcome:
          "The warning gives the settlements time to shelter. Some say you delayed the storm, others say you only changed who would feel it.",
        hopeChange: 12,
        trustChange: 10,
        chaosChange: -4,
        humanityChange: 8,
      },
      {
        id: "generated-choice-act2-16b",
        text: "Divert the power into the relay and try to collapse the storm's path.",
        outcome:
          "The engines flare and the aurora wavers. The storm shifts, but the relay overheats and someone must stay behind to keep it alive.",
        hopeChange: 5,
        trustChange: 2,
        chaosChange: 12,
        humanityChange: -3,
      },
      {
        id: "generated-choice-act2-16c",
        text: "Shut the relay down and let the storms pass without interference.",
        outcome:
          "You choose caution over control. The storm hits harder, but you keep your people from risking a machine the world may not understand.",
        hopeChange: -2,
        trustChange: 5,
        chaosChange: -6,
        humanityChange: 4,
      },
    ],
  },
];

export const INITIAL_STATS = {
  hope: 65,
  trust: 50,
  chaos: 30,
  humanity: 80,
};

export const TIMELINE_ENDINGS = [
  {
    id: "ending-rebuilding-future",
    title: "Rebuilding Future",
    imageUrl: "/images/outcomes/rebuilding-future.png",
    conditionHint: "High hope, high humanity, manageable chaos.",
    description:
      "Your choices create a fragile but growing community. The world is still broken, but people start building for children they may never meet.",
  },
  {
    id: "ending-balanced-future",
    title: "Balanced Future",
    imageUrl: "/images/outcomes/balanced-future.png",
    conditionHint: "Stats stay mostly balanced with no catastrophic weakness.",
    description:
      "Your timeline survives through compromise. It is not paradise, but it is honest, adaptable, and alive.",
  },
  {
    id: "ending-warlord-future",
    title: "Warlord Future",
    imageUrl: "/images/outcomes/warlord-future.png",
    conditionHint: "High trust through force, high chaos, low humanity.",
    description:
      "You protect your people by becoming the thing others fear. The gates are secure. The silence inside them is not peace.",
  },
  {
    id: "ending-chaotic-future",
    title: "Chaotic Future",
    imageUrl: "/images/outcomes/chaotic-future.png",
    conditionHint: "Chaos climbs too high.",
    description:
      "Too many choices spread fear faster than hope. Communities fracture into alarms, barricades, and revenge.",
  },
  {
    id: "ending-broken-future",
    title: "Broken Future",
    imageUrl: "/images/outcomes/broken-future.png",
    conditionHint: "Hope or humanity falls too low.",
    description:
      "Survival continues, but meaning does not. The future self who warned you is tired of being right.",
  },
  {
    id: "ending-isolation-future",
    title: "Isolation Future",
    imageUrl: "/images/outcomes/isolation-future.png",
    conditionHint:
      "Low chaos and low trust, with repeated secrecy or withdrawal.",
    description:
      "Your group avoids the worst dangers by closing the world out. Years later, no one knows whether you survived or simply disappeared.",
  },
];

export function getAvailableChoices(scenario, avatarId) {
  return scenario.choices.filter(
    (choice) => !choice.requiredRole || choice.requiredRole === avatarId,
  );
}

export function resolveChoiceForAvatar(choice, avatarId) {
  const bonus = choice.roleBonus?.[avatarId];

  if (!bonus) {
    return choice;
  }

  return {
    ...choice,
    outcome: bonus.outcome
      ? `${choice.outcome}

${bonus.outcome}`
      : choice.outcome,
    hopeChange: choice.hopeChange + (bonus.hopeChange ?? 0),
    trustChange: choice.trustChange + (bonus.trustChange ?? 0),
    chaosChange: choice.chaosChange + (bonus.chaosChange ?? 0),
    humanityChange: choice.humanityChange + (bonus.humanityChange ?? 0),
  };
}

export function applyChoiceToStats(currentStats, choice, avatarId) {
  const resolvedChoice = resolveChoiceForAvatar(choice, avatarId);

  return {
    hope: clampStat(currentStats.hope + resolvedChoice.hopeChange),
    trust: clampStat(currentStats.trust + resolvedChoice.trustChange),
    chaos: clampStat(currentStats.chaos + resolvedChoice.chaosChange),
    humanity: clampStat(currentStats.humanity + resolvedChoice.humanityChange),
  };
}

export function getTimelineEnding(stats) {
  if (stats.chaos >= 75 && stats.humanity <= 45) {
    return TIMELINE_ENDINGS.find(
      (ending) => ending.id === "ending-warlord-future",
    );
  }

  if (stats.chaos >= 70) {
    return TIMELINE_ENDINGS.find(
      (ending) => ending.id === "ending-chaotic-future",
    );
  }

  if (stats.hope <= 25 || stats.humanity <= 25) {
    return TIMELINE_ENDINGS.find(
      (ending) => ending.id === "ending-broken-future",
    );
  }

  if (stats.chaos <= 20 && stats.trust <= 35) {
    return TIMELINE_ENDINGS.find(
      (ending) => ending.id === "ending-isolation-future",
    );
  }

  if (stats.hope >= 75 && stats.humanity >= 70 && stats.chaos <= 55) {
    return TIMELINE_ENDINGS.find(
      (ending) => ending.id === "ending-rebuilding-future",
    );
  }

  return TIMELINE_ENDINGS.find(
    (ending) => ending.id === "ending-balanced-future",
  );
}

function clampStat(value) {
  return Math.max(0, Math.min(100, value));
}
