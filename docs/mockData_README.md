# Project Discovery: Apocalypse — Expanded mockData.js

Copy `mockData.js` into your project at:

```txt
lib/mockData.js
```

What is included:
- 6 playable avatars
- 12 scenarios
- 73 total choices
- general choices and avatar-specific choices using `requiredRole`
- avatar-specific alternate consequences using `roleBonus`
- `INITIAL_STATS`
- `TIMELINE_ENDINGS`
- helper functions:
  - `getAvailableChoices(scenario, avatarId)`
  - `resolveChoiceForAvatar(choice, avatarId)`
  - `applyChoiceToStats(currentStats, choice, avatarId)`
  - `getTimelineEnding(stats)`

Important:
`requiredRole` and `roleBonus` are frontend mock helpers. If you seed Prisma directly from this later, either strip those fields or add schema columns / JSON fields to support them.
