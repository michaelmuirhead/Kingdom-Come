# Kingdom Come — Technical Architecture

**Version:** 1.0
**Author:** Michael Muirhead
**Last updated:** May 2026
**Companion to:** DESIGN.md

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [State Management Pattern](#4-state-management-pattern)
5. [The Simulation Engine](#5-the-simulation-engine)
6. [Data Schemas](#6-data-schemas)
7. [Zustand Stores](#7-zustand-stores)
8. [Tick Loop Architecture](#8-tick-loop-architecture)
9. [Event System](#9-event-system)
10. [Map Rendering](#10-map-rendering)
11. [Persistence (Save/Load)](#11-persistence-saveload)
12. [Seeded RNG](#12-seeded-rng)
13. [Content-Entry Tool](#13-content-entry-tool)
14. [Testing Strategy](#14-testing-strategy)
15. [Performance Strategy](#15-performance-strategy)
16. [PWA Configuration](#16-pwa-configuration)
17. [Deployment](#17-deployment)
18. [Development Workflow](#18-development-workflow)

---

## 1. Architecture Overview

Kingdom Come is a **client-side simulation** running entirely in the browser. No backend, no database, no server-side logic. Everything is JavaScript executing on the player's iPad, with state persisted to local storage.

### Three layers

```
┌─────────────────────────────────────────────────┐
│             PRESENTATION LAYER                  │
│  React components, SVG map, UI drawers          │
│  Reads from stores via Zustand selectors        │
└─────────────────┬───────────────────────────────┘
                  │ subscribes to
┌─────────────────▼───────────────────────────────┐
│              STATE LAYER                        │
│  Zustand stores (one per concern)               │
│  Single source of truth for all game state      │
└─────────────────┬───────────────────────────────┘
                  │ written to by
┌─────────────────▼───────────────────────────────┐
│             SIMULATION LAYER                    │
│  Engine modules: economy, military, diplomacy,  │
│  dynasty, tech, religion, politics, ideology    │
│  Pure functions where possible.                 │
│  Orchestrated by tickEngine() each month.       │
└─────────────────────────────────────────────────┘
```

**Key separation rule:** React components NEVER write to multiple stores in one user action. All multi-store writes go through the simulation layer's orchestration functions, which guarantee consistency.

### Why this architecture works

- **Testable simulation** — engine modules are mostly pure functions that take state and return new state. Easy to unit test without React.
- **iPad performance** — only components subscribed to changed slices re-render. The SVG map only re-renders provinces whose data changed.
- **Save/load is trivial** — just snapshot/restore every store.
- **AI uses the same simulation** — AI decisions are engine functions that produce the same state shape player decisions produce.

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Familiar, great DX, easy Vercel deploy, PWA support |
| Language | TypeScript (strict mode) | Catches data-shape bugs in a heavily data-driven game |
| Styling | Tailwind CSS | Fast iteration, no CSS file sprawl |
| State | Zustand (multiple stores) | Lightweight, no boilerplate, great with TS |
| Map | SVG + React | ~400 polygons performant; iPad-friendly gestures via React events |
| Validation | Zod | Schema validation for content files at load time |
| Testing | Vitest + React Testing Library | Fast Vite-based test runner, well-suited to module isolation |
| RNG | Custom seeded PRNG (mulberry32) | Tiny, fast, reproducible — same approach as West Francia |
| Persistence | localStorage v1, IndexedDB later | Simple to start, upgrade path clear |
| Build | Next.js default (Turbopack in dev) | Zero config needed |
| Deploy | Vercel | Already in your workflow |
| Repo | GitHub `michaelmuirhead/KingdomCome` | Same naming convention as your other projects |

### Versions (lock at project start)

- Next.js 14.x
- React 18.x
- TypeScript 5.x
- Zustand 4.x
- Tailwind 3.x
- Zod 3.x
- Vitest 1.x

### Dependencies to AVOID

- **No Redux** — overkill, more boilerplate than benefit
- **No state machine libraries (XState etc.)** — game state is too sprawling, not a finite machine
- **No animation libraries upfront** — CSS transitions are enough for v1; add framer-motion only if specific UI needs it
- **No backend / API layer** — game is fully client-side
- **No analytics / telemetry initially** — keep it simple, you can add later
- **No CSS-in-JS** — Tailwind covers everything

---

## 3. Folder Structure

```
/kingdom-come                    Project root
├── /app                         Next.js App Router
│   ├── layout.tsx               Root layout (PWA meta, fonts)
│   ├── page.tsx                 Game entry / main menu
│   ├── /play
│   │   └── page.tsx             Main game screen
│   ├── /content-tool            Content-entry tool (separate page)
│   │   ├── page.tsx
│   │   ├── /characters
│   │   ├── /provinces
│   │   ├── /nations
│   │   └── /events
│   └── /api                     (Empty for now — client-side only)
│
├── /src
│   ├── /engine                  SIMULATION LAYER
│   │   ├── /economy             Economy tick logic
│   │   ├── /military            Combat resolution, recruitment, attrition
│   │   ├── /diplomacy           Opinion, treaties, AI ambitions
│   │   ├── /dynasty             Character aging, succession, marriages
│   │   ├── /tech                Tech generation, institution spread
│   │   ├── /religion            Conversion, papal authority, leadership claims
│   │   ├── /politics            Estate loyalty, demands, revolts
│   │   ├── /ideology            Vector drift, archetype evaluation
│   │   ├── /ai                  AI decision-making for all systems
│   │   ├── /events              Event triggering & resolution
│   │   ├── tickEngine.ts        Orchestrator — runs monthly tick
│   │   └── orchestrator.ts      Multi-store coordination helpers
│   │
│   ├── /stores                  STATE LAYER (Zustand)
│   │   ├── worldStore.ts
│   │   ├── nationStore.ts
│   │   ├── provinceStore.ts
│   │   ├── dynastyStore.ts
│   │   ├── economyStore.ts
│   │   ├── militaryStore.ts
│   │   ├── diplomacyStore.ts
│   │   ├── religionStore.ts
│   │   ├── politicsStore.ts
│   │   ├── techStore.ts
│   │   ├── ideologyStore.ts
│   │   ├── eventQueueStore.ts
│   │   ├── uiStore.ts
│   │   └── index.ts             Re-exports + cross-store selectors
│   │
│   ├── /types                   PURE TYPE DEFINITIONS
│   │   ├── world.ts
│   │   ├── nation.ts
│   │   ├── province.ts
│   │   ├── character.ts
│   │   ├── army.ts
│   │   ├── navy.ts
│   │   ├── building.ts
│   │   ├── unit.ts
│   │   ├── event.ts
│   │   ├── religion.ts
│   │   ├── tech.ts
│   │   ├── archetype.ts
│   │   ├── estate.ts
│   │   ├── ideology.ts
│   │   ├── treaty.ts
│   │   ├── war.ts
│   │   ├── trade.ts
│   │   └── index.ts             Re-exports
│   │
│   ├── /data                    HAND-AUTHORED CONTENT
│   │   ├── /provinces           ~400 JSON files (or single big JSON)
│   │   ├── /nations             ~80 nation defs
│   │   ├── /characters          ~500 1200-start characters
│   │   ├── /cultures
│   │   ├── /religions           ~20 faiths + doctrines
│   │   ├── /traits              ~120 trait defs
│   │   ├── /buildings
│   │   ├── /units
│   │   ├── /tech                5 tech tree defs
│   │   ├── /institutions
│   │   ├── /events              ~200 event scripts
│   │   ├── /archetypes          ~30 archetype defs
│   │   ├── /estates             Estate templates
│   │   ├── /diaspora
│   │   ├── /privileges
│   │   ├── /trade_nodes
│   │   ├── /trade_goods
│   │   ├── /pilgrimage_sites
│   │   ├── /naming_pools        Culture-appropriate names
│   │   └── schemas/             Zod schemas for each data type
│   │
│   ├── /components              REACT UI
│   │   ├── /map                 SVG map + map modes
│   │   ├── /hud                 Top bar, bottom dock, persistent UI
│   │   ├── /drawers             Province, Nation, Dynasty, Diplomacy, etc.
│   │   ├── /dynasty             Family tree, court view, character cards
│   │   ├── /diplomacy           Diplomacy panel, opinion view
│   │   ├── /military            Army panel, battle resolution
│   │   ├── /economy             Budget, trade nodes, building UI
│   │   ├── /tech                Five tech tree strips, era dashboard
│   │   ├── /politics            Estates panel, party view (late game)
│   │   ├── /religion            Religion panel, religious head, conversion
│   │   ├── /ideology            Radar chart, archetype banner, timeline
│   │   ├── /events              Event modal/drawer
│   │   ├── /shared              Generic UI: buttons, sliders, dialogs
│   │   └── /content-tool        Forms for content entry
│   │
│   ├── /hooks                   Custom React hooks
│   │   ├── useTickLoop.ts       Manages tick timing & speed
│   │   ├── useCurrentNation.ts  Player nation selector
│   │   ├── useSelectedProvince.ts
│   │   └── ...
│   │
│   ├── /lib                     UTILITIES (pure, no React)
│   │   ├── rng.ts               Seeded PRNG
│   │   ├── id.ts                ID generation
│   │   ├── date.ts              In-game date math
│   │   ├── geometry.ts          SVG path / polygon helpers
│   │   ├── pathfinding.ts       Province adjacency, army movement
│   │   ├── consanguinity.ts     Family-tree kinship calculations
│   │   ├── vector.ts            Ideology vector math
│   │   ├── archetypeMatch.ts    Vector → archetype evaluation
│   │   ├── personality.ts       AI personality profile derivation
│   │   ├── format.ts            Number/date formatting
│   │   └── debug.ts             Debug helpers (gated by env)
│   │
│   ├── /persistence             Save/load
│   │   ├── saveGame.ts
│   │   ├── loadGame.ts
│   │   ├── migrations.ts        Schema version migrations
│   │   └── storage.ts           localStorage / IndexedDB abstraction
│   │
│   └── /constants               Tuning numbers, magic constants
│       ├── balance.ts           Combat modifiers, drift rates, costs
│       ├── eras.ts              Era thresholds, dates
│       ├── ui.ts                Tap target sizes, drawer widths
│       └── game.ts              Tick rate, max provinces, etc.
│
├── /public                      Static assets
│   ├── /maps                    Map SVG / geo data
│   ├── /icons                   PWA icons
│   ├── manifest.json            PWA manifest
│   └── /portraits               Placeholder character portraits
│
├── /tests                       Test files mirror /src structure
│   ├── /engine
│   ├── /stores
│   ├── /lib
│   └── /integration             Full-tick integration tests
│
├── /scripts                     Build helpers
│   ├── validateContent.ts       Run Zod schemas against /data
│   └── generateNamePools.ts     One-off tools
│
├── DESIGN.md                    Game design doc (canonical)
├── TECH.md                      This document
├── README.md                    Project overview, dev setup
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── vitest.config.ts
```

### Conventions

- **Files in `/src/engine`** — pure logic, no React imports, easy to test
- **Files in `/src/stores`** — Zustand stores only, minimal logic, just state shape + setters
- **Files in `/src/components`** — React components, no engine logic, read from stores via selectors
- **Files in `/src/data`** — pure JSON, validated by Zod schemas at startup
- **Files in `/src/types`** — `interface` and `type` declarations only, no values
- **Files in `/src/lib`** — pure utility functions, no React, no Zustand

---

## 4. State Management Pattern

### Why multiple Zustand stores

A single 100,000-line store would be unmaintainable. Multiple stores give:
- Clear ownership per concern
- Smaller subscriptions per component (better render performance)
- Easier mental model — each store maps to one DESIGN.md system
- Independent testability

### The store ecosystem

```
worldStore         ─────────────── time, speed, current player nation, settings
provinceStore      ─────────────── all 400 provinces by ID, lookups, indices
nationStore        ─────────────── all 80 nations (treasury, manpower, prestige, archetype, ambitions)
dynastyStore       ─────────────── all ~500+ characters by ID, family relationships, court roles
economyStore       ─────────────── trade nodes, world prices, market state
militaryStore      ─────────────── armies, navies, ongoing wars, sieges, war scores
diplomacyStore     ─────────────── opinions, treaties, alliances, claims, threats
religionStore      ─────────────── religious heads, papal authority, doctrines, leadership claims
politicsStore      ─────────────── estate states per nation, parties (late game), privileges
techStore          ─────────────── tech tree progress per nation, institution presence per province
ideologyStore      ─────────────── ideology vectors per nation, archetype assignments, drift history
eventQueueStore    ─────────────── pending events, scheduled events, recently fired
uiStore            ─────────────── current view, drawers open, selected entities, map mode
```

### The single-source rule

**Every piece of game state lives in exactly one store.** If you find yourself denormalizing, stop. Use selectors instead.

Example: a province's *owner* lives on the province in `provinceStore`. The nation's *list of owned provinces* is derived via selector, not stored.

```typescript
// In stores/index.ts
export const useNationProvinces = (nationId: string) =>
  useProvinceStore(state =>
    Object.values(state.provinces).filter(p => p.controllerId === nationId)
  );
```

### Cross-store reads via selectors

Components combine data from multiple stores via composed selectors. These run in component render but are cheap because Zustand's shallow equality prevents re-renders when irrelevant data changes.

```typescript
// Example: render a province card with culture/religion/owner data
const ProvinceCard = ({ provinceId }: { provinceId: string }) => {
  const province = useProvinceStore(s => s.provinces[provinceId]);
  const owner = useNationStore(s => s.nations[province.controllerId]);
  const dominantReligion = useReligionStore(
    s => s.religions[province.religionId]
  );
  return <Card>...</Card>;
};
```

### Cross-store writes via the orchestrator

**Components NEVER write to multiple stores in one user action.** Multi-store writes go through engine orchestrator functions:

```typescript
// In engine/orchestrator.ts
export function resolveBattle(battleId: string) {
  const battle = militaryStore.getState().battles[battleId];
  const attacker = nationStore.getState().nations[battle.attackerId];
  const defender = nationStore.getState().nations[battle.defenderId];

  const result = simulateBattle(battle, attacker, defender);

  // ALL writes happen atomically — set state in each store via .setState
  militaryStore.setState(s => ({ ...s, /* casualties, etc */ }));
  nationStore.setState(s => ({ ...s, /* manpower updates, prestige */ }));
  dynastyStore.setState(s => ({ ...s, /* generals injured/killed */ }));
  ideologyStore.setState(s => ({ ...s, /* won/lost war modifier */ }));
  eventQueueStore.setState(s => ({ ...s, /* fire post-battle events */ }));
}
```

Components call `resolveBattle(id)` — they don't reach into stores themselves for multi-store mutations.

### State shape pattern

Every store follows the same shape pattern:

```typescript
interface SomeStoreState {
  // The data (normalized, by ID where possible)
  things: Record<string, Thing>;

  // Indices for efficient lookup (optional)
  thingsByNation: Record<string, string[]>;

  // Actions (mutating helpers)
  setThing: (id: string, thing: Thing) => void;
  updateThing: (id: string, patch: Partial<Thing>) => void;
  removeThing: (id: string) => void;
}
```

Normalized state (everything by ID) is critical for save/load performance and avoids React reconciliation issues.

---

## 5. The Simulation Engine

The engine is the heart of the game. It runs the simulation tick that turns time into change.

### Engine module structure

Each system in DESIGN.md has a corresponding engine module:

```
/engine/economy/
  tick.ts            — runs monthly economic update
  trade.ts           — trade node value calculation
  prices.ts          — global price updates
  buildings.ts       — building completion checks
  income.ts          — national income roll-up
  index.ts           — exports

/engine/military/
  tick.ts            — military monthly updates
  combat.ts          — battle resolution
  movement.ts        — army movement & arrival
  recruitment.ts     — regiment training
  attrition.ts       — supply attrition
  sieges.ts          — siege progress
  navalCombat.ts
  invasions.ts       — naval invasion sequence
  ...

/engine/diplomacy/
  tick.ts
  opinion.ts         — monthly opinion drift
  treaties.ts        — treaty enforcement / expiration
  ambitions.ts       — ambition progress / completion
  coalitions.ts      — threat calculation, coalition formation
  ...

/engine/dynasty/
  tick.ts
  aging.ts           — monthly health drain, age events
  mortality.ts       — death roll
  succession.ts      — heir resolution
  marriages.ts       — marriage AI + execution
  education.ts       — children's education milestones
  plots.ts           — plot progression
  ...

/engine/tech/
  tick.ts
  generation.ts      — monthly tech points
  institutions.ts    — spawn + spread logic
  reforms.ts         — government reform application
  ...

/engine/religion/
  tick.ts
  papacy.ts          — Papal Authority updates
  conversion.ts      — province conversion logic
  reformation.ts     — Reformation event chain
  leadership.ts      — Defender of Faith, Caliphate Claim, Third Rome
  ...

/engine/politics/
  tick.ts
  loyalty.ts         — estate loyalty drift
  privileges.ts      — privilege effects + aging
  demands.ts         — estate demand generation
  revolts.ts         — revolt firing
  parties.ts         — party transitions (late game)
  ...

/engine/ideology/
  tick.ts
  drift.ts           — monthly vector drift
  archetypes.ts      — archetype evaluation + transitions
  earthquakes.ts     — scripted ideology events
  ...

/engine/ai/
  decisions.ts       — main AI decision dispatcher
  personalities.ts   — AI personality profile derivation
  warDecisions.ts
  diplomacyDecisions.ts
  reformDecisions.ts
  estateDecisions.ts
  ...

/engine/events/
  trigger.ts         — event condition checking
  resolver.ts        — event resolution + state effects
  scheduler.ts       — scheduled event firing
  ...
```

### Pure function preference

Engine functions should be **pure where possible**:

```typescript
// Pure — takes state, returns new state
export function calculateMonthlyIncome(
  nation: Nation,
  provinces: Province[],
  prices: PriceMap
): IncomeBreakdown {
  // ...
  return { tax, trade, production, total };
}

// NOT pure — has side effects
export function applyMonthlyIncome(nationId: string) {
  // reaches into store, mutates — only use in orchestrator
}
```

Pure functions are easy to test. Use them everywhere the math is the math. Reserve side-effecting orchestrator functions for actually writing to stores.

### The tickEngine — the heartbeat

```typescript
// engine/tickEngine.ts

export function runMonthlyTick() {
  // 1. PRE-TICK — snapshot current state for any "before/after" comparisons
  const previousState = snapshotAllStores();

  // 2. RUN SUBSYSTEM TICKS IN ORDER
  //    Order matters — economy generates income BEFORE military upkeep deducts
  economyTick();
  militaryTick();      // includes movement, sieges, attrition
  diplomacyTick();     // opinion drift, ambition checks
  techTick();          // tech generation, institution spread
  religionTick();      // conversion, papal authority
  politicsTick();      // estate loyalty drift, demands
  dynastyTick();       // aging, mortality, marriages, education
  ideologyTick();      // vector drift, archetype evaluation

  // 3. AI DECISION PHASE — each AI nation evaluates and acts
  for (const nationId of getAINationIds()) {
    aiDecisionPhase(nationId);
  }

  // 4. EVENT TRIGGER PHASE — check all triggered events, queue them
  triggerEvents();

  // 5. ADVANCE TIME
  worldStore.getState().advanceMonth();

  // 6. POST-TICK — check pause conditions, autosave, etc.
  checkPauseConditions(previousState);
  maybeAutosave();
}
```

### Tick frequency budget

At game speed 5× (fastest), we want at most ~200ms per tick on iPad to feel smooth. Targets per phase:

| Phase | Budget |
|---|---|
| Economy tick | 20ms |
| Military tick | 30ms |
| Diplomacy tick | 20ms |
| Tech tick | 15ms |
| Religion tick | 15ms |
| Politics tick | 20ms |
| Dynasty tick | 30ms |
| Ideology tick | 15ms |
| AI decisions (80 nations, simplified) | 30ms |
| Events + cleanup | 10ms |
| **Total** | **~205ms** |

If a tick exceeds budget consistently, that's a perf issue worth investigation. Tiering AI work (full sim for Tier 1+2 nations, lighter for Tier 3) keeps us under budget.

---

## 6. Data Schemas

Full TypeScript interfaces for every game entity. These live in `/src/types`. Zod schemas mirror these for runtime validation of `/src/data` content.

### Common shared types

```typescript
// types/common.ts

export type EntityId = string;       // UUIDs or stable string IDs
export type NationId = EntityId;
export type ProvinceId = EntityId;
export type CharacterId = EntityId;
export type ArmyId = EntityId;
export type CultureId = string;      // "frankish", "occitan", etc.
export type ReligionId = string;     // "catholic", "sunni", etc.
export type TraitId = string;
export type BuildingId = string;
export type TradeGoodId = string;
export type ArchetypeId = string;
export type EstateId = string;       // "nobility", "burghers", etc.

export type GameDate = {
  year: number;     // 1200-1900
  month: number;    // 1-12
  day: number;      // for finer-grained events (siege rolls etc.)
};

export type Era = 'medieval' | 'renaissance' | 'early_modern' | 'industrial';

export type Position = {
  x: number;
  y: number;
};
```

### Province

```typescript
// types/province.ts

export interface Province {
  id: ProvinceId;
  name: string;
  nameByCulture?: Record<CultureId, string>;  // localized names

  // Geography
  position: Position;            // center point for the map
  pathData: string;              // SVG path for rendering
  adjacencies: ProvinceId[];     // neighboring provinces
  navalAdjacencies: ProvinceId[]; // sea connections
  regionId: string;              // groups for region-level mechanics
  terrain: TerrainType;
  climate: ClimateType;

  // Development (three sub-stats, 1-30 medieval, 50+ industrial)
  development: {
    tax: number;
    production: number;
    manpower: number;
  };

  // Demographics
  population: number;            // grows with development + peace
  cultureId: CultureId;
  religionId: ReligionId;

  // Control
  controllerId: NationId;        // who owns it
  occupierId: NationId | null;   // who controls it during war (null = controller)
  coreNationIds: NationId[];     // nations with cores (reduce mismatch penalty)
  claimNationIds: NationId[];    // nations with claims

  // Production
  tradeGoodId: TradeGoodId;
  buildings: BuildingId[];
  fortificationLevel: 0 | 1 | 2 | 3 | 4;  // wooden→stone→star→modern

  // Sub-systems
  estateOwnership: Record<EstateId, number>;  // % share per estate (sums to 1.0 inc. crown)
  unrest: number;                // 0-10
  culturalInfluencePresent: Record<NationId, number>;
  institutions: Record<string, number>;  // 0-1 presence per institution

  // Active state
  beingDeveloped: boolean;        // active development project
  beingConverted: boolean;        // active conversion / promotion
  conversionTargetReligionId: ReligionId | null;
  promotionTargetCultureId: CultureId | null;
  conversionProgress: number;     // 0-1
  promotionProgress: number;      // 0-1

  // Special flags
  isCapital: boolean;
  isPilgrimageSite: boolean;
  pilgrimageSiteFaith: ReligionId | null;
  isCoastal: boolean;
  navalCapacity: number;          // if coastal, how many ships can dock

  // Hidden / computed
  manpowerPool: {
    current: number;
    max: number;
    regenRate: number;
  };
  monthlyIncome: number;          // last calculated; refreshed each tick
}

export type TerrainType =
  | 'plains' | 'hills' | 'mountains' | 'forest' | 'desert'
  | 'jungle' | 'marsh' | 'steppe' | 'tundra' | 'coastal';

export type ClimateType =
  | 'temperate' | 'arid' | 'tropical' | 'mediterranean'
  | 'continental' | 'arctic' | 'subarctic';
```

### Nation

```typescript
// types/nation.ts

export interface Nation {
  id: NationId;
  name: string;
  nameByEra?: Record<Era, string>;  // "Kingdom of France" → "French Republic"
  tag: string;                       // short code like "FRA", "ENG"

  // Identity
  cultureId: CultureId;
  primaryReligionId: ReligionId;
  governmentType: GovernmentType;
  archetypeId: ArchetypeId;
  flagColor: string;                 // for map display

  // Ruler & dynasty
  rulerId: CharacterId;
  dynastyId: EntityId;
  successionLaw: SuccessionLaw;

  // Treasury & resources
  treasury: number;
  manpower: number;
  maxManpower: number;
  prestige: number;                  // -100 to +500
  legitimacy: number;                // 0-100

  // Tech & institutions
  techLevels: Record<TechTreeId, number>;
  embracedInstitutions: string[];

  // Ideology
  ideologyVector: IdeologyVector;
  ideologyHistory: IdeologyDriftEntry[];  // for timeline visualization

  // Diplomatic
  ambitions: Ambition[];
  rivals: NationId[];
  interests: string[];               // region IDs

  // Reputation
  honor: number;                     // 0-100
  diplomaticReputation: number;      // -5 to +5
  aggressiveExpansion: number;       // 0-100, drives threat
  threat: number;                    // computed from AE + actions

  // Status
  stability: number;                 // 0-100
  religiousUnity: number;            // 0-100
  culturalUnity: number;             // 0-100
  toleranceScore: number;            // 0-100

  // Era / Great Power
  greatPowerRank: number | null;     // 1-8 if Great Power, else null

  // Estates active in this nation
  activeEstateIds: EstateId[];

  // Cultural Influence
  culturalInfluenceScore: number;

  // Religious authority claims held
  defenderOfFaithFor: ReligionId | null;
  caliphateClaim: boolean;
  thirdRomeClaim: boolean;

  // Cached computed fields (refresh tick)
  cachedIncome: IncomeBreakdown;
  cachedExpenses: ExpenseBreakdown;
  cachedNetMonthly: number;

  // AI personality (cached, refresh monthly)
  cachedPersonality: PersonalityProfile | null;
}

export type GovernmentType =
  | 'feudal_monarchy' | 'merchant_republic' | 'theocracy'
  | 'tribal_federation' | 'imperial_bureaucratic' | 'caliphate'
  | 'sultanate' | 'administrative_monarchy' | 'absolute_monarchy'
  | 'constitutional_monarchy' | 'parliamentary_republic'
  | 'revolutionary_republic' | 'industrial_empire'
  | 'cosmopolitan_empire' | 'reactionary_empire' | 'hermit_kingdom'
  | 'confederation' | 'shogunate' | 'mandala_kingdom'
  | 'maritime_sultanate' | 'sahel_empire';

export type SuccessionLaw =
  | 'confederate_partition' | 'elective' | 'salic_primogeniture'
  | 'primogeniture' | 'seniority' | 'tanistry' | 'absolute_primogeniture';

export type IdeologyVector = {
  militaristPacifist: number;        // -100 to +100
  mercantileAgrarian: number;
  theocraticSecular: number;
  openIsolationist: number;
  aristocraticPopulist: number;
  traditionalProgressive: number;
  centralistFederalist: number;
};

export type IdeologyDriftEntry = {
  date: GameDate;
  vector: IdeologyVector;
  archetypeId: ArchetypeId;
  reason?: string;                   // "Reformer ruler", "Won crusade", etc.
};

export interface Ambition {
  id: string;
  type: 'territorial' | 'religious' | 'economic' | 'dynastic' | 'cultural';
  description: string;
  targetProvinceIds?: ProvinceId[];
  targetNationId?: NationId;
  targetReligionId?: ReligionId;
  progress: number;                  // 0-1
  startedDate: GameDate;
  weight: number;                    // how strongly AI pursues this
}

export interface IncomeBreakdown {
  tax: number;
  trade: number;
  production: number;
  tariffs: number;
  tribute: number;
  total: number;
}

export interface ExpenseBreakdown {
  armyUpkeep: number;
  navyUpkeep: number;
  buildingConstruction: number;
  courtCosts: number;
  loanInterest: number;
  subsidies: number;
  total: number;
}
```

### Character

```typescript
// types/character.ts

export interface Character {
  id: CharacterId;
  dynastyId: EntityId;
  cultureId: CultureId;
  religionId: ReligionId;

  // Names
  givenName: string;
  dynastyName: string;
  nickname?: string;                 // hand-authored only

  // Lifespan
  birthDate: GameDate;
  deathDate: GameDate | null;
  gender: 'male' | 'female';

  // Stats (0-25)
  stats: {
    diplomacy: number;
    stewardship: number;
    martial: number;
    intrigue: number;
    learning: number;
    piety: number;
  };
  statsHiddenUntilAge: number;       // typically 16

  // Traits
  traits: CharacterTrait[];

  // Health
  health: {
    current: number;                 // 0-100
    max: number;
    conditions: HealthCondition[];
    plotArmor: boolean;              // historical figures pre-death-window
    plotArmorExpires?: GameDate;
  };

  // Fertility
  fertility: {
    base: number;
    modifiers: number;
    sterile: boolean;
  };

  // Family relationships
  family: {
    fatherId: CharacterId | null;
    motherId: CharacterId | null;
    spouseId: CharacterId | null;
    exSpouseIds: CharacterId[];
    childIds: CharacterId[];
    legitimateChildIds: CharacterId[];
    bastardIds: CharacterId[];
    siblingIds: CharacterId[];
  };

  // Genetic background
  geneticPool: {
    commonAncestorIds: CharacterId[];
    consanguinityScore: number;      // accumulated inbreeding metric
  };

  // Position in the world
  position: {
    locationProvinceId: ProvinceId;
    title: string;
    courtRole: CourtRole | null;
    fieldRole: FieldRole | null;
    nationId: NationId | null;       // which nation they belong to
  };

  // Claims
  heldClaimNationIds: NationId[];    // claims on thrones
  heldClaimProvinceIds: ProvinceId[]; // claims on specific provinces
  inheritanceClaimNationIds: NationId[]; // claims they would inherit

  // Status
  prestige: number;
  pietyScore: number;                // separate from Piety stat — current religious behavior
  plotsInvolvedIn: string[];

  // Education
  educationFocus: EducationFocus | null;
  educationComplete: boolean;
  tutorId: CharacterId | null;

  // Regency
  regentForId: CharacterId | null;   // if this character is regent
  isRegent: boolean;

  // Marriage status
  marriagesProposedByMe: CharacterId[]; // marriage offers outbound
  marriagesProposedToMe: CharacterId[]; // marriage offers inbound

  // Special intellectuals
  intellectualSpecialty?: IntellectualSpecialty;
}

export type CharacterTrait = {
  traitId: TraitId;
  source: 'born' | 'inherited' | 'educated' | 'event' | 'genetic';
  acquiredDate: GameDate;
};

export type HealthCondition = {
  conditionId: string;               // "smallpox", "wounded", "plague", etc.
  severity: number;                  // 0-1
  acquiredDate: GameDate;
  expectedDuration?: number;         // months
};

export type CourtRole =
  | 'chancellor' | 'marshal' | 'spymaster' | 'steward'
  | 'court_chaplain' | 'court_physician' | 'court_intellectual';

export type FieldRole =
  | 'general' | 'admiral' | 'governor';

export type EducationFocus =
  | 'martial' | 'stewardship' | 'intrigue'
  | 'diplomatic' | 'learning' | 'piety';

export type IntellectualSpecialty =
  | 'theologian' | 'astronomer' | 'philosopher' | 'poet'
  | 'mathematician' | 'engineer' | 'historian';
```

### Trait definition (from /data/traits)

```typescript
// types/trait.ts

export interface TraitDefinition {
  id: TraitId;
  name: string;
  category: TraitCategory;

  description: string;

  // Stat modifiers
  statModifiers: Partial<Record<keyof Character['stats'], number>>;

  // National effects when ruler holds it
  rulerNationalEffects?: {
    armyMoraleBonus?: number;
    taxEfficiencyBonus?: number;
    diplomaticOpinionBonus?: number;
    // ... etc
  };

  // Ideology drift per month (when this character is ruler)
  ideologyDrift?: Partial<IdeologyVector>;

  // AI personality influences
  aiPersonalityWeights?: {
    aggression?: number;
    trustworthiness?: number;
    reformAppetite?: number;
    religiousZeal?: number;
  };

  // Inheritance
  inheritanceChance: number;         // 0-1
  isGenetic: boolean;                // can it inherit at all
  isAcquired: boolean;               // event-only, no inheritance

  // Conflicts
  incompatibleTraits: TraitId[];     // can't have at the same time

  // Era restrictions
  earliestEra?: Era;
  latestEra?: Era;
}

export type TraitCategory =
  | 'personality' | 'skill' | 'physical' | 'health'
  | 'education' | 'faith' | 'acquired';
```

### Army & Navy

```typescript
// types/army.ts

export interface Army {
  id: ArmyId;
  nationId: NationId;
  name: string;

  // Composition
  regiments: Regiment[];

  // Location
  provinceId: ProvinceId;            // current location
  movementTarget: ProvinceId | null;
  movementProgress: number;          // 0-1

  // Leadership
  generalId: CharacterId | null;

  // Status
  morale: number;                    // 0-100
  organization: number;              // 0-100 — recovers between battles
  attritionMonth: number;            // accumulated this month
  inBattle: BattleId | null;
  inSiege: SiegeId | null;
  isEmbarked: boolean;               // on transports
  embarkedOnFleetId: ArmyId | null;
}

export interface Regiment {
  id: string;
  unitType: UnitType;
  size: number;                      // 0-1000 (full strength = 1000)
  experience: number;                // 0-100
}

export interface Battle {
  id: BattleId;
  provinceId: ProvinceId;
  attackerArmyIds: ArmyId[];
  defenderArmyIds: ArmyId[];
  combatWidth: number;
  startDate: GameDate;
  resolved: boolean;
  result?: BattleResult;
}

export interface BattleResult {
  winnerId: NationId;
  attackerCasualties: number;
  defenderCasualties: number;
  generalsKilled: CharacterId[];
  generalsWounded: CharacterId[];
}

export interface Siege {
  id: SiegeId;
  provinceId: ProvinceId;
  besiegingArmyId: ArmyId;
  defendingNationId: NationId;
  garrisonStrength: number;
  fortLevel: number;
  progress: number;                  // 0-100
  monthsElapsed: number;
  startDate: GameDate;
}

// Navy types similar shape
export interface Fleet {
  id: ArmyId;                        // shared ID space with armies for transport ref
  nationId: NationId;
  ships: Ship[];
  seaZoneId: string;
  movementTarget: string | null;
  movementProgress: number;
  admiralId: CharacterId | null;
  morale: number;
  carryingArmyId: ArmyId | null;     // if transport carrying army
}

export interface Ship {
  id: string;
  shipType: ShipType;
  isTransport: boolean;
  capacity: number;                  // regiments if transport
}
```

### War

```typescript
// types/war.ts

export interface War {
  id: EntityId;
  name: string;                      // "Anglo-French War of 1230"
  startDate: GameDate;
  endDate: GameDate | null;

  attackers: NationId[];
  defenders: NationId[];
  warLeader: { attacker: NationId; defender: NationId };

  warGoals: WarGoal[];
  casusBelli: CasusBelliType;

  warScore: number;                  // -100 to +100 (positive = attacker winning)

  battlesIds: BattleId[];
  siegesIds: SiegeId[];

  occupiedProvinces: {
    provinceId: ProvinceId;
    occupierId: NationId;
    occupiedSince: GameDate;
  }[];
}

export interface WarGoal {
  id: string;
  type: WarGoalType;
  targetProvinceId?: ProvinceId;
  targetNationId?: NationId;
  achieved: boolean;
  tickingValue?: number;             // war score from holding war goal
}

export type CasusBelliType =
  | 'conquest' | 'reconquest' | 'holy_war' | 'imperial_reclamation'
  | 'trade_war' | 'vassalization' | 'humiliate' | 'independence'
  | 'succession' | 'reduce_threat' | 'doctrinal_reclamation'
  | 'heresy_suppression' | 'religious_civil_war' | 'crusade' | 'no_cb';

export type WarGoalType =
  | 'annex_province' | 'annex_provinces' | 'vassalize'
  | 'force_religion' | 'force_culture' | 'humiliate'
  | 'transfer_throne' | 'force_treaty_break';
```

### Treaty / Diplomacy state

```typescript
// types/treaty.ts

export interface Treaty {
  id: EntityId;
  type: TreatyType;
  signedDate: GameDate;
  expiresDate: GameDate | null;
  signatoryIds: NationId[];
  terms: TreatyTerms;
  broken: boolean;
}

export type TreatyType =
  | 'alliance' | 'royal_marriage' | 'guarantee'
  | 'non_aggression' | 'embargo' | 'tributary'
  | 'vassalage' | 'subsidy';

export interface TreatyTerms {
  // Specific to type
  marriageCharacterIds?: [CharacterId, CharacterId];
  tributeAmount?: number;
  embargoTarget?: NationId;
  // etc.
}

export interface OpinionEntry {
  fromNationId: NationId;
  toNationId: NationId;
  value: number;                     // -200 to +200
  modifiers: OpinionModifier[];
}

export interface OpinionModifier {
  source: string;                    // "Royal Marriage", "Broke Treaty", etc.
  value: number;
  expiresDate: GameDate | null;
  appliedDate: GameDate;
}
```

### Estate state

```typescript
// types/estate.ts

export interface EstateState {
  nationId: NationId;
  estateId: EstateId;

  loyalty: number;                   // 0-100
  influence: number;                 // 0-100
  landSharePercent: number;          // 0-1

  privilegesGranted: EstatePrivilege[];

  activeDemands: EstateDemand[];

  // For diaspora estates
  isDiaspora: boolean;
  expelled: boolean;
  expulsionDate?: GameDate;

  // For factions/parties (late game)
  activeFactions: Faction[];
  evolvedIntoParty?: PartyId;
}

export interface EstatePrivilege {
  privilegeId: string;
  grantedDate: GameDate;
  expiresDate: GameDate | null;      // null = hereditary
  type: 'hereditary' | 'charter' | 'era_reformed';
  effects: PrivilegeEffects;
}

export interface EstateDemand {
  id: string;
  description: string;
  cost: { gold?: number; influence?: number; privilegeId?: string };
  consequencesIfRefused: { loyalty: number; otherEstateEffects?: any };
  expiresDate: GameDate;
}

export interface Faction {
  id: string;
  name: string;
  members: CharacterId[];
  ideologyPull: Partial<IdeologyVector>;
  influence: number;
}

export type PartyId = string;

export interface Party {
  id: PartyId;
  name: string;
  platform: IdeologyVector;          // party's ideology stance
  supportFromEstates: EstateId[];
  currentLeaderId: CharacterId;
  popularSupport: number;            // 0-100
}
```

### Religion state

```typescript
// types/religion.ts

export interface ReligionDefinition {
  id: ReligionId;
  name: string;
  group: ReligionGroup;
  description: string;

  doctrines: Doctrine[];

  startingAuthorityScore: number;
  startingHeadCharacterId?: CharacterId;
  hasReligiousHead: boolean;
  headSelectionType: 'conclave' | 'caliphal' | 'patriarchal'
                   | 'distributed' | 'none';

  // Building tiers available to this faith
  religiousBuildings: { tier: number; buildingId: BuildingId }[];

  // Mechanics
  pilgrimageSiteIds: ProvinceId[];
  defaultTolerance: number;          // 0-100
}

export type ReligionGroup =
  | 'christian' | 'islamic' | 'dharmic' | 'east_asian'
  | 'pagan' | 'animist' | 'zoroastrian' | 'judaic';

export interface Doctrine {
  id: string;
  name: string;
  effects: any;
  active: boolean;
  earliestEra?: Era;
  latestEra?: Era;
}

export interface ReligiousAuthority {
  religionId: ReligionId;
  headCharacterId: CharacterId | null;
  authorityScore: number;            // -100 to +100

  // For Catholic / Papal
  cardinalIds: CharacterId[];

  // Active claims
  defenderOfFaithNationId: NationId | null;

  // Special faiths
  caliphateClaimantIds: NationId[];
  thirdRomeClaimantId: NationId | null;
}

export interface ConversionState {
  provinceId: ProvinceId;
  targetReligionId: ReligionId;
  missionaryCharacterId: CharacterId;
  progress: number;                  // 0-1
  monthsElapsed: number;
  monthlyEvents: ConversionEvent[];
}
```

### Tech & Institutions

```typescript
// types/tech.ts

export type TechTreeId = 'admin' | 'military' | 'diplomatic' | 'cultural' | 'religious';

export interface TechTree {
  id: TechTreeId;
  nodes: TechNode[];
}

export interface TechNode {
  id: string;
  treeId: TechTreeId;
  name: string;
  description: string;
  costThreshold: number;              // tech points needed to acquire
  era: Era;
  prerequisites: string[];            // other tech node IDs
  unlocks: {
    buildings?: BuildingId[];
    units?: UnitType[];
    institutions?: string[];
    reforms?: string[];
    bonuses?: TechBonus[];
  };
}

export interface NationTechState {
  nationId: NationId;
  techPoints: Record<TechTreeId, number>;       // accumulated, decays on tier purchase
  acquiredTechIds: string[];
  era: Era;
}

export interface Institution {
  id: string;
  name: string;
  earliestSpawnDate: GameDate;
  spawnConditions: InstitutionSpawnConditions;
  spreadConfig: InstitutionSpreadConfig;
  embraceCost: { gold: number; admin: number };
  effects: InstitutionEffects;
}

export interface InstitutionSpawnConditions {
  requiresInstitutions?: string[];
  requiresProvinceTraits?: any;
  requiresTechMinimum?: Partial<Record<TechTreeId, number>>;
  requiresIdeology?: Partial<IdeologyVector>;
}

export interface InstitutionSpreadConfig {
  baseSpreadChancePerMonth: number;
  modifiers: {
    sharedBorderMultiplier: number;
    navalConnectionMultiplier: number;
    sameReligionMultiplier: number;
    sameCultureMultiplier: number;
    progressiveTargetMultiplier: number;
    isolationistTargetMultiplier: number;
  };
}
```

### Archetype

```typescript
// types/archetype.ts

export interface ArchetypeDefinition {
  id: ArchetypeId;
  name: string;
  category: ArchetypeCategory;
  description: string;

  // Signature vector range
  signatureVector: {
    militaristPacifist?: { min?: number; max?: number };
    mercantileAgrarian?: { min?: number; max?: number };
    theocraticSecular?: { min?: number; max?: number };
    openIsolationist?: { min?: number; max?: number };
    aristocraticPopulist?: { min?: number; max?: number };
    traditionalProgressive?: { min?: number; max?: number };
    centralistFederalist?: { min?: number; max?: number };
  };

  earliestEra?: Era;

  // Mechanical effects
  nationalEffects: {
    armyEfficiency?: number;
    tradeEfficiency?: number;
    techGenerationModifier?: Record<TechTreeId, number>;
    diplomaticOpinionBonus?: number;
    // ...
  };

  // Decisions unlocked
  unlockedDecisions: string[];

  // Scoring weights (for victory)
  scoringWeights: {
    territory: number;
    economy: number;
    prestige: number;
    dynasty: number;
    technology: number;
    cultural: number;
    religious: number;
  };

  // Ending narrative templates
  endingFlavor: string;
}

export type ArchetypeCategory =
  | 'conquest' | 'trade' | 'cultural' | 'religious'
  | 'modern' | 'reactionary' | 'specialty';
```

### Event

```typescript
// types/event.ts

export interface EventDefinition {
  id: string;
  title: string;
  description: string;               // template with {placeholders}
  category: EventCategory;

  trigger: EventTrigger;
  weight: number;                    // for random selection from valid pool

  isPauseRequired: boolean;          // does it pause game on fire
  isPlayerOnly: boolean;             // only fires for player nation
  isAIVisible: boolean;              // does AI react to it

  // Mean time to happen (months) if conditions stay valid
  mtth?: number;

  // Earliest/latest dates
  earliestDate?: GameDate;
  latestDate?: GameDate;

  // One-shot only?
  oneShot: boolean;

  // The options
  options: EventOption[];
}

export interface EventTrigger {
  conditions: EventCondition[];
}

export interface EventCondition {
  type: string;                      // "ruler_has_trait", "nation_at_war", "ideology_vector_in_range", etc.
  params: Record<string, any>;
}

export interface EventOption {
  id: string;
  label: string;                     // e.g. "Defend our faith"
  effects: EventEffect[];
  aiWeight?: number;                 // how AI evaluates this option
}

export interface EventEffect {
  type: string;                      // "modify_treasury", "shift_ideology", "fire_event", etc.
  params: Record<string, any>;
}

export type EventCategory =
  | 'dynasty' | 'estate' | 'religion' | 'diplomacy'
  | 'military' | 'economy' | 'technology' | 'ideology'
  | 'scripted_earthquake' | 'flavor';

// Pending events in queue
export interface QueuedEvent {
  id: string;
  eventDefinitionId: string;
  nationId: NationId;
  triggeredDate: GameDate;
  expiresDate?: GameDate;
  contextParams: Record<string, any>; // dynamic data baked in at trigger time
}
```

### World & Time

```typescript
// types/world.ts

export interface WorldState {
  currentDate: GameDate;
  speedSetting: 0 | 1 | 2 | 3 | 4 | 5; // 0 = paused
  isPaused: boolean;

  campaignSeed: string;              // for seeded RNG, save/load reproducibility
  campaignStartDate: GameDate;

  era: Era;                          // current world era (highest era reached by any major)

  playerNationId: NationId;

  // Global flags
  flags: Record<string, boolean | number | string>;

  // Historical events fired
  firedScriptedEvents: string[];     // earthquake IDs already fired

  // Tracking
  monthsPlayed: number;
}
```

### UI

```typescript
// types/ui.ts

export interface UIState {
  currentMapMode: MapMode;
  selectedProvinceId: ProvinceId | null;
  selectedNationId: NationId | null;
  selectedCharacterId: CharacterId | null;

  openDrawer: DrawerType | null;
  openDialog: DialogType | null;
  activeEventDialog: string | null;

  showLedger: boolean;
  ledgerTab: string;

  cameraCenter: Position;
  cameraZoom: number;
}

export type MapMode =
  | 'political' | 'terrain' | 'trade' | 'religion'
  | 'culture' | 'diplomatic' | 'development' | 'dynasty';

export type DrawerType =
  | 'province' | 'nation' | 'dynasty' | 'diplomacy'
  | 'military' | 'economy' | 'technology' | 'religion'
  | 'politics' | 'ideology' | 'events';

export type DialogType =
  | 'load_save' | 'settings' | 'victory' | 'pause_menu'
  | 'event' | 'archetype_transition' | 'ruler_death';
```

---

## 7. Zustand Stores

Concrete patterns for each store. All follow the same skeleton.

### Pattern template

```typescript
// stores/exampleStore.ts
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

interface ExampleStoreState {
  // State
  things: Record<string, Thing>;
  thingsByOwner: Record<string, string[]>; // index

  // Actions
  setThing: (id: string, thing: Thing) => void;
  updateThing: (id: string, patch: Partial<Thing>) => void;
  removeThing: (id: string) => void;
  bulkSet: (things: Record<string, Thing>) => void;

  // For save/load
  hydrate: (state: Partial<ExampleStoreState>) => void;
  snapshot: () => Partial<ExampleStoreState>;
}

export const useExampleStore = create<ExampleStoreState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      things: {},
      thingsByOwner: {},

      setThing: (id, thing) =>
        set((state) => ({
          things: { ...state.things, [id]: thing },
        })),

      updateThing: (id, patch) =>
        set((state) => ({
          things: {
            ...state.things,
            [id]: { ...state.things[id], ...patch },
          },
        })),

      removeThing: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.things;
          return { things: rest };
        }),

      bulkSet: (things) => set(() => ({ things })),

      hydrate: (partial) => set(() => partial),
      snapshot: () => ({
        things: get().things,
        thingsByOwner: get().thingsByOwner,
      }),
    })),
    { name: 'ExampleStore' }
  )
);
```

### Key stores

Each store implements the pattern above. Highlights:

**`worldStore`** — small but central
- `currentDate, speedSetting, isPaused, campaignSeed, era, playerNationId, flags, firedScriptedEvents, monthsPlayed`
- Actions: `advanceMonth(), setSpeed(), togglePause(), setPlayerNation()`

**`provinceStore`** — biggest hot store
- `provinces: Record<ProvinceId, Province>` — all 400
- Indices: `provincesByNation`, `provincesByCulture`, `provincesByReligion`, `provincesByRegion`
- Actions: `updateOwnership(), updateOccupation(), addBuilding(), updateDevelopment(), startConversion()`

**`nationStore`**
- `nations: Record<NationId, Nation>` — all 80
- Actions: `updateTreasury(), updateManpower(), updatePrestige(), setRuler(), setArchetype(), addAmbition()`

**`dynastyStore`** — largest by entity count
- `characters: Record<CharacterId, Character>` — ~500 starting, grows over time
- `dynasties: Record<EntityId, Dynasty>`
- Indices: `charactersByNation`, `charactersByDynasty`, `livingCharacters`
- Actions: `createCharacter(), killCharacter(), marryCharacters(), assignCourtRole()`

**`economyStore`**
- `tradeNodes, worldPrices, activeBuildingProjects, loanState`

**`militaryStore`**
- `armies, fleets, battles, sieges, wars, warScores`

**`diplomacyStore`**
- `opinions: Record<NationId, Record<NationId, OpinionEntry>>`
- `treaties, alliances, claims, threats, ambitions`

**`religionStore`**
- `authorities: Record<ReligionId, ReligiousAuthority>`
- `papalState, caliphalState, patriarchates`
- `conversions: Record<ProvinceId, ConversionState>`

**`politicsStore`**
- `estateStates: Record<NationId, Record<EstateId, EstateState>>`
- `parties` (late game)

**`techStore`**
- `nationTech: Record<NationId, NationTechState>`
- `institutionPresence: Record<ProvinceId, Record<string, number>>`

**`ideologyStore`**
- `vectors: Record<NationId, IdeologyVector>` (denormalized for fast access)
- `archetypeAssignments: Record<NationId, ArchetypeId>`
- `driftHistory: Record<NationId, IdeologyDriftEntry[]>`

**`eventQueueStore`**
- `pending: QueuedEvent[]`
- `scheduled: Record<string, GameDate>` // event ID → fire date for mtth events
- `recentlyFired: string[]` // dedup ring buffer

**`uiStore`** — only one not persisted to save
- `currentMapMode, selectedProvinceId, openDrawer, cameraCenter, cameraZoom`

---

## 8. Tick Loop Architecture

### The tick driver

```typescript
// hooks/useTickLoop.ts
import { useEffect, useRef } from 'react';
import { useWorldStore } from '@/stores/worldStore';
import { runMonthlyTick } from '@/engine/tickEngine';

const SPEED_MS = {
  0: Infinity,    // paused
  1: 2000,        // slow
  2: 1000,
  3: 500,
  4: 250,
  5: 100,         // fastest
};

export function useTickLoop() {
  const speedSetting = useWorldStore(s => s.speedSetting);
  const isPaused = useWorldStore(s => s.isPaused);
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    if (isPaused || speedSetting === 0) return;

    const ms = SPEED_MS[speedSetting];

    const intervalId = setInterval(() => {
      const now = Date.now();
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;

      runMonthlyTick();

      // If tick exceeded budget, log warning in dev
      if (dt > ms * 2 && process.env.NODE_ENV === 'development') {
        console.warn(`Tick took ${dt}ms (budget ${ms}ms)`);
      }
    }, ms);

    return () => clearInterval(intervalId);
  }, [speedSetting, isPaused]);
}
```

This hook is mounted once in `/play/page.tsx` and drives the entire simulation.

### Pause discipline

The tick engine never runs during a paused state. Pause conditions are checked at end of tick — if any fire, the game auto-pauses for player attention.

```typescript
// engine/tickEngine.ts
function checkPauseConditions(previousState: Snapshot) {
  const currentState = getCurrentSnapshot();

  const reasons = [];

  // Player ruler died
  if (playerRulerDied(previousState, currentState)) {
    reasons.push({ type: 'ruler_death', priority: 1 });
  }

  // War declared against player
  if (warDeclaredAgainstPlayer(previousState, currentState)) {
    reasons.push({ type: 'war_declaration', priority: 1 });
  }

  // Major event requires decision
  if (urgentPlayerEventQueued()) {
    reasons.push({ type: 'event_decision', priority: 2 });
  }

  // ... other conditions

  if (reasons.length > 0) {
    useWorldStore.getState().pauseWithReasons(reasons);
  }
}
```

### Tick ordering

The order within a tick matters:

1. **Economy first** — income arrives before being spent on military upkeep
2. **Military second** — armies move, battles resolve, sieges progress
3. **Diplomacy** — treaties expire, opinions drift
4. **Tech** — tech points generate, institutions spread
5. **Religion** — Papal Authority recalcs, conversions advance
6. **Politics** — estate loyalty drifts, demands fire
7. **Dynasty** — characters age, deaths roll, marriages execute
8. **Ideology** — vectors drift (depends on outcomes of all above)
9. **AI decisions** — AI sees the result of everything above and acts
10. **Events** — events trigger based on the new state
11. **Advance time**
12. **Post-tick** — pause checks, autosave

---

## 9. Event System

Events are the texture of the game. The engine triggers them; the UI displays them; the player decides.

### Event lifecycle

```
1. CONTENT — Event definition lives in /data/events/foo.json
            (or .ts for dynamic ones)

2. TRIGGER — Each tick, engine/events/trigger.ts evaluates triggers.
            Matching events get queued in eventQueueStore.

3. SCHEDULING — Events with mtth (mean time to happen) get a scheduled
                fire date instead of firing immediately.

4. SURFACE — UI subscribes to eventQueueStore. Player nation events
             surface as drawer/dialog when their date comes.

5. PLAYER DECISION — Player picks an option, effects fire via engine
                     resolver.

6. AI DECISION — For AI nations, AI picks option using aiWeight.
                 Effects fire automatically.

7. CLEANUP — Event removed from queue, ID added to recentlyFired.
```

### Event definitions

Events live in JSON files for easy authoring:

```json
{
  "id": "estate_nobility_demand_more_land",
  "title": "The Nobles Demand More Land",
  "description": "A council of barons has petitioned for grants of land from {realm}'s recent conquests. They argue their loyal service deserves reward.",
  "category": "estate",
  "trigger": {
    "conditions": [
      { "type": "nation_has_recent_conquests", "params": { "monthsBack": 24 } },
      { "type": "estate_loyalty_below", "params": { "estate": "nobility", "value": 60 } }
    ]
  },
  "weight": 10,
  "mtth": 12,
  "isPauseRequired": true,
  "isPlayerOnly": false,
  "isAIVisible": true,
  "oneShot": false,
  "options": [
    {
      "id": "grant_land",
      "label": "Grant lands to deserving nobles",
      "effects": [
        { "type": "modify_estate_loyalty", "params": { "estate": "nobility", "delta": 15 } },
        { "type": "modify_estate_land_share", "params": { "estate": "nobility", "delta": 0.05 } },
        { "type": "modify_crown_income", "params": { "delta": -0.05 } }
      ],
      "aiWeight": 60
    },
    {
      "id": "refuse",
      "label": "Refuse — the crown's lands stay the crown's",
      "effects": [
        { "type": "modify_estate_loyalty", "params": { "estate": "nobility", "delta": -10 } },
        { "type": "modify_prestige", "params": { "delta": 5 } }
      ],
      "aiWeight": 30
    },
    {
      "id": "compromise",
      "label": "Grant titles but no land",
      "effects": [
        { "type": "modify_estate_loyalty", "params": { "estate": "nobility", "delta": 5 } },
        { "type": "spend_gold", "params": { "amount": 50 } }
      ],
      "aiWeight": 40
    }
  ]
}
```

### Condition / effect type system

Conditions and effects are registered in a central registry. Each is a typed function.

```typescript
// engine/events/conditions.ts

export const conditionHandlers = {
  nation_has_recent_conquests: (
    nation: Nation,
    params: { monthsBack: number }
  ): boolean => { /* ... */ },

  estate_loyalty_below: (
    nation: Nation,
    params: { estate: EstateId; value: number }
  ): boolean => { /* ... */ },

  ideology_vector_in_range: (
    nation: Nation,
    params: { axis: string; min: number; max: number }
  ): boolean => { /* ... */ },

  // ~50 total conditions
};

export const effectHandlers = {
  modify_estate_loyalty: (
    nation: Nation,
    params: { estate: EstateId; delta: number }
  ) => { /* mutate via orchestrator */ },

  shift_ideology: (
    nation: Nation,
    params: Partial<IdeologyVector>
  ) => { /* ... */ },

  fire_event: (
    nation: Nation,
    params: { eventId: string; delay?: number }
  ) => { /* ... */ },

  // ~70 total effects
};
```

This registry pattern lets content authors add events in JSON without touching engine code.

### Scripted earthquake events

The ~25 scripted ideology earthquakes use the same event system but with `oneShot: true` and dated triggers:

```json
{
  "id": "french_revolution",
  "title": "Revolution!",
  "category": "scripted_earthquake",
  "earliestDate": { "year": 1789, "month": 1, "day": 1 },
  "latestDate": { "year": 1799, "month": 12, "day": 31 },
  "oneShot": true,
  "trigger": {
    "conditions": [
      { "type": "nation_culture_is", "params": { "cultureId": "french" } },
      { "type": "archetype_is", "params": { "archetypeId": "absolute_monarchy" } },
      { "type": "ideology_axis_above", "params": { "axis": "populist", "value": 30 } },
      { "type": "estate_loyalty_below", "params": { "estate": "peasants", "value": 30 } },
      { "type": "nation_in_financial_crisis" }
    ]
  },
  "options": [ /* royal capitulation, royal resistance, revolutionary triumph */ ]
}
```

---

## 10. Map Rendering

The map is the single most performance-critical piece of UI.

### Strategy

- **SVG-based** with React. Each province is a `<path>` with click handlers.
- **Memoize** every province component. They only re-render when their *own* data changes.
- **Map mode color** computed via selector — provinces subscribe to only the data their current map mode needs.
- **Defer non-visible provinces** if perf is tight (viewport culling) — only render provinces within camera bounds. Reserve for v0.4+ if needed.

### Province component shape

```typescript
// components/map/Province.tsx
import { memo } from 'react';
import { useProvinceColor } from '@/hooks/useProvinceColor';
import { useUIStore } from '@/stores/uiStore';

interface ProvinceProps {
  provinceId: ProvinceId;
}

export const ProvinceComponent = memo(({ provinceId }: ProvinceProps) => {
  const color = useProvinceColor(provinceId);  // map-mode aware
  const pathData = useProvinceStore(s => s.provinces[provinceId].pathData);
  const setSelected = useUIStore(s => s.setSelectedProvince);

  return (
    <path
      d={pathData}
      fill={color}
      stroke="#333"
      strokeWidth={0.5}
      onClick={() => setSelected(provinceId)}
      onTouchEnd={(e) => {
        e.preventDefault();
        setSelected(provinceId);
      }}
    />
  );
});
ProvinceComponent.displayName = 'Province';
```

### Map container

```typescript
// components/map/WorldMap.tsx
export function WorldMap() {
  const provinceIds = useProvinceStore(s => Object.keys(s.provinces));
  const { cameraCenter, cameraZoom } = useUIStore(s => ({
    cameraCenter: s.cameraCenter,
    cameraZoom: s.cameraZoom,
  }));

  // Compute viewBox from camera state
  const viewBox = computeViewBox(cameraCenter, cameraZoom);

  return (
    <svg viewBox={viewBox} className="w-full h-full touch-none">
      {provinceIds.map(id => (
        <ProvinceComponent key={id} provinceId={id} />
      ))}
      <ArmyMarkers />
      <FleetMarkers />
    </svg>
  );
}
```

### Pan/zoom gestures

Use native React touch events. No external library needed for basic pan/zoom.

```typescript
// hooks/useMapGestures.ts
export function useMapGestures(svgRef: React.RefObject<SVGSVGElement>) {
  const setCamera = useUIStore(s => s.setCamera);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let startTouches: Touch[] = [];
    let startCamera = useUIStore.getState();

    const handleTouchStart = (e: TouchEvent) => {
      startTouches = Array.from(e.touches);
      startCamera = useUIStore.getState();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && startTouches.length === 1) {
        // pan
        const dx = e.touches[0].clientX - startTouches[0].clientX;
        const dy = e.touches[0].clientY - startTouches[0].clientY;
        setCamera({
          cameraCenter: {
            x: startCamera.cameraCenter.x - dx / startCamera.cameraZoom,
            y: startCamera.cameraCenter.y - dy / startCamera.cameraZoom,
          },
        });
      } else if (e.touches.length === 2 && startTouches.length === 2) {
        // pinch zoom
        const startDist = touchDistance(startTouches[0], startTouches[1]);
        const currentDist = touchDistance(e.touches[0], e.touches[1]);
        const zoomDelta = currentDist / startDist;
        setCamera({
          cameraZoom: startCamera.cameraZoom * zoomDelta,
        });
      }
    };

    svg.addEventListener('touchstart', handleTouchStart, { passive: false });
    svg.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      svg.removeEventListener('touchstart', handleTouchStart);
      svg.removeEventListener('touchmove', handleTouchMove);
    };
  }, [svgRef, setCamera]);
}
```

### Map data source

Two options for the actual province geometry:

1. **Natural Earth data + custom hand-drawn province boundaries** — accurate but lots of work
2. **Borrow / adapt an open-source historical map dataset** — faster

For v0.1 we hand-draw a small ~50-province Western European map to test the loop. For v1.0, expand to 400 with proper data work. The geometry lives in `/public/maps/provinces.geojson` (or pre-converted SVG paths in `/src/data/provinces/*.json`).

### Map modes

A map-mode selector reads the appropriate data and colors provinces:

```typescript
// hooks/useProvinceColor.ts
export function useProvinceColor(provinceId: ProvinceId): string {
  const mapMode = useUIStore(s => s.currentMapMode);
  const province = useProvinceStore(s => s.provinces[provinceId]);

  switch (mapMode) {
    case 'political': {
      const owner = useNationStore(s => s.nations[province.controllerId]);
      return owner?.flagColor ?? '#888';
    }
    case 'religion': {
      const religion = useReligionStore(s => s.religions[province.religionId]);
      return religion?.color ?? '#888';
    }
    case 'development':
      return developmentToColor(province.development);
    // ... etc
  }
}
```

---

## 11. Persistence (Save/Load)

### Storage choice

- **v0.1–v0.4:** localStorage
  - Pros: simple sync API, fits 5MB easily for compressed saves
  - Cons: hits the 5MB cap if saves get huge
- **v1.0:** IndexedDB
  - More space (no practical limit on iPad), async API
  - Migration path: detect localStorage saves, migrate to IndexedDB on load

### Save format

```typescript
// types/save.ts

export interface SaveGame {
  version: number;                   // bump when schema changes
  timestamp: number;                 // when saved (Date.now())
  campaignSeed: string;              // for reproducibility check
  inGameDate: GameDate;
  playerNationId: NationId;
  metadata: {
    playerNationName: string;
    yearsPlayed: number;
    prestige: number;
    screenshot?: string;             // base64 thumbnail
  };
  stores: {
    world: any;
    province: any;
    nation: any;
    dynasty: any;
    economy: any;
    military: any;
    diplomacy: any;
    religion: any;
    politics: any;
    tech: any;
    ideology: any;
    eventQueue: any;
    // uiStore NOT saved — UI state resets per session
  };
}
```

### Save flow

```typescript
// persistence/saveGame.ts
export async function saveGame(slot: string): Promise<void> {
  const save: SaveGame = {
    version: SAVE_SCHEMA_VERSION,
    timestamp: Date.now(),
    campaignSeed: useWorldStore.getState().campaignSeed,
    inGameDate: useWorldStore.getState().currentDate,
    playerNationId: useWorldStore.getState().playerNationId,
    metadata: { /* ... */ },
    stores: {
      world: useWorldStore.getState().snapshot(),
      province: useProvinceStore.getState().snapshot(),
      nation: useNationStore.getState().snapshot(),
      dynasty: useDynastyStore.getState().snapshot(),
      economy: useEconomyStore.getState().snapshot(),
      military: useMilitaryStore.getState().snapshot(),
      diplomacy: useDiplomacyStore.getState().snapshot(),
      religion: useReligionStore.getState().snapshot(),
      politics: usePoliticsStore.getState().snapshot(),
      tech: useTechStore.getState().snapshot(),
      ideology: useIdeologyStore.getState().snapshot(),
      eventQueue: useEventQueueStore.getState().snapshot(),
    },
  };

  const serialized = JSON.stringify(save);
  // Optional: compress with lz-string before storing
  await storageBackend.set(`save:${slot}`, serialized);
}
```

### Load flow

```typescript
// persistence/loadGame.ts
export async function loadGame(slot: string): Promise<void> {
  const serialized = await storageBackend.get(`save:${slot}`);
  if (!serialized) throw new Error('Save not found');

  let save: SaveGame = JSON.parse(serialized);

  // Migration if save schema is older
  if (save.version < SAVE_SCHEMA_VERSION) {
    save = migrateSave(save);
  }

  // Hydrate each store
  useWorldStore.getState().hydrate(save.stores.world);
  useProvinceStore.getState().hydrate(save.stores.province);
  useNationStore.getState().hydrate(save.stores.nation);
  useDynastyStore.getState().hydrate(save.stores.dynasty);
  useEconomyStore.getState().hydrate(save.stores.economy);
  useMilitaryStore.getState().hydrate(save.stores.military);
  useDiplomacyStore.getState().hydrate(save.stores.diplomacy);
  useReligionStore.getState().hydrate(save.stores.religion);
  usePoliticsStore.getState().hydrate(save.stores.politics);
  useTechStore.getState().hydrate(save.stores.tech);
  useIdeologyStore.getState().hydrate(save.stores.ideology);
  useEventQueueStore.getState().hydrate(save.stores.eventQueue);
}
```

### Migrations

```typescript
// persistence/migrations.ts
const migrations: Record<number, (save: any) => any> = {
  1: (save) => {
    // From v0 to v1: rename a field, add defaults
    save.stores.nation.nations = Object.fromEntries(
      Object.entries(save.stores.nation.nations).map(([id, n]: any) => [
        id,
        { ...n, toleranceScore: n.toleranceScore ?? 30 },
      ])
    );
    save.version = 1;
    return save;
  },
  // 2: ... future migrations
};

export function migrateSave(save: SaveGame): SaveGame {
  let migrated = save;
  while (migrated.version < SAVE_SCHEMA_VERSION) {
    const nextVersion = migrated.version + 1;
    if (!migrations[nextVersion]) {
      throw new Error(`No migration available for version ${nextVersion}`);
    }
    migrated = migrations[nextVersion](migrated);
  }
  return migrated;
}
```

### Autosave

- Every 12 in-game months: autosave to a rotating slot (`autosave_1`, `autosave_2`, `autosave_3`)
- On ruler death: emergency save (one slot, overwritten)
- Manual save: any of 5 slots

---

## 12. Seeded RNG

Same approach as West Francia — deterministic reproducible randomness.

```typescript
// lib/rng.ts

/**
 * Mulberry32 — a simple, fast, high-quality 32-bit PRNG.
 * Same seed = same sequence every time.
 */
export function createRNG(seed: string) {
  let state = hashSeed(seed);

  function next(): number {
    state = (state + 0x6D2B79F5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,                                    // 0-1
    int: (min: number, max: number) =>       // integer in [min, max]
      Math.floor(next() * (max - min + 1)) + min,
    pick: <T>(arr: T[]): T =>                 // random element
      arr[Math.floor(next() * arr.length)],
    weighted: <T>(items: Array<[T, number]>): T => {
      const total = items.reduce((s, [_, w]) => s + w, 0);
      let r = next() * total;
      for (const [item, weight] of items) {
        r -= weight;
        if (r <= 0) return item;
      }
      return items[items.length - 1][0];
    },
    chance: (p: number): boolean => next() < p,
  };
}

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
```

### Per-subsystem RNG streams

To avoid one system's RNG calls affecting another's (which would break reproducibility when systems run in different orders), use **per-subsystem RNG streams** seeded from the master seed:

```typescript
// engine/rngStreams.ts
const masterSeed = useWorldStore.getState().campaignSeed;
const monthsPlayed = useWorldStore.getState().monthsPlayed;

export const rng = {
  combat: createRNG(`${masterSeed}:combat:${monthsPlayed}`),
  mortality: createRNG(`${masterSeed}:mortality:${monthsPlayed}`),
  events: createRNG(`${masterSeed}:events:${monthsPlayed}`),
  ai: createRNG(`${masterSeed}:ai:${monthsPlayed}`),
  conversion: createRNG(`${masterSeed}:conversion:${monthsPlayed}`),
  // ... per system
};
```

Each tick refreshes the streams with the new `monthsPlayed`. This guarantees that two identical save games at month N produce identical results going forward, regardless of UI interactions.

---

## 13. Content-Entry Tool

A separate route within the same Next.js app for authoring content without touching JSON.

### Route structure

```
/content-tool/                 — landing, list of all content types
/content-tool/characters       — list all hand-authored 1200 characters
/content-tool/characters/new   — form to create one
/content-tool/characters/[id]  — edit existing
/content-tool/provinces        — same pattern
/content-tool/nations
/content-tool/events
/content-tool/archetypes
/content-tool/traits
/content-tool/dynasties
```

### Tool features

**Form-driven entry:**
- Dropdowns populated from existing content (cultures, religions, traits, dynasties)
- Validation on submit (Zod schemas)
- Save to `/src/data/...` via... 

**Two operating modes:**

1. **Dev mode (local):** Tool writes directly to `/src/data` files. Used during development. Built with a dev-only Next.js API route that has filesystem access (only runs in `next dev`, not in production).

2. **Production mode:** Tool exports/copies JSON to clipboard. Author pastes into `/src/data` files manually via git. Avoids any production filesystem write.

```typescript
// app/api/content-tool/character/route.ts
// IMPORTANT: only available in dev — gated by env check
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not available in production', { status: 403 });
  }
  const body = await req.json();
  const character = characterSchema.parse(body);
  await writeFile(
    `src/data/characters/${character.id}.json`,
    JSON.stringify(character, null, 2)
  );
  return Response.json({ ok: true });
}
```

### Bulk CSV import

For Tier 3 nations (~150 characters at ~3 each), CSV import is faster than form-by-form:

```typescript
// app/content-tool/characters/import-csv/page.tsx
// Paste CSV → validate → preview → confirm → write to files
```

Columns: `dynastyId, givenName, gender, birthYear, diplomacy, stewardship, martial, intrigue, learning, piety, traits, spouseId, ...`

### Form design

Character entry form structure (representative example):

```
┌─ Identity ────────────────────────────
│ ID:           [auto-generated UUID]
│ Given Name:   [text]
│ Dynasty Name: [text]
│ Nickname:     [text, optional]
│ Culture:      [dropdown from cultures]
│ Religion:     [dropdown from religions]
│ Gender:       [radio]
│ Birth Date:   [year][month][day]
│ Death Date:   [if known, optional]
│
├─ Stats ────────────────────────────────
│ Diplomacy:    [slider 0-25] [number]
│ Stewardship:  [slider 0-25] [number]
│ ... etc
│
├─ Traits ───────────────────────────────
│ [Multi-select with source dropdown per trait]
│
├─ Family ───────────────────────────────
│ Father:       [searchable dropdown]
│ Mother:       [searchable dropdown]
│ Spouse:       [searchable dropdown]
│ Children:     [list with add/remove]
│ Siblings:     [list with add/remove]
│
├─ Position ─────────────────────────────
│ Title:        [text]
│ Court Role:   [dropdown]
│ Field Role:   [dropdown]
│ Location:     [province dropdown]
│
├─ Special Flags ────────────────────────
│ Plot Armor:    [checkbox]
│ Plot Armor Expires: [date]
│
└─ [SAVE]
```

### Content validation at startup

When the game loads, all content files are validated against Zod schemas:

```typescript
// scripts/validateContent.ts (also runs at app startup)
import { characterSchema } from '@/data/schemas/character';
import * as characters from '@/data/characters';

export function validateAllContent() {
  const errors: string[] = [];

  for (const [id, raw] of Object.entries(characters)) {
    const result = characterSchema.safeParse(raw);
    if (!result.success) {
      errors.push(`Character ${id}: ${result.error.message}`);
    }
  }

  // ... validate provinces, nations, events, etc.

  if (errors.length > 0) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Content validation failed:\n${errors.join('\n')}`);
    } else {
      console.error('Content validation errors:', errors);
      // In production, log but don't crash — best-effort load
    }
  }
}
```

---

## 14. Testing Strategy

### Test pyramid

```
                    ▲
                   ╱ ╲
                  ╱E2E╲          Few: 5-10 critical playthrough flows
                 ╱─────╲
                ╱       ╲
               ╱  Integ  ╲       Some: 50-100 tick-loop integration tests
              ╱───────────╲
             ╱             ╲
            ╱     Unit      ╲    Many: ~500 unit tests per system module
           ╱─────────────────╲
```

### Unit tests

Every engine module gets unit tests for its core logic. Pure functions are easy to test.

```typescript
// tests/engine/military/combat.test.ts
import { simulateBattle } from '@/engine/military/combat';
import { mockNation, mockArmy, mockGeneral } from '../../fixtures';

describe('simulateBattle', () => {
  it('attacker with 2x numbers wins on plains terrain', () => {
    const attackerArmy = mockArmy({ regiments: 20 });
    const defenderArmy = mockArmy({ regiments: 10 });
    const result = simulateBattle(attackerArmy, defenderArmy, {
      terrain: 'plains',
      combatWidth: 30,
    });
    expect(result.winner).toBe(attackerArmy.nationId);
  });

  it('defender wins on mountain terrain with 0.5x numbers (combat width effect)', () => {
    const attackerArmy = mockArmy({ regiments: 30 });
    const defenderArmy = mockArmy({ regiments: 15 });
    const result = simulateBattle(attackerArmy, defenderArmy, {
      terrain: 'mountains',
      combatWidth: 14,
    });
    // Mountain combat width 14 means attacker's 30 regiments mostly sit reserve
    expect(result.attackerCasualtyRate).toBeGreaterThan(0.3);
  });

  it('Brilliant Strategist general wins outnumbered', () => {
    const attackerGeneral = mockGeneral({
      martial: 20,
      traits: ['brilliant_strategist'],
    });
    const attackerArmy = mockArmy({ regiments: 10, generalId: attackerGeneral.id });
    const defenderArmy = mockArmy({ regiments: 18 });
    const result = simulateBattle(attackerArmy, defenderArmy, { terrain: 'plains' });
    expect(result.winner).toBe(attackerArmy.nationId);
  });
});
```

### System-level unit test targets

Each system gets coverage for:

**Economy:**
- Income calculation with various estate ownership splits
- Trade node control share with multiple controllers
- World price drift with supply changes
- Building completion timing
- Loan interest accumulation

**Military:**
- Combat resolution across all terrains
- Combat width caps
- Attrition rates by condition
- Siege progression with all modifiers
- Naval invasion sequence
- Feudal levy service limit + desertion

**Diplomacy:**
- Opinion modifier expiration
- Threat calculation
- Coalition recruitment thresholds
- Alliance call-to-arms evaluation
- AI ambition progress

**Dynasty:**
- Stat inheritance
- Trait inheritance probability
- Consanguinity calculation
- Inbreeding effect probability
- Mortality roll by age
- Succession resolution per succession law

**Tech:**
- Tech point generation with ruler/court/estate contributions
- Institution spawn condition matching
- Institution spread modifier calculations
- Era threshold detection
- Steppe absorption math

**Religion:**
- Conversion progress with modifiers
- Papal authority recalculation
- Leadership claim eligibility
- Tolerance effects on mismatch
- Reformation spawn conditions

**Politics:**
- Estate loyalty drift
- Privilege effect application
- Revolt firing condition
- Pretender war setup
- Stability score formula
- Influence redistribution on grant/revoke

**Ideology:**
- Vector drift per source (ruler, estates, events, institutions)
- Archetype match evaluation
- Archetype transition firing
- Scripted earthquake condition matching
- Victory scoring per archetype

### Integration tests

End-to-end tick tests verify cross-system behavior:

```typescript
// tests/integration/feudalLevyServiceLimit.test.ts
describe('Feudal levy service limit', () => {
  it('triggers nobility loyalty hit and desertion after 40 days', async () => {
    const world = createTestWorld({
      playerNation: 'france_1200',
      governmentType: 'feudal_monarchy',
    });

    // Call feudal levies
    callFeudalLevies(world.playerNationId);

    // Run 30 days of ticks
    for (let i = 0; i < 1; i++) runMonthlyTick();

    // Should still have full army
    expect(getArmySize(world.playerNationId)).toBe(20);

    // Run 20 more days (now past 40)
    for (let i = 0; i < 1; i++) runMonthlyTick();

    // Desertion should kick in
    expect(getArmySize(world.playerNationId)).toBeLessThan(20);

    // Nobility loyalty hit applied
    expect(getEstateLoyalty(world.playerNationId, 'nobility')).toBeLessThan(50);
  });
});
```

### Snapshot/reproducibility tests

Use the seeded RNG to verify deterministic behavior:

```typescript
// tests/reproducibility.test.ts
it('same seed produces same world after 120 months', () => {
  const seed = 'reproducibility-test-001';

  const worldA = createNewCampaign({ seed, playerNation: 'france_1200' });
  for (let i = 0; i < 120; i++) runMonthlyTick();
  const snapshotA = snapshotAllStores();

  // Reset
  resetAllStores();

  const worldB = createNewCampaign({ seed, playerNation: 'france_1200' });
  for (let i = 0; i < 120; i++) runMonthlyTick();
  const snapshotB = snapshotAllStores();

  expect(snapshotA).toEqual(snapshotB);
});
```

### What we DON'T heavily test

- React components — Zustand store changes drive everything, and we test stores
- CSS / visual rendering — manual testing on iPad
- Map gestures — manual testing

### CI strategy

- GitHub Actions runs all tests on every push
- Vitest --run for full suite (target: <60s)
- Build also runs as part of CI
- Vercel deploy preview per branch

---

## 15. Performance Strategy

The biggest perf risks:

1. **Map rendering with 400 provinces** — manageable with memoization
2. **Tick loop completing in budget** — 200ms ceiling at speed 5
3. **AI processing 80 nations** — tiered simulation strategy
4. **Save file size** — JSON could balloon; compression if needed

### Map perf tactics

- **React.memo** on every Province component
- **Selector specificity** — components subscribe to only the data they need
- **Map mode color caching** — compute colors when mode changes, not every render
- **Avoid useState for transient data** — use refs for things like in-progress drag positions
- **Provinces are not in React state** — they're in Zustand store, components read via selector
- **No SVG filters in hot paths** — they're expensive on iPad GPU

### Tick perf tactics

- **Tier AI by importance** — Tier 1 nations get full simulation, Tier 3 simplified
- **Cache computed fields** — `nation.cachedIncome` refreshes only when inputs change
- **Skip subsystem ticks for paused situations** — only run economy if no war declarations pending, etc.
- **Profile aggressively in dev** — log warnings when tick exceeds budget

### Memory tactics

- **Normalize state** — entities by ID, references by ID, no nested object duplication
- **Cap event history** — `ideologyHistory` and `driftHistory` keep only major points + last 60 months detailed
- **Cap recentlyFired ring buffer** — last 100 only

### Save size tactics

- If saves exceed 2MB, add LZ-string compression before localStorage write
- For v1.0+, IndexedDB removes the practical cap; saves can be larger but compression still smart

---

## 16. PWA Configuration

iPad install is core to the project. PWA setup matters.

### Manifest

```json
// public/manifest.json
{
  "name": "Kingdom Come",
  "short_name": "KingdomCome",
  "description": "A grand strategy game from 1200 to 1900",
  "start_url": "/play",
  "display": "fullscreen",
  "orientation": "landscape-primary",
  "background_color": "#1a1a1a",
  "theme_color": "#1a1a1a",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### Meta tags for iPad

```typescript
// app/layout.tsx
export const metadata = {
  title: 'Kingdom Come',
  description: 'A grand strategy game',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Kingdom Come',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,             // prevent pinch-zoom on UI
  },
};
```

### Service worker (optional v1.x)

Skip for v1.0. Add only when offline support is needed. Next.js + Workbox is the standard path when ready.

### CSS for iPad-specific quirks

```css
/* app/globals.css */

html, body {
  height: 100%;
  width: 100%;
  overflow: hidden;             /* No scrolling — game fills viewport */
  overscroll-behavior: none;    /* No bounce on iPad */
  touch-action: none;           /* We handle all touches ourselves */
  -webkit-touch-callout: none;  /* No long-press selection menu */
  -webkit-user-select: none;
  user-select: none;
}

.tap-target {
  min-height: 44px;             /* Apple HIG */
  min-width: 44px;
}
```

---

## 17. Deployment

### Branch model

- `main` — production. Auto-deploys to Vercel production URL.
- `dev` — active development. Auto-deploys to dev preview URL.
- Feature branches — auto-deploy preview URLs (great for iPad testing).

### Vercel setup

- Project: `kingdom-come`
- Build command: `next build` (default)
- Output: `.next` (default)
- Node version: 20.x
- Environment variables (if any): set in Vercel dashboard

### Domain (optional)

- Default: `kingdom-come.vercel.app`
- Custom: pick something memorable when ready

### iPad install flow

1. Visit `kingdom-come.vercel.app` in Safari
2. Tap Share → Add to Home Screen
3. App icon appears, opens full-screen
4. No browser chrome, behaves like native app

### Beta channel

For dev builds without breaking the main install:
- Preview branch URL stays separate from main URL
- Install the preview build as a separate icon on iPad for testing

---

## 18. Development Workflow

### Initial setup

```bash
# Clone repo
git clone https://github.com/michaelmuirhead/KingdomCome.git
cd KingdomCome

# Install
npm install

# Run dev server
npm run dev

# In another terminal, run tests in watch mode
npm test
```

### Day-to-day commands

```bash
npm run dev              # Next.js dev server (localhost:3000)
npm run build            # Production build
npm run start            # Run production build locally
npm test                 # Vitest in watch mode
npm run test:run         # Single test run (for CI)
npm run typecheck        # tsc --noEmit
npm run lint             # ESLint
npm run validate-content # Run Zod validation on /src/data
```

### Recommended VSCode extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar) — actually no, that's Vue, skip
- Pretty TypeScript Errors
- GitLens

### Git conventions

- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`)
- One-line subject, optional body
- Branch names: `feature/...`, `fix/...`, `content/...`

### Working with content during development

1. Run `npm run dev`
2. Open `/content-tool` route
3. Add/edit characters, provinces, events
4. Tool writes directly to `/src/data/...` (dev mode only)
5. Restart dev server or hot-reload picks up changes
6. Commit content files alongside code changes

### Testing on iPad during development

1. Connect iPad to same wifi as dev machine
2. Find dev machine's local IP (`ipconfig getifaddr en0` on Mac)
3. On iPad Safari, visit `http://<dev-ip>:3000`
4. Test features
5. For deeper testing, push a feature branch → use Vercel preview URL → install on iPad

### Debugging

- React DevTools (Chrome extension) — see component tree
- Zustand DevTools (browser extension) — see store state
- React Native DevTools — actually skip, we're not React Native
- `localStorage.debug = 'kc:*'` — gated debug logs

---

## Appendix A: Build Order for v0.1

A condensed implementation order, ready to translate into tickets in our next step. Each item is one focused PR / session of work.

1. Bootstrap Next.js + TypeScript + Tailwind + Zustand + Vitest
2. Set up folder structure per Section 3
3. Define core types (Province, Nation, Character, World) in `/src/types`
4. Implement seeded RNG (`/src/lib/rng.ts`)
5. Implement empty Zustand stores (worldStore, provinceStore, nationStore, dynastyStore, uiStore)
6. Hand-author ~50 Western European provinces in `/src/data/provinces`
7. Hand-author ~10 nations in `/src/data/nations` (France, England, HRE, Castile, Aragon, Papal States, Italian republics)
8. Hand-author ~20 starting characters in `/src/data/characters` for those nations
9. Build content loader that hydrates stores from `/src/data` at startup
10. Build SVG WorldMap component with Province component, basic political map mode
11. Implement pan/zoom gestures
12. Add province selection drawer
13. Add HUD top bar (date, speed controls, treasury display)
14. Implement tick loop hook + tick engine skeleton
15. Implement minimal economyTick (just tax income)
16. Implement minimal dynastyTick (aging, mortality, succession)
17. Implement minimal militaryTick (raise army, move army)
18. Wire up "Declare War" button → minimal diplomacyTick → war state
19. Implement abstracted combat for AI declarations
20. PWA manifest + iPad install testing
21. Save/load to localStorage
22. Polish v0.1 — bug fixes, perf tuning

This is roughly the v0.1 punch list. Option 4 will turn each into a proper ticket with acceptance criteria.

---

*End of TECH.md. This document represents the technical architecture for Kingdom Come, locked alongside DESIGN.md.*
