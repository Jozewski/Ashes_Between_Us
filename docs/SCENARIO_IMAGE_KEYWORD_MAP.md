# Scenario Image Keyword Map

Use this file when manually cropping, replacing, or keyword-matching scenario images.

The app primarily respects explicit `scenario.imageUrl` values from seeded scenario packs. Keyword aliases still matter for validation, matching, and future maintenance through `lib/imageAssetCatalog.js`. When replacing an image, keep the same path and filename unless you also update `SCENARIO_IMAGES_BY_AVATAR`, keyword aliases, and any seed-pack references.

Rendering rules:
- Compose the important action near the center of the image.
- Do not rely on text or detail at the top or bottom edge.
- Remove any filename/text strip.
- Remove white divider lines or neighboring sheet fragments.
- Do not leave contact-sheet labels, numbers, watermarks, or adjacent image edges visible.
- Prefer concrete conflict objects that make the scenario readable without captions.

Validation:

```powershell
node prisma/check-scenario-images.js
npm run test -- lib\futureSelfService.test.js lib\seedPacks.test.js
```

## Scout

| File | Scene Intent | Keywords |
| --- | --- | --- |
| `public/images/scenarios/scout/avatar-scout-the-cartographers-debt.png` | Cartographer debt, maps, route obligation | cartographer, maps, lost maps, route debt, map room |
| `public/images/scenarios/scout/avatar-scout-mountain-observation-point.png` | Mountain lookout or observation point | mountain observation, observation point, lookout, high vantage, watch ridge |
| `public/images/scenarios/scout/avatar-scout-hidden-convoy-route.png` | Hidden or secret convoy route | hidden convoy route, hidden route, convoy route, secret path, unmarked road |
| `public/images/scenarios/scout/avatar-scout-weather-hidden-loyalties.png` | Weather disaster revealing hidden loyalties | weather disaster, hidden loyalties, storm, mountain storm, flash flood, forced shelter |
| `public/images/scenarios/scout/avatar-scout-radio-signal-echo.png` | Radio signal echo or triangulation | radio signal echo, signal echo, radio signal, triangulation |
| `public/images/scenarios/scout/avatar-scout-abandoned-watch-post.png` | Abandoned watch post or lookout post | abandoned watch post, watch post, lookout post, observation tower |
| `public/images/scenarios/scout/avatar-scout-failed-rescue-witnesses.png` | Failed rescue with witnesses | failed rescue, rescue witnesses, collapsed rescue, witnesses, overpass rescue, rescue scene |
| `public/images/scenarios/scout/avatar-scout-misinformation-radio-room.png` | Misinformation radio room | misinformation, radio room, radio, broadcast, signal, false warning, accused broadcaster |
| `public/images/scenarios/scout/avatar-scout-refugee-border-crossing.png` | Refugee border crossing | refugee border, border crossing, refugees, checkpoint, guards, crossing |
| `public/images/scenarios/scout/avatar-scout-limited-evacuation-convoy.png` | Limited evacuation convoy | limited evacuation, evacuation convoy, convoy, too few seats, fuel carriers, transport |

## Medic

| File | Scene Intent | Keywords |
| --- | --- | --- |
| `public/images/scenarios/medic/avatar-medic-fever-ward-overflow.png` | Overflowing fever ward | fever ward, overflow ward, sick ward, disease outbreak |
| `public/images/scenarios/medic/avatar-medic-vaccine-lottery.png` | Vaccine lottery or medicine allocation | vaccine lottery, vaccine, lottery, medicine allocation |
| `public/images/scenarios/medic/avatar-medic-limited-evacuation-convoy.png` | Limited evacuation convoy | limited evacuation, evacuation convoy, convoy, too few seats, fuel carriers, transport |
| `public/images/scenarios/medic/avatar-medic-last-antibiotic.png` | Last antibiotic or scarce medicine | last antibiotic, antibiotic, scarce medicine |
| `public/images/scenarios/medic/avatar-medic-refugee-border-crossing.png` | Refugee border crossing | refugee border, border crossing, refugees, checkpoint, guards, crossing |
| `public/images/scenarios/medic/avatar-medic-orphaned-patient.png` | Orphaned patient | orphaned patient, patient, child patient |
| `public/images/scenarios/medic/avatar-medic-public-reckoning-ritual.png` | Public reckoning or trial ritual | public reckoning, ritual, trial, oath ceremony, public punishment, reckoning |
| `public/images/scenarios/medic/avatar-medic-quarantine-triage-dispute.png` | Quarantine or triage dispute | quarantine, triage, clinic, medical dispute, infection, medicine, ward |
| `public/images/scenarios/medic/avatar-medic-collapse-of-the-clinic.png` | Clinic collapse or clinic failure | clinic collapse, collapsed clinic, clinic failure |
| `public/images/scenarios/medic/avatar-medic-failed-rescue-witnesses.png` | Failed rescue with witnesses | failed rescue, rescue witnesses, collapsed rescue, witnesses, overpass rescue, rescue scene |

## Engineer

| File | Scene Intent | Keywords |
| --- | --- | --- |
| `public/images/scenarios/engineer/avatar-engineer-last-working-generator.png` | Last working generator | last working generator, generator, power failure |
| `public/images/scenarios/engineer/avatar-engineer-failing-water-grid.png` | Failing water grid | failing water grid, water grid, water system |
| `public/images/scenarios/engineer/avatar-engineer-bridge-restoration-project.png` | Bridge restoration or bridge repair | bridge restoration, bridge repair, restoration project |
| `public/images/scenarios/engineer/avatar-engineer-shelter-leadership-vote.png` | Shelter leadership vote | shelter vote, leadership vote, vote, council, ballots, governance |
| `public/images/scenarios/engineer/avatar-engineer-sabotaged-infrastructure-repair.png` | Sabotaged infrastructure repair | sabotaged infrastructure, infrastructure repair, repair site, aqueduct repair, floodgate repair, damaged machinery |
| `public/images/scenarios/engineer/avatar-engineer-unclear-salvage-claim.png` | Unclear salvage claim | salvage claim, unclear claim, salvage yard, resource claim, scrap, ownership dispute |
| `public/images/scenarios/engineer/avatar-engineer-damaged-solar-array.png` | Damaged solar array | damaged solar array, solar array, solar panels |
| `public/images/scenarios/engineer/avatar-engineer-contested-resource-hearing.png` | Contested resource hearing | contested resource hearing, resource hearing, public hearing, ration hearing, water rights hearing, resource dispute, council hearing |
| `public/images/scenarios/engineer/avatar-engineer-reactor-cooling-failure.png` | Reactor cooling failure | reactor cooling, cooling failure, reactor |
| `public/images/scenarios/engineer/avatar-engineer-misinformation-radio-room.png` | Misinformation radio room | misinformation, radio room, radio, broadcast, signal, false warning, accused broadcaster |

## Guardian

| File | Scene Intent | Keywords |
| --- | --- | --- |
| `public/images/scenarios/guardian/avatar-guardian-refugee-border-crossing.png` | Refugee border crossing | refugee border, border crossing, refugees, checkpoint, guards, crossing |
| `public/images/scenarios/guardian/avatar-guardian-barricade-under-siege.png` | Barricade under siege | barricade, siege, under siege, gate attack |
| `public/images/scenarios/guardian/avatar-guardian-night-watch-breach.png` | Night watch breach | night watch, breach, perimeter breach |
| `public/images/scenarios/guardian/avatar-guardian-public-reckoning-ritual.png` | Public reckoning or ritual | public reckoning, ritual, trial, oath ceremony, public punishment, reckoning |
| `public/images/scenarios/guardian/avatar-guardian-shelter-defense-line.png` | Shelter defense line | defense line, shelter defense, perimeter |
| `public/images/scenarios/guardian/avatar-guardian-convoy-escort-mission.png` | Convoy escort mission | convoy escort, escort mission, escort |
| `public/images/scenarios/guardian/avatar-guardian-limited-evacuation-convoy.png` | Limited evacuation convoy | limited evacuation, evacuation convoy, convoy, too few seats, fuel carriers, transport |
| `public/images/scenarios/guardian/avatar-guardian-weather-hidden-loyalties.png` | Weather disaster revealing hidden loyalties | weather disaster, hidden loyalties, storm, mountain storm, flash flood, forced shelter |
| `public/images/scenarios/guardian/avatar-guardian-last-safe-passage.png` | Last safe passage | last safe passage, safe passage, escape route |
| `public/images/scenarios/guardian/avatar-guardian-failed-rescue-witnesses.png` | Failed rescue with witnesses | failed rescue, rescue witnesses, collapsed rescue, witnesses, overpass rescue, rescue scene |

## Diplomat

| File | Scene Intent | Keywords |
| --- | --- | --- |
| `public/images/scenarios/diplomat/avatar-diplomat-disputed-water-rights.png` | Disputed water rights | disputed water rights, water rights, water dispute |
| `public/images/scenarios/diplomat/avatar-diplomat-unclear-salvage-claim.png` | Unclear salvage claim | salvage claim, unclear claim, salvage yard, resource claim, scrap, ownership dispute |
| `public/images/scenarios/diplomat/avatar-diplomat-border-treaty-negotiation.png` | Border treaty negotiation | border treaty, treaty negotiation, negotiation |
| `public/images/scenarios/diplomat/avatar-diplomat-council-of-rivals.png` | Council of rivals | council of rivals, rival council, council |
| `public/images/scenarios/diplomat/avatar-diplomat-contested-resource-hearing.png` | Contested resource hearing | contested resource hearing, resource hearing, public hearing, ration hearing, water rights hearing, resource dispute, council hearing |
| `public/images/scenarios/diplomat/avatar-diplomat-shelter-leadership-vote.png` | Shelter leadership vote | shelter vote, leadership vote, vote, council, ballots, governance |
| `public/images/scenarios/diplomat/avatar-diplomat-misinformation-radio-room.png` | Misinformation radio room | misinformation, radio room, radio, broadcast, signal, false warning, accused broadcaster |
| `public/images/scenarios/diplomat/avatar-diplomat-the-last-neutral-ground.png` | Last neutral ground | last neutral ground, neutral ground, neutral zone |
| `public/images/scenarios/diplomat/avatar-diplomat-public-reckoning-ritual.png` | Public reckoning or ritual | public reckoning, ritual, trial, oath ceremony, public punishment, reckoning |
| `public/images/scenarios/diplomat/avatar-diplomat-shared-harvest-accord.png` | Shared harvest accord | shared harvest, harvest accord, accord |

## Scavenger

| File | Scene Intent | Keywords |
| --- | --- | --- |
| `public/images/scenarios/scavenger/avatar-scavenger-forgotten-warehouse.png` | Forgotten warehouse | forgotten warehouse, warehouse |
| `public/images/scenarios/scavenger/avatar-scavenger-black-market-auction.png` | Black market auction | black market auction, auction, black market |
| `public/images/scenarios/scavenger/avatar-scavenger-buried-supply-truck.png` | Buried supply truck | buried supply truck, supply truck, buried truck |
| `public/images/scenarios/scavenger/avatar-scavenger-threatened-fog-market.png` | Threatened fog market | fog market, threatened market, market, barter market, black market, traders |
| `public/images/scenarios/scavenger/avatar-scavenger-refugee-border-crossing.png` | Refugee border crossing | refugee border, border crossing, refugees, checkpoint, guards, crossing |
| `public/images/scenarios/scavenger/avatar-scavenger-unclear-salvage-claim.png` | Unclear salvage claim | salvage claim, unclear claim, salvage yard, resource claim, scrap, ownership dispute |
| `public/images/scenarios/scavenger/avatar-scavenger-weather-hidden-loyalties.png` | Weather disaster revealing hidden loyalties | weather disaster, hidden loyalties, storm, mountain storm, flash flood, forced shelter |
| `public/images/scenarios/scavenger/avatar-scavenger-limited-evacuation-convoy.png` | Limited evacuation convoy | limited evacuation, evacuation convoy, convoy, too few seats, fuel carriers, transport |
| `public/images/scenarios/scavenger/avatar-scavenger-scrapyard-ownership-dispute.png` | Scrapyard ownership dispute | scrapyard, ownership dispute, scrap yard |
| `public/images/scenarios/scavenger/avatar-scavenger-abandoned-fuel-depot.png` | Abandoned fuel depot | fuel depot, abandoned fuel depot, fuel |

