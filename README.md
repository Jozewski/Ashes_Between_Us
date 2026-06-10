# Ashes Between Us

Ashes Between Us is an apocalyptic timeline RPG where a player's future self sends warnings across a collapsing timeline. The player chooses an avatar, plays a 10-turn run of authored moral scenarios, and receives a final archive that explains the ending through stats, choices, future transmissions, and avatar identity.

The app is built with **Next.js 15**, **React 19**, **Tailwind CSS v4**, **Prisma 6**, **Neon PostgreSQL**, **Howler**, and optional **OpenAI** services.

## Current Gameplay

- The opening screen starts with `Start Transmission`.
- `Start Transmission` opens avatar selection.
- `Change avatar` is the only in-game path back to avatar selection.
- Direct `/game` visits without a saved avatar return to the opening screen.
- A run lasts **10 choices**.
- Each choice changes **hope**, **trust**, **chaos**, and **humanity**.
- Attempts are scoped by a session `runId`, so the final archive shows the current run instead of mixing older attempts.
- The final archive shows:
  - pre-collapse beginning story / backstory
  - survivor record with the player name
  - future self image and description
  - final outcome story
  - future signal reading
  - final stats
  - future notes
  - latest branch
  - timeline record

## AI Behavior

The game can use OpenAI in three places:

- **Scenario generation**: optional live scenario generation.
- **Player profile**: final archive survivor record, pre-collapse backstory, and future notes.
- **Ending story**: final story summary based on the avatar, final stats, choices, and future transmissions.

For stable authored gameplay, set:

```env
ENABLE_LIVE_AI_SCENARIOS=false
```

This keeps scenario play on seeded content while still allowing AI profile and ending-story generation if `OPENAI_API_KEY` is present. If OpenAI is missing or fails, profile and ending-story services return deterministic fallback content.

## Tech Stack

| Layer | Technology |
| --- | --- |
| App | Next.js 15 App Router, React 19 |
| Styling | Tailwind CSS v4 |
| Database | Neon PostgreSQL |
| ORM | Prisma 6 with Neon serverless adapter |
| AI | OpenAI SDK |
| Audio | Howler |
| Tests | Vitest, Playwright |

## Project Structure

```text
app/
  layout.js                    Root metadata, fonts, providers
  page.js                      Opening screen
  game/page.js                 Avatar selection and 10-turn game loop
  history/page.js              Final archive and timeline record
  api/
    avatars/route.js           Avatar API
    attempts/route.js          Attempt save/read API
    ending-story/route.js      AI/fallback ending story API
    game/                      Server game APIs
    history/route.js           Current run history API
    profile/route.js           AI/fallback player profile API
    scenarios/                 Scenario APIs

components/
  final-results/               Final archive layout
  MusicProvider.js             Howler singleton audio controller
  ScenarioCard.js              Scenario image/text panel
  ChoiceButton.js              Choice card UI
  FutureMessageCard.js         Future transmission panel

data/
  seed-packs/                  Authored per-avatar scenario packs

docs/
  APP_OVERVIEW.md              Current app behavior and architecture notes
  SCENARIO_IMAGE_KEYWORD_MAP.md
  SCENARIO_IMAGE_SUGGESTIONS.md

lib/
  aiEndingStoryService.js      AI/fallback final story generation
  aiProfileService.js          AI/fallback final profile generation
  audioTracks.js               Audio manifest
  scenarioAudioLoop.js         Turn-based scenario music loop
  scenarioGenerationService.js Scenario, memory, attempt, and seed logic
  futureSelfService.js         Scenario normalization and image selection
  imageAssetCatalog.js         Scenario image inventory and aliases
  endingEngine.js              Final scoring and local endings
  outcomeEngine.js             Future-state derivation
  prisma.js                    Prisma client

prisma/
  schema.prisma                Avatar, Scenario, Choice, Attempt models
  seed.js                      Purge/reseed scenarios
  seedAvatars.js               Seed avatar records
  check-scenario-images.js     Audit DB/selectable image file coverage
```

## Data Model

- **Avatar**: playable identity, art, future images, and starting stats.
- **Scenario**: authored or generated scene with setting, future message, image, and consequences.
- **Choice**: one selectable action with stat deltas and outcome text.
- **Attempt**: one saved player decision, including `runId`, `username`, avatar, scenario, choice, outcome, and final stats after that choice.

## Scenario Content

Seed packs live in `data/seed-packs/`. The current target is:

- 6 avatars
- 20 possible scenarios per avatar
- 6 choices per scenario
- unique scenario images per avatar pack where possible
- explicit `imageKeywords`/image URLs used for image matching and seeded display

Run:

```powershell
npm run db:seed:avatars
npm run db:seed
```

`npm run db:seed` purges existing `Scenario` and `Choice` rows before importing seed packs.

## Environment

Create `.env` from `.env.example`.

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
OPENAI_API_KEY="..."
ENABLE_LIVE_AI_SCENARIOS=false
OPENAI_SCENARIO_MODEL=gpt-4o-mini
OPENAI_SCENARIO_TIMEOUT_MS=20000
ALLOW_SEEDED_SCENARIO_FALLBACK=true
```

Notes:

- `DATABASE_URL` is the pooled Neon connection string.
- `DIRECT_URL` is required for `prisma db push`.
- Never commit real secrets.
- Keep `ENABLE_LIVE_AI_SCENARIOS=false` when testing authored seeded scenarios.

## Setup

```powershell
npm install
npm run db:generate
npm run db:push
npm run db:seed:avatars
npm run db:seed
npm run dev
```

Open http://localhost:3000.

If `db:push` is blocked by network access to the direct Postgres port, use:

```powershell
node --import dotenv/config prisma/bootstrap-neon-schema.js
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest |
| `npm run test:e2e` | Run Playwright |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push Prisma schema |
| `npm run db:seed:avatars` | Seed avatars |
| `npm run db:seed` | Purge/reseed scenarios and choices |
| `npm run db:studio` | Open Prisma Studio |

## Audio

Scenario music is no longer tied to scenario images. Gameplay uses a turn-based loop in `lib/scenarioAudioLoop.js`; each new scenario advances to the next scenario music track. The avatar selection/start screen uses `start-screen.mp3` and stays separate from the scenario loop. Ending music is selected by final ending state.

See [public/audio/README.md](public/audio/README.md).

## Testing

Useful focused checks:

```powershell
npm run test -- lib\aiProfileService.test.js lib\aiEndingStoryService.test.js
npm run test -- lib\scenarioAudioLoop.test.js lib\futureSelfService.test.js
npm run test
```

Run Playwright when layout or route flow changes:

```powershell
npm run test:e2e
```

## Maintenance Notes

- Stop the dev server before regenerating Prisma client if Windows locks Prisma engine files.
- If the final archive appears blank, check `/api/history`, `/api/profile`, and `/api/ending-story`.
- If seeded scenarios feel random, check `imageKeywords`, explicit `imageUrl`, and `lib/imageAssetCatalog.js`.
- If audio repeats too much, update `SCENARIO_LOOP_TRACKS` order in `lib/scenarioAudioLoop.js`.
- If the app jumps to the opening screen unexpectedly, check route logic in `app/game/page.js`; avatar selection should only happen through `Start Transmission` or `Change avatar`.
