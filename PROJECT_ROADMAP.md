# Ashes Between Us - Project Roadmap

Date: 2026-06-03

## 1) Vision

Ashes Between Us is a full-stack, choice-driven RPG set after societal collapse. The central mechanic is timeline causality: future versions of the player send warnings, and each decision shifts outcomes, stats, and ending states.

Creative direction:
- Emotional survival storytelling, not only bleak survival.
- Tradeoffs between safety, morality, trust, and long-term stability.
- Multiple possible futures, including hopeful outcomes.

## 2) Core Gameplay Loop

1. Player starts a new run.
2. Future-self transmission appears.
3. Current scenario is presented.
4. Player chooses 2 to 3 actions.
5. Immediate consequence is shown.
6. Stats are updated.
7. Choice is persisted.
8. Later scenarios and ending react to prior decisions.

## 3) MVP Scope

Required for first playable release:
- Landing page
- Start game flow
- Scenario and future-message presentation
- Choice selection with consequence display
- Stat changes after choices
- Choice history tracking
- Basic ending logic
- Cohesive visual style with generated art assets

## 4) Technical Stack

- Next.js App Router
- React
- Tailwind CSS
- Prisma ORM
- PostgreSQL on Neon
- GitHub feature-branch workflow

## 5) Ownership and Boundaries

Frontend owner (feature/frontend-game-ui):
- app/page.js
- app/game/page.js
- app/history/page.js
- app/globals.css
- components/*
- public/images/*

Backend owner (feature/backend-api-prisma):
- prisma/schema.prisma
- prisma/seed.js
- lib/prisma.js
- app/api/scenarios/route.js
- app/api/attempts/route.js
- app/api/history/route.js

Coordination rules:
- Do not modify files owned by the other contributor without agreement.
- Keep main branch merge-only through pull requests.
- Use focused commits and small PRs.

## 6) Delivery Timeline

Day 1 targets:
- Frontend: landing page, game layout, reusable components, mock-data rendering
- Backend: schema, seed data, scenario route returning live data

Day 2 targets:
- Frontend: integrate scenarios API, outcome and stats UX, history page
- Backend: attempts save route, history route, optional ending support

MVP exit criteria:
- Player can start game, make choices, see consequences and stat movement, and view stored timeline history.

## 7) Build Phases

### Phase A - Foundation Stability

Goals:
- Clean project structure and consistent local setup
- Lint baseline passing

Status:
- Completed

### Phase B - Frontend Reliability Without Backend Dependency

Goals:
- API-first behavior with graceful local fallback while API routes are still stubs
- Full playable loop even when backend is unavailable

Status:
- In progress

Deliverables:
- Local fallback save path in game flow
- Local fallback read path in history flow
- Small UI hint when local fallback is active

### Phase C - Ending Experience

Goals:
- Basic ending resolver based on final stat profile
- Ending summary presented clearly and stored for timeline view

Status:
- Planned

### Phase D - Accessibility and UX Hardening

Goals:
- Keyboard-visible focus states and improved interaction semantics
- Defensive rendering for partial/missing scenario payloads

Status:
- Planned

### Phase E - Visual and Content Polish

Goals:
- Responsive refinement across landing, game, and history
- Finalized image pack and robust fallback presentation for missing assets

Status:
- Planned

## 8) API Contracts (Frontend Expectations)

GET /api/scenarios:
- Returns scenarios with nested choices

POST /api/attempts:
- Accepts selected choice and resulting stat snapshot

GET /api/history:
- Returns prior attempts in reverse chronological order

Frontend behavior policy:
- Use API first.
- If API unavailable, continue with local fallback so gameplay remains functional.

## 9) Data Model Intent

Scenario:
- Narrative frame, setting, future message, optional image, ordered choices

Choice:
- Player action text, outcome text, stat deltas

Attempt:
- What player selected, resulting stats, timestamp

## 10) Image Direction and Asset Pack

Style direction:
- Cinematic apocalyptic RPG concept art
- Detailed environments and dramatic lighting
- Muted palette with selective warm hopeful accents
- No text and no logos

Initial reusable pack:
- Backgrounds: ruined city, radio tower, bunker, forest safe zone, desert highway
- Portraits: survivor self, leader self, broken timeline self, warlord self
- Icons: supply crate, cracked radio, timeline shard

## 11) Risks and Mitigations

Risk: Backend routes remain unavailable during frontend work.
Mitigation: Local fallback persistence and API-first swap strategy.

Risk: Scope drift across branches.
Mitigation: Ownership boundaries and PR review checklist tied to owned files.

Risk: Inconsistent visual tone.
Mitigation: Single shared art direction and curated reusable image pack.

## 12) PR Checklist

Before opening PR:
- Only owned files changed
- Lint passes locally
- Screens tested on desktop and mobile
- Keyboard flow tested for primary interactions
- Empty and fallback states validated

## 13) Next Action Queue

1. Finalize and test Phase B fallback behavior end-to-end.
2. Implement Phase C ending resolver and ending summary UI.
3. Implement Phase D accessibility and interaction improvements.
4. Complete Phase E polish and image content pass.
