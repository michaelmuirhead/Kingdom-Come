# Kingdom Come

A client-side grand-strategy simulation. Built for iPad as a PWA.

**Status:** v0.1 — Skeleton playable from January 1200 through a ten-year campaign as Capetian France.

The canonical design lives in `DESIGN.md`. The technical architecture lives in `TECH.md`. The v0.1 build plan (this milestone) lives in `ROADMAP_V01.md`.

---

## What v0.1 ships

You can:

- Pick France (the default — nation-picker UI lands post-v0.1) and play forward.
- See the world at January 1200 — 42 hand-authored Western European provinces, 11 starting nations, 18 historical characters.
- Pan and pinch-zoom the SVG map; tap a province to inspect it; tap a foreign owner to inspect them.
- Watch the in-game clock advance at speeds 1–5, pause and resume.
- Collect tax income and regenerate manpower each month.
- Watch rulers age; rolls for health drain and mortality every month, plot-armoured to historical death years.
- Resolve succession by salic / absolute / male-preferred / elective primogeniture when a ruler dies; the game auto-pauses for the moment, queues an event, and triggers an emergency autosave.
- Declare war on a foreign nation, raise an army, march it across provinces (1–3 months depending on terrain), and resolve battles instantly with proportional casualties, retreat to a friendly adjacent province, and occupation flipping.
- Save manually to one of five slots; yearly rotating autosaves write to three more; emergency autosave fires on ruler death.
- Install on iPad Safari via **Share → Add to Home Screen** — the app opens full-screen, landscape-locked, with a custom icon.

---

## Tech stack

- **Next.js 14** (App Router) — `app/`
- **TypeScript 5** strict mode + `noUncheckedIndexedAccess`
- **Tailwind CSS 3** for styling
- **Zustand 4** for state — one store per concern, snapshot/hydrate for save/load
- **Zod 3** for schema validation of authored content
- **Vitest 1** + React Testing Library — 379 tests passing as of v0.1
- **sharp** for PWA icon generation
- **tsx** for one-off scripts (content validation, icon generation)

No Redux, no state-machine libraries, no animation libraries, no backend.

## Scripts

```bash
npm install              # install dependencies
npm run dev              # start dev server on localhost:3000
npm run build            # production build
npm run start            # run production build
npm run typecheck        # tsc --noEmit
npm run lint             # next lint
npm run test             # vitest watch mode
npm run test:run         # vitest one-shot run
npm run format           # prettier --write
npm run format:check     # prettier --check
npm run validate-content # CLI Zod + cross-reference check of /src/data
npm run generate-icons   # rebuild /public/icons from the source SVG
```

## Project layout

```
/app                     Next.js routes
  /play                  The game screen
/src
  /engine                Simulation logic (no React, no Zustand outside orchestrators)
    economy/    military/    diplomacy/    dynasty/
    tickEngine.ts        Heartbeat — runs every subsystem tick in order
    orchestrator.ts      Multi-store side effects (handleRulerDeath, resolveBattle, declareWar, raiseArmy, setArmyMovement)
    rngStreams.ts        Per-subsystem deterministic RNG streams
  /stores                Zustand stores — one per concern
  /types                 Pure interface declarations
  /data                  Hand-authored content + Zod schemas
  /components            React UI (map, drawers, dialogs, HUD, shared)
  /hooks                 useTickLoop, useMapGestures, useProvinceColor
  /lib                   Pure helpers (RNG, dates, vectors, geometry, gestures)
  /persistence           contentLoader, saveGame, loadGame, storage, migrations
  /constants             Tuning numbers
/tests                   Mirrors /src; 379 tests
/scripts                 validateContent.ts, generateIcons.ts
/public                  Manifest, icons, static assets
```

See `TECH.md` Section 3 for the full canonical layout.

---

## Known v0.1 limitations

These are deliberate — they're scoped for v0.2 and beyond, not bugs.

**Content:**
- 42 Western European provinces only (no Eastern Europe, Africa, Asia, Americas).
- 11 nations (the 10 from the roadmap plus the Almohads for the Reconquista). Scotland and Ireland are absent.
- 18 starting characters — rulers + immediate family + a few claimants. No commoners, no councils, no full courts.
- No traits, religions (beyond Catholic / Sunni stubs), tech tree, archetypes, estates, buildings, or trade goods modelled beyond a string id.

**Mechanics:**
- Combat is abstracted: total size × ±10% RNG, no combat width, no terrain modifiers, no general traits, no morale recovery, no sieges, no naval invasions.
- Economy is tax-only: no trade nodes, no production, no building upkeep, no estate cuts, no tariffs, no loans.
- Dynasty: aging + mortality + simple primogeniture succession only. No marriage AI, no education, no plots, no traits, no consanguinity scoring.
- Diplomacy: opinions + treaties data model only. No AI ambitions, no coalitions, no threat math, no peace negotiations — wars are open-ended (close them by white peace).
- No technology, religion, politics, or ideology engines yet.
- AI doesn't initiate wars in v0.1 — only the player can.

**UI:**
- One map mode (political). Terrain / religion / culture / trade / development / diplomatic / dynasty modes have a placeholder fallback in the colour hook but no per-mode palette.
- Ideology vector is rendered as labelled axis bars, not a radar chart (v0.2).
- No general events flow beyond ruler death / succession / war declaration / battle resolved.
- No nation picker — campaigns default to France.

---

## Architecture in one paragraph

State lives in Zustand stores. The simulation runs in `/src/engine`, mostly as pure functions that take state and return state. Component render paths read from stores via narrow selectors. **Components never write to multiple stores in one user action** — multi-store writes go through orchestrators (`handleRulerDeath`, `resolveBattle`, `declareWar`, `raiseArmy`, `setArmyMovement`) in `/src/engine/orchestrator.ts`, which mutate stores in a consistent order. Content lives in `/src/data` as typed TypeScript modules; Zod schemas mirror the types and run at load time. Save/load just snapshots every store except `uiStore`.

See `TECH.md` for the long form.
