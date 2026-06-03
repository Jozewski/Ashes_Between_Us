# Frontend Execution Plan - Ashes Between Us

Date: 2026-06-03
Owner: Frontend (feature/frontend-game-ui)

## Scope Guardrails

Only edit frontend-owned files:
- app/page.js
- app/game/page.js
- app/history/page.js
- components/*
- app/globals.css
- public/images/*
- frontend-only docs

Do not edit backend-owned files:
- app/api/*
- lib/prisma.js
- prisma/*
- package.json (unless team agrees)

## Current State Snapshot

Already implemented:
- Landing page with clear visual direction and Start button.
- Game page with scenario, future message, choices, outcome, and stat updates.
- History page and timeline component.
- API-first fetch with fallback to mock scenarios.

Gaps to reach MVP quality from frontend side:
- Offline/local fallback for attempts and history while API routes are stubs.
- Basic ending logic on frontend (if backend ending logic is not ready).
- Better accessibility and keyboard/focus states.
- Guardrails for null or partial data from API.
- Visual polish pass for responsive behavior and consistency.

## Phase Plan

### Phase 1 - Frontend Reliability (Priority: High)

Goal:
- Ensure full playable loop even when backend is unavailable.

Tasks:
1. Add localStorage fallback for attempt saves in app/game/page.js.
2. Read local attempts in app/history/page.js when /api/history is unavailable.
3. Keep API-first behavior so backend can take over automatically later.
4. Add user-facing fallback hints (not error-heavy).

Acceptance criteria:
- User can start game, make choices, continue, and see timeline history with backend offline.
- If backend becomes available, API data is used first.

### Phase 2 - Gameplay UX and Ending Logic (Priority: High)

Goal:
- Deliver complete emotional loop with simple ending outcomes.

Tasks:
1. Add basic ending resolver in app/game/page.js (ex: hopeful, fractured, authoritarian, collapse).
2. Persist final ending summary for display in app/history/page.js.
3. Show end state card before navigation to history.

Acceptance criteria:
- Final scenario shows clear ending result based on stats.
- Ending appears in history view.

### Phase 3 - Accessibility and Interaction Quality (Priority: Medium)

Goal:
- Improve usability and keyboard support.

Tasks:
1. Replace hover-only behaviors in components/ChoiceButton.js with class-based focus-visible styles.
2. Ensure interactive controls have visible focus states.
3. Add ARIA labels where needed for key controls and status text.

Acceptance criteria:
- Full keyboard navigation is usable.
- Focus ring and active states are visible and consistent.

### Phase 4 - Visual Polish and Content Expansion (Priority: Medium)

Goal:
- Strengthen atmosphere and consistency across screens.

Tasks:
1. Refine spacing/typography rhythm across landing, game, and history pages.
2. Add image placeholders and style-safe fallbacks for missing assets.
3. Add subtle staged transitions for scenario -> outcome -> next scenario.

Acceptance criteria:
- UI feels cohesive on desktop and mobile.
- Missing images do not break layout.

## File-by-File Change Map

- app/page.js
  - Keep current structure; only minor polish and CTA microcopy updates if needed.

- app/game/page.js
  - Add attempt persistence fallback and ending resolver.
  - Improve navigation from hard redirect to router navigation.

- app/history/page.js
  - Merge API data with local fallback.
  - Add ending summary section.

- components/ChoiceButton.js
  - Replace inline mouse event style mutation with classes and focus-visible styles.

- components/ScenarioCard.js
  - Add null-safe title rendering and image fallback safeguards.

- components/StatsPanel.js
  - Clamp stat bar width to 0-100 and harden against invalid values.

- app/globals.css
  - Add reusable utility classes for focus styles and small motion presets.

## Branch Workflow

- Work only on feature/frontend-game-ui.
- Keep commits small and scoped by phase.
- Open PR with a checklist tied to acceptance criteria above.

Suggested commit sequence:
1. feat(frontend): add local attempt/history fallback for offline loop
2. feat(frontend): add basic ending resolver and ending summary UI
3. fix(frontend): improve accessibility and focus-visible states
4. style(frontend): responsive polish and transition tuning

## Definition of Done (Frontend)

- Playable loop works with and without backend availability.
- User sees consequence and stat changes clearly after each choice.
- History reliably displays decisions made in session.
- Ending is shown and understandable.
- Core screens are responsive and keyboard-accessible.
