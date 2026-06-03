# Client

An apocalyptic butterfly-effect RPG. Your future self is trying to reach you. Every choice ripples forward.

---

## Tech Stack

- Next.js App Router
- Prisma + PostgreSQL (Neon)
- Tailwind CSS v4
- Google Fonts: Bebas Neue, Share Tech Mono, Barlow

---

## Planning Docs

- [Project Roadmap](./PROJECT_ROADMAP.md)
- [Frontend Execution Plan](./FRONTEND_EXECUTION_PLAN.md)

---

## Branch Strategy

| Branch | Owner | Scope |
|---|---|---|
| `main` | Both | Clean, merged only |
| `feature/frontend-game-ui` | Person 1 | All UI, components, pages |
| `feature/backend-api-prisma` | Person 2 | Prisma, seed, API routes |

**Do not push directly to main. Open a PR.**

---

## Getting Started

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.

Frontend works immediately with mock data (`lib/mockData.js`). API routes return 501 stubs until the backend branch merges.

---

## File Structure

```
app/
  page.js                  # Landing page
  layout.js                # Root layout + fonts
  globals.css              # Tailwind v4 + animations
  game/page.js             # Main game screen
  history/page.js          # Timeline history
  api/
    scenarios/route.js     # GET all scenarios (stub → real)
    attempts/route.js      # POST save attempt (stub → real)
    history/route.js       # GET attempt history (stub → real)

components/
  StatsPanel.js            # Hope / Trust / Chaos / Humanity bars
  FutureMessageCard.js     # Warning from future self
  ScenarioCard.js          # Scenario title, image, setting text
  ChoiceButton.js          # Choice with stat preview tags
  OutcomeCard.js           # Post-choice consequence + stat changes
  TimelineHistory.js       # Full choice history list

lib/
  mockData.js              # Mock scenarios (remove after backend merge)
  prisma.js                # Prisma singleton (used by Person 2)

prisma/
  schema.prisma            # Person 2 owns this
  seed.js                  # Person 2 owns this

public/
  images/                  # Drop scenario backgrounds + portraits here
```

---

## Connecting Frontend to Backend

When Person 2's API routes are live, the frontend switches automatically. The game page tries `/api/scenarios` first and falls back to mock data on failure — so the UI never breaks during development.

Once the backend branch merges:
1. Delete `lib/mockData.js` (or keep for testing)
2. Person 2 replaces stub route files with real Prisma implementations
3. Test the full flow: land → choose → save → history

---

## Image Prompts (for generation)

Style: `cinematic apocalyptic RPG concept art, dramatic lighting, muted colors, warm hopeful light, no text, no logos`

Backgrounds: ruined city, radio tower, underground bunker, forest safe zone, desert highway  
Portraits: future-survivor, future-leader, future-broken, future-warlord  
Icons: supply crate, cracked radio, timeline shard

Place generated images in `public/images/` and reference via `scenario.imageUrl`.

---

## Stats

| Stat | Color | Meaning |
|---|---|---|
| Hope | Gold | Belief in a better future |
| Trust | Teal | Strength of your alliances |
| Chaos | Red | Instability in the timeline |
| Humanity | Sage | Your moral compass |

Stats are clamped 0–100 and updated after every choice.
