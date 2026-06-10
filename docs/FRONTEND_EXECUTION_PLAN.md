# Frontend Execution Plan

Last updated: 2026-06-10

This plan tracks current frontend behavior and polish priorities for Ashes Between Us. It replaces the early MVP execution plan that assumed API routes were still stubs.

## Current Frontend Scope

Primary UI files:

```text
app/page.js
app/game/page.js
app/history/page.js
app/globals.css
components/
components/final-results/
```

Supporting client behavior:

```text
components/StartTransmissionButton.js
components/MusicProvider.js
lib/scenarioAudioLoop.js
lib/endingAudioMap.js
```

## Current Screen Flow

### Opening Screen

File: `app/page.js`

Responsibilities:

- introduce the game mood
- play/start audio after user gesture
- route to `/game?selectAvatar=1`

Important behavior:

- Start Transmission should always open avatar selection.
- It should clear prior avatar/run state so a new run starts cleanly.

### Avatar Selection

File: `app/game/page.js`

Responsibilities:

- show avatar cards
- start a new `runId`
- save selected avatar
- initialize stats
- request first scenario

Important behavior:

- only Start Transmission and Change avatar should show this screen
- direct `/game` without saved avatar should return to `/`

### Gameplay

File: `app/game/page.js`

Responsibilities:

- render scenario image and situation text
- render six choices
- show future transmission
- save attempts
- advance scenario turns
- route to `/history` after 10 choices

Important behavior:

- scenario music advances by turn, not image
- attempts include `runId` and `username`
- choice cards should remain readable without awkward wrapping on large screens
- scenario image/text area should balance against the choice column

### Final Archive

Files:

```text
app/history/page.js
components/final-results/FinalResultsPanel.jsx
```

Responsibilities:

- load current run history
- load AI/fallback profile
- load AI/fallback ending story
- show timeline-fragment loading screen while final archive content resolves
- render three balanced columns on large screens

Current large-screen column intent:

- left: final archive title, avatar image, survivor record, beginning story
- center: future self, final story, future signal reading
- right: final stats, future notes, latest branch, controls, timeline record

## Current UI Priorities

### 1. Final Archive Balance

Acceptance criteria:

- all three columns stretch to equal height on large screens
- center story column remains the main reading path
- right column does not feel empty or cramped
- future self image uses full-image rendering, not crop
- final stats sit at top right

### 2. Scenario Layout

Acceptance criteria:

- scenario image and situation text feel balanced with choices
- choices A-F use available right-side space
- Future Signal Transmission spans full width below scenario/choice grid on large screens
- scenario images focus on center area and avoid forced top-crop assumptions

### 3. Loading States

Acceptance criteria:

- final archive does not show partial/empty AI content while final story is loading
- timeline-fragment loading screen is readable and animated
- no layout jump after AI/fallback content resolves

### 4. Route UX

Acceptance criteria:

- Start Transmission opens avatar selection
- Change avatar opens avatar selection
- New Game returns to opening screen
- final screen renders after turn 10 and does not redirect unexpectedly

### 5. Audio UX

Acceptance criteria:

- start/avatar-selection clip remains separate
- scenario clips rotate by turn
- no two tracks overlap
- mute persists

## QA Checklist

Before committing frontend changes:

- Start from `/`, click Start Transmission, confirm avatar selection.
- Select avatar, confirm first scenario renders.
- Make a choice, confirm outcome and stat update.
- Continue through final turn, confirm `/history` final archive.
- Confirm final archive loading state appears while story/profile load.
- Confirm New Game returns to `/`.
- Confirm Change avatar returns to avatar selection and plays start clip.
- Confirm final stats appear at top right.
- Confirm three final archive columns are visually balanced on desktop.
- Run focused tests:

```powershell
npm run test -- lib\aiProfileService.test.js lib\aiEndingStoryService.test.js
npm run test -- lib\scenarioAudioLoop.test.js lib\futureSelfService.test.js
```

Run Playwright after route or responsive layout changes:

```powershell
npm run test:e2e
```

## Notes

- Avoid adding visible instructional text inside the app UI unless it is part of the world tone.
- Prefer dense, readable RPG interface layout over marketing-style sections once gameplay begins.
- Keep cards at modest radius and preserve the existing gritty visual language.
- Do not reintroduce image-based scenario audio mapping.
