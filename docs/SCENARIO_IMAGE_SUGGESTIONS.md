# Scenario Image Suggestions

Use this document when adding, replacing, or generating scenario images.

The current goal is for each avatar to have enough unique avatar-specific images, plus shared background images, so a 20-scenario pool can avoid obvious repetition during normal play.

## Image Requirements

- 16:9 or crop-friendly widescreen composition.
- Cinematic post-collapse RPG tone.
- No visible text, labels, logos, watermarks, contact-sheet borders, or filename strips.
- Important action should live near the center third of the image.
- Avoid placing critical details only at the top or bottom edge.
- Scenes should show concrete conflict objects: radios, ledgers, gates, medicine, water valves, fuel, maps, ballots, convoy seats, barricades, tools.
- Images should be readable behind the game UI.

## Current Image Strategy

Preferred order:

1. Use an avatar-specific image when the scenario is clearly tied to that avatar.
2. Use a shared background image when the setting is universal and fits multiple avatars.
3. Avoid reusing the same image within the same avatar's 20-scenario pool unless there is a deliberate reason.

Primary references:

```text
lib/imageAssetCatalog.js
docs/SCENARIO_IMAGE_KEYWORD_MAP.md
data/seed-packs/
```

## Priority Shared Background Concepts

These concepts are useful across multiple avatars and can support scenarios that are not strongly role-specific.

| Suggested file | Scene |
| --- | --- |
| `contested-resource-hearing.png` | Rival survivor factions around a civic table with water cans, ration ledgers, and tense torchlight. |
| `failed-rescue-witnesses.png` | Collapsed overpass rescue scene with witnesses, stretchers, and a visible moral dilemma. |
| `sabotaged-infrastructure-repair.png` | Damaged aqueduct, floodgate, or power system repair site with guards and scavenged tools. |
| `public-reckoning-ritual.png` | Trial, oath, or public accountability ritual in a repurposed school or civic hall. |
| `threatened-fog-market.png` | Foggy barter market with colored cloth signals, traders, and a threat about to surface. |
| `limited-evacuation-convoy.png` | Too few seats in an evacuation convoy, with families, fuel carriers, and scouts arguing near vehicles. |
| `quarantine-triage-dispute.png` | Makeshift clinic or train-station triage line with quarantine tension and scarce medicine. |
| `misinformation-radio-room.png` | Damaged radio room crowded with listeners, maps, accused broadcaster, and storm light. |
| `shelter-leadership-vote.png` | Underground shelter vote during power failure with raised hands, tokens, or improvised ballots. |
| `refugee-border-crossing.png` | Improvised checkpoint between settlements with refugees, guards, and uncertain dawn. |
| `unclear-salvage-claim.png` | Salvage yard around a half-buried truck or resource cache claimed by multiple groups. |
| `weather-hidden-loyalties.png` | Storm, flood, or blizzard forcing rivals into shared shelter. |

## Avatar-Specific Direction

### Scout

Prioritize:

- maps, routes, watch posts, hidden paths, signal triangulation, rescue witnesses
- scenes where observation changes the moral choice

### Medic

Prioritize:

- fever wards, triage disputes, medicine allocation, quarantine, orphaned patients
- scenes where care must be rationed or delayed

### Engineer

Prioritize:

- generators, water grids, bridges, solar arrays, cooling failures, repair crews
- scenes where systems and people fail together

### Guardian

Prioritize:

- gates, barricades, escort missions, defense lines, night breaches, safe passage
- scenes where protection risks becoming control

### Diplomat

Prioritize:

- councils, treaties, hearings, neutral ground, accords, disputed resources
- scenes where language changes whether violence starts

### Scavenger

Prioritize:

- warehouses, auctions, salvage claims, fuel depots, buried trucks, fog markets
- scenes where value, ownership, and scarcity collide

## Prompt Template

Use this as a baseline for image generation:

```text
Cinematic post-collapse RPG scene, [avatar/scene-specific subject], concrete conflict objects visible, dramatic natural lighting, grounded realism, center-composed action, widescreen 16:9, no text, no logos, no watermark.
```

## Replacement Checklist

When replacing an image:

1. Keep the same filename unless updating `lib/imageAssetCatalog.js`.
2. Update `docs/SCENARIO_IMAGE_KEYWORD_MAP.md` if the concept changes.
3. Check matching seed scenarios in `data/seed-packs/`.
4. Run:

```powershell
node prisma/check-scenario-images.js
npm run test -- lib\futureSelfService.test.js lib\seedPacks.test.js
```
