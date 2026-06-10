# App Overview

This document describes the current Ashes Between Us app behavior and where to change major systems.

## Player Flow

1. Player lands on `/`.
2. Player clicks `Start Transmission`.
3. App routes to `/game?selectAvatar=1`.
4. Player selects an avatar.
5. The game starts a fresh session `runId`.
6. Player completes 10 scenario choices.
7. App routes to `/history`.
8. Final archive loads profile and ending story, showing a timeline-fragment loading screen while AI/fallback services resolve.
9. Player can start a new game from the final archive.

## Route Rules

- `/` is the opening screen.
- `/game?selectAvatar=1` shows avatar selection.
- `/game` with a saved avatar continues/generates the current run.
- `/game` without a saved avatar redirects to `/`.
- `Start Transmission` and `Change avatar` are the only intended avatar-selection entry points.
- `/history` renders the final archive for the current `runId`.
- `New game` clears saved avatar, username, and run id, then routes to `/`.

Relevant files:

```text
components/StartTransmissionButton.js
app/game/page.js
app/history/page.js
```

## Game State

Client/session storage keys:

| Key | Storage | Purpose |
| --- | --- | --- |
| `abu_avatar_v1` | `localStorage` | selected avatar id |
| `abu_username_v1` | `sessionStorage` | player-entered name |
| `abu_run_id_v1` | `sessionStorage` | current run scope |
| `abu-muted` | `localStorage` | global audio mute |

Attempts are saved to the database with `runId` and `username`, so final archive APIs can reconstruct the current run and use the player name.

## Scenario Selection

The stable authored path is seeded scenarios:

```env
ENABLE_LIVE_AI_SCENARIOS=false
```

When live AI scenarios are enabled, the scenario API attempts OpenAI generation and falls back when needed.

Relevant files:

```text
app/api/scenarios/generate/route.js
lib/scenarioGenerationService.js
lib/futureSelfService.js
lib/aiScenarioService.js
data/seed-packs/
```

## Final Archive

The final archive is rendered by:

```text
app/history/page.js
components/final-results/FinalResultsPanel.jsx
```

The page loads:

- attempt history for the current `runId`
- avatars
- AI/fallback player profile from `/api/profile`
- AI/fallback ending story from `/api/ending-story`

While profile or ending story is still pending, the final archive displays a pulsing timeline-fragment loading screen.

The final layout uses three large-screen columns:

- left: final archive title, avatar image, survivor record, beginning story
- center: future self, final outcome story, future signal reading
- right: final stats, future notes, latest branch, controls, timeline record

## AI Profile

`lib/aiProfileService.js` creates:

- `profileTitle`
- `bio`
- `backstory`
- `futureNotes`

Important prompt rules:

- backstory is pre-collapse, before the collapse event
- if the username is not `Traveler`, use it in profile title and backstory
- future notes must be tactical and non-repetitive
- fallback content is deterministic

## AI Ending Story

`lib/aiEndingStoryService.js` creates:

- `title`
- `summary`
- `futureSignalReading`
- `closingLine`

Important prompt rules:

- avatar-specific ending
- based on all recorded choices
- explains whether the player listened to, misunderstood, exploited, feared, or ignored future transmissions
- uses the player username naturally when one was entered
- fallback content is deterministic

## Images

Scenario images are inventoried in:

```text
lib/imageAssetCatalog.js
docs/SCENARIO_IMAGE_KEYWORD_MAP.md
```

Seeded scenarios should provide explicit `imageUrl` values. `imageKeywords` help image matching and future maintenance.

Audit image file coverage with:

```powershell
node prisma/check-scenario-images.js
```

## Audio

Audio is controlled by:

```text
components/MusicProvider.js
lib/audioTracks.js
lib/scenarioAudioLoop.js
lib/endingAudioMap.js
```

Scenario music advances by scenario turn, not image. The start/avatar-selection clip is intentionally separate from the scenario loop.

## Tests

Useful focused commands:

```powershell
npm run test -- lib\aiProfileService.test.js lib\aiEndingStoryService.test.js
npm run test -- lib\scenarioAudioLoop.test.js lib\futureSelfService.test.js
npm run test
```

Use Playwright after route or responsive layout changes:

```powershell
npm run test:e2e
```
