# Mock Data

`lib/mockData.js` is fallback/sample data for local development and resilience. The production content path is the database seeded from `data/seed-packs/`, but the app still uses mock data when the database or AI services are unavailable.

## Contents

`lib/mockData.js` includes:

- six playable avatars
- avatar images and future-state image mappings
- avatar starting stats
- legacy/example scenarios
- local timeline endings
- stat helpers

## Current Role

The app uses mock data for:

- avatar fallback when database avatar loading fails
- local ending fallback data
- helper functions used by tests
- deterministic fallback behavior when AI or database calls fail

The seeded scenario packs are the current source of authored gameplay scenarios. Do not add new primary scenario content to `mockData.js` unless the goal is fallback/demo behavior.

## Seeded Content

Primary scenario content lives in:

```text
data/seed-packs/
```

Each avatar pack should provide:

- 20 scenarios per avatar
- 6 choices per scenario
- explicit `imageUrl` values
- `imageKeywords` in scenario consequences where useful for image matching

Run:

```powershell
npm run db:seed:avatars
npm run db:seed
```

## Notes

- `requiredRole` and `roleBonus` are supported in older mock scenarios and choice logic.
- Prisma stores choice metadata in structured columns plus optional JSON fields.
- Keep avatar definitions in sync with `prisma/seedAvatars.js` expectations.
