# TDD And Test Coverage Summary

Original TDD session date: 2026-06-08  
Current doc update: 2026-06-10

This file records the initial test-driven development session and the current testing direction for Ashes Between Us.

## What The Initial TDD Session Added

The project began with no automated tests. The first TDD session added Vitest and focused on the core scoring and ending systems.

Initial coverage included:

- ending score calculation
- ending-state derivation
- stat profile analysis
- stat application and clamping
- score formula analysis
- improved scoring formula tests

Key outcome: tests exposed design issues in ending priority and stat weighting.

## Design Decisions From TDD

### Broken Ending Priority

Critically low hope or humanity should take priority over high chaos. A timeline with no hope or humanity left should feel broken, even if it is also unstable.

### Stricter Rebuilding Threshold

Rebuilding should require stronger chaos control. The threshold was tightened so a rebuilding ending feels earned.

### Trust And Hope Weighting

The scoring formula was adjusted so:

- trust matters more than raw chaos control
- hope matters slightly more than humanity in constructive scoring
- community cohesion has stronger impact on final score

## Current Test Areas

The test suite has expanded beyond the original scoring work. Current important test files include:

```text
lib/endingEngine.test.js
lib/gameEngine.test.js
lib/futureSelfService.test.js
lib/seedPacks.test.js
lib/aiProfileService.test.js
lib/aiEndingStoryService.test.js
lib/scenarioAudioLoop.test.js
lib/scoreAnalysis.test.js
lib/improvedScoring.test.js
```

## Current Focused Test Commands

Profile and ending-story prompt behavior:

```powershell
npm run test -- lib\aiProfileService.test.js lib\aiEndingStoryService.test.js
```

Scenario image matching and audio loop behavior:

```powershell
npm run test -- lib\scenarioAudioLoop.test.js lib\futureSelfService.test.js
```

Seed-pack validation:

```powershell
npm run test -- lib\seedPacks.test.js
```

All unit tests:

```powershell
npm run test
```

End-to-end tests:

```powershell
npm run test:e2e
```

## Current Testing Guidelines

- Add focused tests for prompt rules, fallback behavior, and deterministic helpers.
- Keep prompt tests specific enough to prevent regression but not so brittle that wording changes become painful.
- Test route behavior with Playwright when changing `/`, `/game`, `/history`, Start Transmission, Change avatar, or New Game.
- Test seed packs after changing scenario counts, choices, image URLs, or image keywords.
- Test audio loop behavior after reordering scenario tracks.

## Useful Future Coverage

High-value tests still worth adding:

- Start Transmission opens avatar selection.
- Change avatar returns to avatar selection and plays the start clip.
- New Game returns to opening screen.
- Final archive loading state appears while profile/ending story are pending.
- Final archive handles failed profile/story APIs with fallback content.
- Full 10-turn seeded run reaches `/history`.

## Maintenance Notes

- Run focused tests before each commit.
- Run all tests before merging larger feature branches.
- Run Playwright after route or responsive layout changes.
- Keep this file high-level; detailed current architecture belongs in `README.md` and `docs/APP_OVERVIEW.md`.
