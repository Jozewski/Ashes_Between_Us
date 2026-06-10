# Project Roadmap

Last updated: 2026-06-10

## Vision

Ashes Between Us is a choice-driven post-collapse RPG about receiving warnings from a future self and deciding whether to trust, resist, misunderstand, or exploit them. The game should feel polished, imaginative, and morally specific rather than generic survival fiction.

## Current Release Shape

Implemented:

- Opening screen with Start Transmission CTA.
- Avatar selection for six avatars.
- Seeded per-avatar scenario packs.
- 10-turn gameplay loop.
- Six choices per scenario.
- Four tracked stats: hope, trust, chaos, humanity.
- Current-run history scoped by `runId`.
- Player name capture and final story/profile use.
- Final archive screen with three-column layout.
- AI/fallback player profile.
- AI/fallback ending story.
- Final archive loading state with pulsing timeline fragment.
- Turn-based scenario audio loop.
- Ending-state audio.
- Scenario image matching through explicit image URLs and keyword metadata.

## Design Pillars

1. **Specific moral pressure**
   Choices should be concrete, not vague good/evil options.

2. **Avatar identity matters**
   A Scout scenario should feel different from a Medic scenario before the avatar label is read.

3. **Future transmissions are interpretable**
   Warnings should be useful but not always obvious. The final story should explain whether the player listened, misunderstood, or ignored them.

4. **The final archive is the payoff**
   The final screen should make the ending feel earned through a personalized story, visible stats, timeline record, and future-self framing.

5. **Fallbacks should still feel authored**
   Missing OpenAI or database failures should not produce broken or empty screens.

## Near-Term Priorities

### 1. Final Archive Polish

Status: active

Goals:

- Keep all three large-screen columns visually balanced.
- Ensure final stats, future notes, latest branch, and timeline record have clear hierarchy.
- Keep future-self image fully visible.
- Keep final story and beginning story length balanced against the right-column timeline.

Files:

```text
app/history/page.js
components/final-results/FinalResultsPanel.jsx
lib/aiProfileService.js
lib/aiEndingStoryService.js
```

### 2. Seed Pack Quality

Status: active

Goals:

- Maintain 20 scenarios per avatar.
- Keep six polished choices per scenario.
- Reduce vague or repetitive future transmissions.
- Keep each scenario paired with a fitting unique image when possible.
- Use shared background assets only when they genuinely fit the scene.

Files:

```text
data/seed-packs/
lib/imageAssetCatalog.js
docs/SCENARIO_IMAGE_KEYWORD_MAP.md
```

### 3. AI Prompt Guardrails

Status: active

Goals:

- Avoid vague final summaries.
- Keep profile backstory pre-collapse.
- Make future notes tactical and non-repetitive.
- Use the player name naturally when present.
- Explain final score/state through concrete choices.

Files:

```text
lib/aiProfileService.js
lib/aiEndingStoryService.js
```

### 4. Test Coverage

Status: ongoing

Current useful suites:

```powershell
npm run test -- lib\aiProfileService.test.js lib\aiEndingStoryService.test.js
npm run test -- lib\scenarioAudioLoop.test.js lib\futureSelfService.test.js
npm run test
```

Next useful tests:

- route behavior around Start Transmission, Change avatar, and New Game
- final archive loading state
- seeded scenario pack validation beyond counts/images
- API route fallbacks for profile and ending story

## Medium-Term Roadmap

### Scenario Continuity

Improve "next scenario" selection so it uses the previous choice as narrative context without fully handing scenario authorship to live AI.

Preferred direction:

- seeded scenario pool remains the source of playable content
- AI can help select the next best scenario from the authored pool
- choice history informs selection pressure
- no repeated scenario images within a run when avoidable

### Final Ending Variants

Expand local fallback endings so each avatar has richer endings for:

- rebuilding
- balanced
- broken
- chaotic
- isolation/warlord edge states where applicable

### Accessibility And QA

Targets:

- verify keyboard flow through avatar selection and choices
- confirm loading states are readable
- verify responsive final archive layout
- run Playwright after route/layout changes

## Maintenance Rules

- Keep `.env` out of commits.
- Prefer seeded scenarios for authored QA: `ENABLE_LIVE_AI_SCENARIOS=false`.
- Run `npm run db:seed` after changing seed packs.
- Run focused tests before committing prompt, audio, image, or layout changes.
- Update docs when route behavior, env flags, seed format, or final archive layout changes.
