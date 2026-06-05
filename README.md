# Ashes Between Us

An apocalyptic butterfly-effect RPG. Your future self is trying to reach you across an unstable timeline. Choose an avatar, navigate a 10-turn run of branching moral scenarios, and watch how each decision reshapes who you become.

Built with **Next.js 15 (App Router)**, **React 19**, **Prisma 6**, and **Neon serverless PostgreSQL**, with optional **OpenAI**-powered live scenario generation.

---

## Gameplay

- Pick one of six avatars, each with a distinct trait, backstory, and starting stats.
- Each turn presents a scenario with up to six choices.
- Every choice shifts four stats — **hope**, **trust**, **chaos**, and **humanity** (0–100, clamped).
- A run ends after **10 turns** (`GAME_TURN_LIMIT`), then redirects to the timeline history / ending screen.
- The ending engine derives a final state, narrative, and score from your closing stats.
- Each playthrough is scoped to a unique `runId`, so history and scenario selection never bleed across separate games.

---

## Tech Stack

| Layer        | Technology |
| ------------ | ---------- |
| Framework    | Next.js 15 (App Router), React 19 |
| Styling      | Tailwind CSS v4 |
| ORM          | Prisma 6 with the Neon driver adapter |
| Database     | Neon serverless PostgreSQL (WebSocket adapter) |
| AI (optional)| OpenAI (`openai` SDK) for live scenario generation |
| Modules      | ES Modules (`"type": "module"`) |

---

## Project Structure

```text
app/
  layout.js              Root layout
  page.js                Landing page
  game/page.js           Main game loop (avatar select → turns → redirect)
  history/page.js        Timeline history + ending screen
  api/
    avatars/route.js         GET avatars (from DB)
    scenarios/route.js       GET all scenarios
    scenarios/generate/route.js   POST next scenario for a run
    attempts/route.js        GET/POST attempt records
    history/route.js         GET attempt history (scoped by runId)
    profile/route.js         POST AI-generated player profile
components/                UI components (ScenarioCard, ChoiceButton, StatsPanel, …)
lib/
  prisma.js                  Prisma client (Neon adapter)
  scenarioGenerationService.js   Core scenario/attempt/avatar logic
  aiScenarioService.js       OpenAI scenario generation
  aiProfileService.js        OpenAI player-profile generation
  endingEngine.js            Final state, narrative, and score
  outcomeEngine.js           Stat normalization + future-state derivation
  mockData.js                Avatars + INITIAL_STATS fallback data
prisma/
  schema.prisma              Avatar, Scenario, Choice, Attempt models
  seed.js                    Purge + seed scenarios from data/seed-packs
  seedAvatars.js             Seed avatars from mockData
  bootstrap-neon-schema.js   Create/alter tables via Neon HTTP (when db push is blocked)
data/
  seed-packs/                Per-avatar scenario JSON (6 avatars × 10 scenarios × 6 choices)
```

---

## Data Model

- **Avatar** — `id`, `name`, `trait`, `description`, `backstory`, `imageUrl`, `futureImageUrl`, `futureImageByState` (Json), `startingStats` (Json), `sortOrder`.
- **Scenario** — `id`, `title`, `setting`, `futureMsg`, `imageUrl`, `consequences` (Json), with related `choices`.
- **Choice** — `text`, `outcome`, `hopeChange`, `trustChange`, `chaosChange`, `humanityChange`, plus optional `requiredRole` / `roleBonus`.
- **Attempt** — one saved decision: `runId`, `avatarId`, `scenarioId`, `choiceId`, the four stats after the choice, and `statsAfter` (Json). Indexed by `avatarId+createdAt`, `scenarioId`, and `runId`.

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A Neon PostgreSQL database
- (Optional) An OpenAI API key for live scenario/profile generation

### 2. Install

```powershell
npm install
```

### 3. Environment

Copy `.env.example` to `.env` and fill in your values:

```env
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"   # pooled
DIRECT_URL="postgresql://...neon.tech/neondb?sslmode=require"     # non-pooled
OPENAI_API_KEY=your_openai_api_key_here
```

Optional flags:

- `ENABLE_LIVE_AI_SCENARIOS=true` — generate scenarios live via OpenAI instead of serving seeded ones.

### 4. Set up the database schema

`prisma db push` requires the non-pooled `DIRECT_URL` (port 5432). If that port is blocked on your network, bootstrap the schema over the Neon HTTP driver instead:

```powershell
npx prisma generate
node --import dotenv/config prisma/bootstrap-neon-schema.js
```

Otherwise:

```powershell
npm run db:push
```

### 5. Seed data

```powershell
npm run db:seed:avatars   # seed the six avatars
npm run db:seed           # purge + import scenarios from data/seed-packs
```

### 6. Run the dev server

```powershell
npm run dev
```

Open http://localhost:3000.

---

## NPM Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push the Prisma schema (needs `DIRECT_URL`) |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:seed` | Purge and reseed scenarios from `data/seed-packs` |
| `npm run db:seed:avatars` | Seed avatars from `lib/mockData.js` |
| `npm run db:studio` | Open Prisma Studio |

---

## Seeding Scenarios

`data/seed-packs/` holds one JSON file per avatar. The seeder reads every `*.json` there (except `*.schema.json`), purges all existing `Scenario` and `Choice` rows, then imports fresh. Each pack provides exactly **6 choices per scenario**; `seed.js` prefixes IDs as `seed-{avatarId}-{scenarioId}`.

To replace content: drop new packs into `data/seed-packs/`, remove the old ones, and run `npm run db:seed`.

---

