# Kingdom Come — v0.1 Roadmap

**Version:** 1.0
**Companion to:** DESIGN.md, TECH.md
**Scope:** v0.1 (Skeleton — prove the loop runs on iPad)
**Target outcome:** Player picks France or England, plays through ~10 years of game time, can declare a war on AI neighbor, ruler dies and heir takes over, save/load works, installs on iPad as PWA.

---

## How to use this document

Each section below is a complete GitHub Issue, ready to copy-paste. The format is:

- **Title** — copy as Issue title
- **Labels** — apply these GitHub labels
- **Body** — copy everything below the Issue title into the Issue body

Issues are ordered by dependencies. **Complete them in order** unless explicitly marked as parallelizable.

**Labels used:**
- `v0.1` — applied to all v0.1 issues
- `setup` — project bootstrapping
- `types` — TypeScript type definitions
- `store` — Zustand store implementation
- `engine` — simulation logic
- `content` — hand-authored data
- `ui` — React components
- `infra` — build/deploy/PWA
- `polish` — cleanup and tuning

**Effort scale:**
- `XS` — under 1 hour
- `S` — 1-3 hours
- `M` — 3-8 hours (one focused session)
- `L` — 8-16 hours (multi-session)
- `XL` — 16+ hours (week-scale)

---

## Issue #1: Bootstrap Next.js 14 project with TypeScript, Tailwind, Zustand, Vitest

**Labels:** `v0.1`, `setup`, `infra`
**Effort:** S
**Dependencies:** None

### Description

Initialize the Kingdom Come repository with the production tech stack defined in TECH.md Section 2. Get a Next.js 14 App Router project running with TypeScript strict mode, Tailwind CSS, Zustand, and Vitest configured. Verify everything compiles and tests run.

### Acceptance criteria

- [ ] Next.js 14 project initialized with App Router
- [ ] TypeScript configured in `strict: true` mode in `tsconfig.json`
- [ ] Tailwind CSS configured and verified working (test class renders correctly)
- [ ] Zustand v4 installed
- [ ] Zod v3 installed
- [ ] Vitest v1 installed with `@testing-library/react`
- [ ] One trivial Vitest test passes (`expect(1 + 1).toBe(2)`)
- [ ] One trivial React component renders Tailwind styles in dev
- [ ] `package.json` scripts: `dev`, `build`, `start`, `test`, `test:run`, `typecheck`, `lint`
- [ ] ESLint + Prettier configured with team-friendly defaults
- [ ] `.gitignore` covers `node_modules`, `.next`, `.env*.local`, `coverage`
- [ ] `npm run dev` starts on localhost:3000
- [ ] `npm run typecheck` passes
- [ ] `npm run test:run` passes
- [ ] `npm run build` produces a successful production build
- [ ] Initial commit pushed to GitHub `michaelmuirhead/KingdomCome`

### Files affected

- `package.json`
- `tsconfig.json`
- `tailwind.config.ts`
- `next.config.js`
- `vitest.config.ts`
- `.eslintrc.json`
- `.prettierrc`
- `.gitignore`
- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`

### Test requirements

- One smoke test in `tests/smoke.test.ts` verifying Vitest is wired correctly
- One React render test verifying Tailwind classes apply

### Notes

- Pin exact versions in `package.json`: Next 14.x, React 18.x, TypeScript 5.x, Zustand 4.x, Zod 3.x, Vitest 1.x
- Use Turbopack in dev (Next 14 default)

---

## Issue #2: Set up folder structure per TECH.md Section 3

**Labels:** `v0.1`, `setup`
**Effort:** XS
**Dependencies:** #1

### Description

Create the full folder hierarchy as specified in TECH.md Section 3. Add a `README.md` to each major directory describing what lives there. This makes the architecture concrete and gives Claude/future contributors a clear map.

### Acceptance criteria

- [ ] All directories created under `/src` matching TECH.md structure
- [ ] Each major directory has a one-paragraph `README.md` describing its purpose
- [ ] No code yet — just empty `.gitkeep` files where directories are otherwise empty
- [ ] Folder structure committed in one PR

### Files affected

Folders created:
- `/src/engine/{economy,military,diplomacy,dynasty,tech,religion,politics,ideology,ai,events}/`
- `/src/stores/`
- `/src/types/`
- `/src/data/{provinces,nations,characters,cultures,religions,traits,buildings,units,tech,institutions,events,archetypes,estates,diaspora,privileges,trade_nodes,trade_goods,pilgrimage_sites,naming_pools,schemas}/`
- `/src/components/{map,hud,drawers,dynasty,diplomacy,military,economy,tech,politics,religion,ideology,events,shared,content-tool}/`
- `/src/hooks/`
- `/src/lib/`
- `/src/persistence/`
- `/src/constants/`
- `/public/{maps,icons,portraits}/`
- `/tests/{engine,stores,lib,integration}/`
- `/scripts/`

Files:
- `README.md` files in each major directory
- `.gitkeep` files in empty directories

### Test requirements

None (this is structural).

---

## Issue #3: Implement core type definitions (Province, Nation, Character, World)

**Labels:** `v0.1`, `types`
**Effort:** M
**Dependencies:** #2

### Description

Translate the data schemas from TECH.md Section 6 into TypeScript interfaces. v0.1 only needs the core entities — full schemas for all 8 systems wait until those systems get built. Focus on `Province`, `Nation`, `Character`, `World`, `Army`, `War`, `Treaty`, `UIState`, and common types.

### Acceptance criteria

- [ ] `/src/types/common.ts` — shared types (EntityId, GameDate, Position, Era, etc.)
- [ ] `/src/types/world.ts` — WorldState interface
- [ ] `/src/types/province.ts` — Province interface + TerrainType, ClimateType
- [ ] `/src/types/nation.ts` — Nation, GovernmentType, SuccessionLaw, IdeologyVector, IncomeBreakdown, ExpenseBreakdown, Ambition
- [ ] `/src/types/character.ts` — Character, CharacterTrait, HealthCondition, CourtRole, FieldRole, EducationFocus
- [ ] `/src/types/army.ts` — Army, Regiment, Battle, Siege, Fleet, Ship
- [ ] `/src/types/war.ts` — War, WarGoal, CasusBelliType
- [ ] `/src/types/treaty.ts` — Treaty, OpinionEntry, OpinionModifier
- [ ] `/src/types/ui.ts` — UIState, MapMode, DrawerType, DialogType
- [ ] `/src/types/index.ts` re-exports everything cleanly
- [ ] `npm run typecheck` passes with zero errors
- [ ] All interfaces use `export interface` (not `export type`) where extensible

### Files affected

- `/src/types/common.ts`
- `/src/types/world.ts`
- `/src/types/province.ts`
- `/src/types/nation.ts`
- `/src/types/character.ts`
- `/src/types/army.ts`
- `/src/types/war.ts`
- `/src/types/treaty.ts`
- `/src/types/ui.ts`
- `/src/types/index.ts`

### Test requirements

- Type-only "test" via a `tests/types.test-d.ts` file with `expectTypeOf` assertions — verifies key fields are required, optionals are optional, unions are correct

### Notes

- For v0.1, leave types like `Religion`, `Estate`, `Tech`, `Archetype`, etc. as stubs (`type ReligionId = string`). Full schemas wait for v0.3+.
- The `cachedIncome`, `cachedExpenses`, `cachedNetMonthly`, `cachedPersonality` fields on Nation can be present but unused in v0.1.

---

## Issue #4: Implement seeded RNG library

**Labels:** `v0.1`, `engine`
**Effort:** S
**Dependencies:** #2

### Description

Implement the mulberry32-based seeded PRNG from TECH.md Section 12. Critical for reproducibility — same seed must produce identical worlds. Build per-subsystem stream support so different systems' RNG calls don't interfere with each other's reproducibility.

### Acceptance criteria

- [ ] `/src/lib/rng.ts` exports `createRNG(seed: string)` returning `{ next, int, pick, weighted, chance }`
- [ ] Two RNG instances with the same seed produce identical sequences
- [ ] `chance(0.5)` over 10000 calls returns ~5000 trues (within 5% tolerance)
- [ ] `int(1, 6)` returns valid uniform distribution over 10000 calls
- [ ] `pick<T>(arr)` returns valid element from array
- [ ] `weighted` returns items respecting weights
- [ ] `/src/engine/rngStreams.ts` exports a factory that creates per-subsystem RNG streams seeded from `masterSeed + subsystemName + monthsPlayed`

### Files affected

- `/src/lib/rng.ts`
- `/src/engine/rngStreams.ts`

### Test requirements

- `tests/lib/rng.test.ts`:
  - Same seed = same sequence
  - Distribution tests for `chance`, `int`, `pick`
  - Different seeds produce different sequences
  - `weighted` selection probability matches input weights

### Notes

- The RNG stream refresh on `monthsPlayed` change ensures reproducibility across tick orderings
- See TECH.md Section 12 for the exact mulberry32 implementation

---

## Issue #5: Implement core utility libraries (id, date, vector, geometry)

**Labels:** `v0.1`, `engine`
**Effort:** S
**Dependencies:** #3, #4

### Description

Implement the small pure utility functions used across the engine: ID generation, in-game date math, ideology vector math, simple SVG geometry helpers. These are referenced everywhere; build them first.

### Acceptance criteria

- [ ] `/src/lib/id.ts` — `generateId(prefix?: string): string` (use crypto.randomUUID if available, fall back to RNG-based)
- [ ] `/src/lib/date.ts`:
  - [ ] `advanceMonth(date: GameDate): GameDate`
  - [ ] `addMonths(date: GameDate, months: number): GameDate`
  - [ ] `monthsBetween(a: GameDate, b: GameDate): number`
  - [ ] `formatDate(date: GameDate): string` — e.g., "March 1230"
  - [ ] `compareDates(a, b): -1 | 0 | 1`
- [ ] `/src/lib/vector.ts`:
  - [ ] `createVector(): IdeologyVector` — zero vector
  - [ ] `vectorDistance(a, b): number` — Euclidean
  - [ ] `addVector(v, delta): IdeologyVector` — clamps each axis to -100..100
  - [ ] `vectorInRange(v, range): boolean` — for archetype matching
- [ ] `/src/lib/geometry.ts`:
  - [ ] `pointInPath(point, pathD): boolean` — for province hit-testing
  - [ ] `centerOfPath(pathD): Position`
  - [ ] `boundingBox(pathD): { min: Position; max: Position }`
- [ ] `npm run typecheck` passes

### Files affected

- `/src/lib/id.ts`
- `/src/lib/date.ts`
- `/src/lib/vector.ts`
- `/src/lib/geometry.ts`

### Test requirements

- `tests/lib/date.test.ts` — date math, especially month rollover (December → January, year++)
- `tests/lib/vector.test.ts` — vector math + range checks + clamping
- `tests/lib/geometry.test.ts` — point-in-path for a known SVG shape
- `tests/lib/id.test.ts` — IDs are unique across 10000 calls

### Notes

- `crypto.randomUUID()` is available in modern browsers and Node 19+
- For `pointInPath`, can use the native browser SVG `isPointInFill` API or implement a simple ray-casting algorithm — pick whichever is more portable across iPad Safari + Node tests
- Vector math should clamp on every operation to avoid drift past bounds

---

## Issue #6: Implement worldStore, uiStore (smallest stores, no dependencies)

**Labels:** `v0.1`, `store`
**Effort:** S
**Dependencies:** #3, #5

### Description

Build the two smallest stores first to validate the pattern. `worldStore` holds game time + speed + player nation + flags. `uiStore` holds current map mode, selected entities, drawer state, camera. Use the Zustand pattern template from TECH.md Section 7.

### Acceptance criteria

- [ ] `/src/stores/worldStore.ts`:
  - [ ] State: `currentDate, speedSetting, isPaused, campaignSeed, campaignStartDate, era, playerNationId, flags, firedScriptedEvents, monthsPlayed`
  - [ ] Actions: `advanceMonth(), setSpeed(speed), togglePause(), pauseWithReasons(reasons), setPlayerNation(id), setFlag(key, value)`
  - [ ] `hydrate(partial)` and `snapshot()` methods for save/load
  - [ ] Wrapped with `devtools` and `subscribeWithSelector` middleware
- [ ] `/src/stores/uiStore.ts`:
  - [ ] State: `currentMapMode, selectedProvinceId, selectedNationId, selectedCharacterId, openDrawer, openDialog, activeEventDialog, showLedger, ledgerTab, cameraCenter, cameraZoom`
  - [ ] Actions: `setMapMode, setSelectedProvince, setSelectedNation, openDrawer, closeDrawer, setCamera, etc.`
  - [ ] No `snapshot/hydrate` — UI state not persisted
- [ ] `/src/stores/index.ts` re-exports both stores
- [ ] `npm run typecheck` passes

### Files affected

- `/src/stores/worldStore.ts`
- `/src/stores/uiStore.ts`
- `/src/stores/index.ts`

### Test requirements

- `tests/stores/worldStore.test.ts`:
  - `advanceMonth` increments month, rolls year correctly
  - `setSpeed(0)` sets isPaused implicitly or explicitly
  - `setFlag` stores arbitrary values
  - `snapshot()` returns serializable state
  - `hydrate(state)` restores state correctly
- `tests/stores/uiStore.test.ts`:
  - `setSelectedProvince` updates state
  - `openDrawer / closeDrawer` toggle state
  - Camera state updates correctly

### Notes

- Use the TECH.md Section 7 template literally — same structure as future stores
- `flags` field is a `Record<string, any>` for game-wide state we don't want to model in dedicated stores yet (research flags, completed event chains, etc.)

---

## Issue #7: Implement provinceStore, nationStore, dynastyStore

**Labels:** `v0.1`, `store`
**Effort:** M
**Dependencies:** #6

### Description

The three biggest entity stores. Provinces, nations, and characters are the core simulation entities. Implement normalized state (everything by ID), basic indices for fast lookup, and standard actions.

### Acceptance criteria

- [ ] `/src/stores/provinceStore.ts`:
  - [ ] State: `provinces: Record<ProvinceId, Province>`, indices: `provincesByNation, provincesByRegion, provincesByCulture, provincesByReligion`
  - [ ] Actions: `setProvince, updateProvince(id, patch), bulkSet(provinces), updateOwnership(id, nationId), updateOccupation(id, nationId | null), addBuilding(id, buildingId), removeBuilding(id, buildingId)`
  - [ ] Indices auto-rebuild on relevant changes (e.g., `provincesByNation` updates when ownership changes)
  - [ ] `snapshot/hydrate`
- [ ] `/src/stores/nationStore.ts`:
  - [ ] State: `nations: Record<NationId, Nation>`
  - [ ] Actions: `setNation, updateNation, updateTreasury(id, delta), updateManpower(id, delta), updatePrestige(id, delta), setRuler(id, charId), setArchetype(id, archetypeId), addAmbition, completeAmbition`
  - [ ] `snapshot/hydrate`
- [ ] `/src/stores/dynastyStore.ts`:
  - [ ] State: `characters: Record<CharacterId, Character>`, `dynasties: Record<EntityId, Dynasty>` (Dynasty type can be minimal: `{ id, name, foundingDate, foundingCharacterId }`)
  - [ ] Indices: `charactersByNation, charactersByDynasty, livingCharacters`
  - [ ] Actions: `setCharacter, killCharacter(id, date), marryCharacters(idA, idB), assignCourtRole(charId, role), giveTrait(charId, traitId)`
  - [ ] `snapshot/hydrate`
- [ ] `npm run typecheck` passes

### Files affected

- `/src/stores/provinceStore.ts`
- `/src/stores/nationStore.ts`
- `/src/stores/dynastyStore.ts`
- `/src/stores/index.ts` (update re-exports)

### Test requirements

- `tests/stores/provinceStore.test.ts`:
  - `setProvince` adds province, index updates correctly
  - `updateOwnership` moves province from one nation's index to another
  - `bulkSet` replaces all provinces
- `tests/stores/nationStore.test.ts`:
  - `updateTreasury(id, +100)` adds to current
  - `setRuler` updates ruler reference
- `tests/stores/dynastyStore.test.ts`:
  - `killCharacter` sets deathDate, updates `livingCharacters` index
  - `marryCharacters` updates both characters' family.spouseId

### Notes

- Indices are rebuilt incrementally in actions, not from-scratch — important for perf
- A `Dynasty` type can be created here (minimal definition) since it's not in Issue #3
- For v0.1, ignore the more complex stores (`economyStore`, `militaryStore`, etc.) — those wait for later issues

---

## Issue #8: Implement minimal stub stores for v0.1 needs (military, diplomacy, event queue)

**Labels:** `v0.1`, `store`
**Effort:** S
**Dependencies:** #7

### Description

v0.1 needs minimal versions of `militaryStore`, `diplomacyStore`, and `eventQueueStore` to support the basic war loop. Full versions wait for v0.2-v0.3, but we need enough to track armies, opinion, and queued ruler-death events.

### Acceptance criteria

- [ ] `/src/stores/militaryStore.ts`:
  - [ ] State: `armies: Record<ArmyId, Army>`, `wars: Record<EntityId, War>`, `battles: Record<BattleId, Battle>`
  - [ ] Indices: `armiesByNation, armiesByProvince`
  - [ ] Actions: `createArmy, moveArmy(id, targetProvinceId), disbandArmy, startBattle, resolveBattle (placeholder), declareWar, endWar`
  - [ ] Ignore navies, sieges for v0.1
- [ ] `/src/stores/diplomacyStore.ts`:
  - [ ] State: `opinions: Record<NationId, Record<NationId, OpinionEntry>>`, `treaties: Record<EntityId, Treaty>`
  - [ ] Actions: `setOpinion(from, to, value), addOpinionModifier, signTreaty, breakTreaty`
- [ ] `/src/stores/eventQueueStore.ts`:
  - [ ] State: `pending: QueuedEvent[]`, `scheduled: Record<string, GameDate>`, `recentlyFired: string[]`
  - [ ] Actions: `queueEvent, dequeueEvent, scheduleEvent, fireScheduled, dismissEvent`
  - [ ] `recentlyFired` is a ring buffer capped at 100 entries
- [ ] `npm run typecheck` passes

### Files affected

- `/src/stores/militaryStore.ts`
- `/src/stores/diplomacyStore.ts`
- `/src/stores/eventQueueStore.ts`
- `/src/stores/index.ts`

### Test requirements

- `tests/stores/militaryStore.test.ts` — army creation, movement, war declaration
- `tests/stores/diplomacyStore.test.ts` — opinion get/set, treaty lifecycle
- `tests/stores/eventQueueStore.test.ts` — queue/dequeue, ring buffer doesn't grow past 100

### Notes

- The remaining stores (`economyStore`, `religionStore`, `politicsStore`, `techStore`, `ideologyStore`) don't need v0.1 stubs — their concerns aren't in v0.1 scope
- Keep these minimal — full feature implementations come in v0.2-v0.3

---

## Issue #9: Hand-author ~50 Western European provinces (data files)

**Labels:** `v0.1`, `content`
**Effort:** L
**Dependencies:** #3

### Description

Create the v0.1 starting map: roughly 50 provinces covering France, England, the Low Countries, Holy Roman Empire (just the western edge — Lotharingia, Burgundy), Italy (Lombardy, Tuscany, Papal States, Sicily border), Iberia (Castile, Aragon, Portugal). Hand-author the JSON for each.

Use simple hand-drawn SVG paths for province boundaries — they don't need to be historically accurate at the geographic level for v0.1. Aim for "looks like a map" not "accurate to the meter."

### Acceptance criteria

- [ ] ~50 province JSON files in `/src/data/provinces/`, OR one consolidated `provinces.json` array
- [ ] Each province has all required fields per `Province` interface (Issue #3):
  - id, name, position, pathData, adjacencies, regionId, terrain, climate
  - development {tax, production, manpower}
  - population, cultureId, religionId
  - controllerId (initial nation owner), occupierId: null
  - tradeGoodId (one of ~10 common goods for v0.1: grain, wine, wool, iron, salt, fish, wood, cloth, livestock, stone)
  - buildings: []
  - fortificationLevel: 0-2
  - estateOwnership: defaults from nation's government template
  - unrest: 0
  - manpowerPool: { current, max, regenRate }
- [ ] All provinces' `adjacencies` arrays are bidirectional (if A→B, then B→A)
- [ ] Coastal provinces marked `isCoastal: true` with `navalCapacity > 0`
- [ ] SVG path data uses a consistent coordinate space (e.g., 1000x800 viewBox)
- [ ] Provinces visually fit together when rendered (no gaps, minimal overlap)
- [ ] Zod schema in `/src/data/schemas/province.ts` validates all province files
- [ ] `npm run validate-content` passes (scripts/validateContent.ts — implemented in next issue)

### Files affected

- `/src/data/provinces/*.json` (or one consolidated file)
- `/src/data/schemas/province.ts` — Zod schema

### Test requirements

- A loader test that loads all province files and validates them against the Zod schema
- Adjacency-symmetry test: for each province, verify all neighbors list it back

### Notes

- **Province name suggestions** (~50 total):
  - **France/England area:** Île-de-France, Normandy, Anjou, Aquitaine, Toulouse, Provence, Burgundy, Champagne, Flanders, Brittany; Wessex, Mercia, Northumbria, Wales (East/West), Cornwall, Yorkshire
  - **Iberia:** León, Castile, Navarre, Aragon, Catalonia, Portugal, Galicia, Andalusia (Muslim-held at 1200), Valencia (Muslim-held)
  - **Italy:** Lombardy, Tuscany, Lazio (Papal), Naples, Sicily, Venice, Genoa, Piedmont
  - **HRE western:** Lotharingia, Swabia, Bavaria, Saxony, Frisia
  - **Filler:** ~5 minor provinces for connectivity
- For hand-drawing SVG paths, consider using a tool like SVG-edit or drawing in Figma → exporting SVG path data
- Trade goods at v0.1: just pick from grain/wine/wool/iron/salt/fish/wood/cloth/livestock/stone per province
- Cultures at v0.1: `frankish, occitan, norman, anglo_saxon, welsh, irish_gaelic, castilian, catalan, portuguese, italian, lombard, sicilian, german, dutch`
- Religions at v0.1: `catholic, sunni` (for Granada/Andalusia)

---

## Issue #10: Hand-author ~10 starting nations (data files)

**Labels:** `v0.1`, `content`
**Effort:** M
**Dependencies:** #9

### Description

Define the ~10 playable nations of v0.1: France, England, Holy Roman Empire (just the western chunk), Kingdom of Castile, Kingdom of Aragon, Kingdom of Portugal, Papal States, Republic of Venice, Republic of Genoa, Kingdom of Sicily. Plus their starting state.

### Acceptance criteria

- [ ] 10 nation JSON files in `/src/data/nations/`
- [ ] Each nation has all required fields per `Nation` interface:
  - id, name, tag (3-letter code), cultureId, primaryReligionId, governmentType, archetypeId, flagColor
  - rulerId (will point to character authored in Issue #11)
  - dynastyId
  - successionLaw
  - treasury (starting amount, e.g., 100-300 gold)
  - manpower, maxManpower
  - prestige (0)
  - legitimacy (100)
  - techLevels: zeroed for v0.1
  - embracedInstitutions: ["feudalism"]
  - ideologyVector: hand-authored per DESIGN.md Section 12 examples (France, Venice, etc.)
  - ambitions: 1-2 starting ambitions per nation
  - rivals: e.g., France ↔ England, Venice ↔ Genoa, Castile ↔ Aragon
  - interests: regional list
  - honor: 50, diplomaticReputation: 0, aggressiveExpansion: 0, threat: 0
  - stability: 50, religiousUnity: 90, culturalUnity: 80, toleranceScore: 30
  - greatPowerRank: null
  - activeEstateIds: per template (e.g., feudal: nobility, clergy, burghers, peasants)
  - cachedIncome/Expenses: zeros, refreshed first tick
- [ ] Zod schema in `/src/data/schemas/nation.ts`
- [ ] Validation passes via `npm run validate-content`
- [ ] All nations' starting `controllerId` on the provinces from Issue #9 are consistent — every v0.1 province has an owner

### Files affected

- `/src/data/nations/*.json`
- `/src/data/schemas/nation.ts`

### Test requirements

- Loader test: all nations validate against schema
- Cross-validation test: every province from Issue #9 has a `controllerId` that points to a valid nation

### Notes

- **Recommended nations and their tags:**
  - `FRA` Kingdom of France — Feudal Kingdom, French culture, Catholic, Philip II Augustus
  - `ENG` Kingdom of England — Feudal Kingdom, Norman/Anglo culture (Norman elite, Anglo-Saxon subject pop), Catholic, John
  - `HRE` Holy Roman Empire — Feudal Kingdom (with Imperial Reclamation CB), German culture, Catholic, Frederick II (child, regency)
  - `CAS` Kingdom of Castile — Feudal Kingdom, Castilian culture, Catholic, Alfonso VIII
  - `ARA` Crown of Aragon — Feudal Kingdom, Catalan culture, Catholic, Peter II
  - `POR` Kingdom of Portugal — Feudal Kingdom, Portuguese culture, Catholic, Sancho I
  - `PAP` Papal States — Theocracy, Italian culture, Catholic, ruler = Innocent III himself
  - `VEN` Republic of Venice — Merchant Republic, Italian (Venetian) culture, Catholic, Doge Enrico Dandolo
  - `GEN` Republic of Genoa — Merchant Republic, Italian (Genoese) culture, Catholic, Doge (procedural)
  - `SIC` Kingdom of Sicily — Feudal Kingdom, Sicilian culture, Catholic, Frederick II (also young king of Sicily, regency)

- Flag colors should be visually distinct on the map — pick a 10-color palette

---

## Issue #11: Hand-author ~20 starting characters (data files)

**Labels:** `v0.1`, `content`
**Effort:** M
**Dependencies:** #10

### Description

Create the ~20 historical characters for v0.1 — the 10 rulers plus their spouses and 1-2 children each. These are real people from 1200. Use Wikipedia for stat estimates and trait choices.

### Acceptance criteria

- [ ] ~20 character JSON files in `/src/data/characters/`
- [ ] Each character has all required fields per `Character` interface:
  - id (e.g., `char_philip_ii_augustus`)
  - dynastyId, cultureId, religionId
  - givenName, dynastyName, optional nickname
  - birthDate, deathDate (null if alive at 1200)
  - gender
  - stats: 0-25 for each of 6 stats, hand-picked
  - statsHiddenUntilAge: 16
  - traits: 3-5 traits with `source: 'born'` (or 'inherited' if appropriate)
  - health: { current: 90-100, max: 100, conditions: [], plotArmor: true with expires-date matching historical death window for rulers }
  - fertility: { base: 1.0, modifiers: 0, sterile: false }
  - family: father/mother/spouse/children/siblings IDs (cross-referenced — characters reference each other)
  - geneticPool: commonAncestorIds: [], consanguinityScore: 0 (for v0.1; later versions calculate)
  - position: title (e.g., "King of France"), courtRole: null, fieldRole: null, locationProvinceId, nationId
  - heldClaimNationIds, heldClaimProvinceIds, inheritanceClaimNationIds: per historical context
  - prestige: hand-picked baseline
  - pietyScore
  - plotsInvolvedIn: []
  - educationFocus, educationComplete: true (these are adults)
  - tutorId: null
  - regentForId, isRegent: false (except where applicable — see Frederick II)
- [ ] Cross-references valid — every `spouseId`, `childId`, etc. points to a real character in the dataset
- [ ] Zod schema in `/src/data/schemas/character.ts`
- [ ] Validation passes

### Files affected

- `/src/data/characters/*.json`
- `/src/data/schemas/character.ts`
- `/src/data/dynasties/*.json` (small — dynasty entities for Capetian, Plantagenet, Hauteville, etc.)
- `/src/data/schemas/dynasty.ts`

### Test requirements

- Character cross-reference test: all family ID references resolve to valid characters
- Schema validation test

### Notes

**v0.1 character roster suggestions:**

**French royal family (Capetian dynasty):**
- Philip II Augustus (35, ruler) — Dip 18, Stew 15, Mar 14, Int 16, Lea 10, Pie 8; Patient, Cunning, Just
- Ingeborg of Denmark (spouse, estranged at 1200)
- Louis (13, heir, future Louis VIII)

**English royal family (Plantagenet/Angevin dynasty):**
- John (33, ruler) — Dip 7, Stew 12, Mar 9, Int 14, Lea 11, Pie 6; Wroth, Greedy, Suspicious
- Isabella of Angoulême (spouse, will marry in 1200 — possible flag)
- Henry (would be young son later — Henry III)

**Castilian royal family (House of Burgundy/Ivrea):**
- Alfonso VIII (45, ruler) — Dip 14, Stew 13, Mar 17, Int 10, Lea 14, Pie 13; Reformer, Just, Brave
- Eleanor of England (spouse, Henry II's daughter)
- Berengaria, Urraca, etc. (daughters)

**Aragonese royal family:**
- Peter II (24, ruler) — Dip 13, Stew 11, Mar 16, Int 9, Lea 9, Pie 11; Brave, Ambitious

**Portuguese royal family:**
- Sancho I (45, ruler) — Dip 10, Stew 14, Mar 14, Int 8, Lea 12, Pie 13; Diligent, Just

**HRE (Hohenstaufen dynasty):**
- Frederick II (6 years old at 1200, regent: ...) — Dip 22, Stew 18, Mar 13, Int 17, Lea 25 (Genius!), Pie 4 (Cynical); Genius, Cynic, Scholar, Wroth — high plot armor through his historical reign
- Constance of Sicily (queen mother regent, will die 1198 historically — adjust)

**Sicilian:** same Frederick II (he was also King of Sicily)

**Papal States:**
- Innocent III (40, ruler/Pope) — Dip 19, Stew 16, Mar 7, Int 14, Lea 18, Pie 20; Patient, Just, Zealous, Reformer

**Venetian:**
- Enrico Dandolo (90+, Doge — historically old) — Dip 23, Stew 19, Mar 11, Int 22, Lea 19, Pie 10; Brilliant Strategist, Cunning, Patient, Sociable

Plus 2-3 children/relatives per ruler to populate succession.

**Plot armor expiry dates** (so they can't die randomly before history):
- Philip II Augustus: until 1223
- John of England: until 1216
- Alfonso VIII: until 1214
- Peter II: until 1213 (died at Battle of Muret)
- Sancho I: until 1211
- Innocent III: until 1216
- Frederick II: until 1250 (long historical reign — significant armor)
- Enrico Dandolo: until 1205

---

## Issue #12: Build content loader that hydrates stores from /src/data at startup

**Labels:** `v0.1`, `engine`
**Effort:** M
**Dependencies:** #8, #11

### Description

When the game starts (or a "new campaign" is initiated), load all `/src/data` JSON files, validate against Zod schemas, and bulk-set the appropriate stores. This is the bridge between content (data files) and runtime state (stores).

Also build the `scripts/validateContent.ts` standalone tool for CLI validation outside of runtime.

### Acceptance criteria

- [ ] `/src/persistence/loadCampaign.ts` exports `startNewCampaign({ playerNationTag, seed }: { playerNationTag: string; seed?: string })`
- [ ] On call:
  - [ ] Validates all content with Zod (fails loudly in dev, warns in prod)
  - [ ] Bulk-sets provinces in provinceStore
  - [ ] Bulk-sets nations in nationStore
  - [ ] Bulk-sets characters in dynastyStore
  - [ ] Initializes worldStore (date 1200/1/1, speed 0/paused, player nation set, seed)
  - [ ] Initializes ideologyStore vectors from nation data
  - [ ] Initializes diplomacyStore opinions (zero baseline for now)
  - [ ] Resets eventQueueStore to empty
- [ ] `/scripts/validateContent.ts` CLI script:
  - [ ] Loads all data files
  - [ ] Validates with Zod
  - [ ] Prints errors with file path
  - [ ] Exits 0 if all pass, 1 if any fail
- [ ] `package.json` script: `"validate-content": "tsx scripts/validateContent.ts"`
- [ ] `npm run validate-content` passes for all v0.1 content

### Files affected

- `/src/persistence/loadCampaign.ts`
- `/src/persistence/contentLoader.ts` (helper)
- `/scripts/validateContent.ts`
- `/package.json` (add script)

### Test requirements

- `tests/integration/loadCampaign.test.ts`:
  - Start campaign with seed and player nation
  - Verify provinceStore has all expected provinces
  - Verify nationStore has all nations
  - Verify dynastyStore has all characters
  - Verify worldStore has correct date and seed
  - Verify cross-references resolve (rulerId in nation → exists in dynasty)

### Notes

- In Next.js, `/src/data/*.json` files can be imported directly as JSON modules. Either approach works:
  - **Static import** (simpler): `import provincesData from '@/data/provinces/index.json'` — load all from one file
  - **Glob import** (more flexible): `import.meta.glob('/src/data/provinces/*.json', { eager: true })` for many files
- For v0.1, recommend consolidated single-file approach per content type for simplicity
- Add `tsx` dev dependency for the CLI script

---

## Issue #13: Build the basic SVG WorldMap component with political map mode

**Labels:** `v0.1`, `ui`
**Effort:** M
**Dependencies:** #12

### Description

Build the SVG map that renders all provinces as `<path>` elements, colored by their owner's flag color (political map mode). Provinces are clickable. Use React.memo + Zustand selectors for performance.

### Acceptance criteria

- [ ] `/src/components/map/WorldMap.tsx` renders an `<svg>` with all provinces as `<path>` elements
- [ ] `/src/components/map/Province.tsx` is a memoized component for one province
- [ ] Provinces colored by owner's flag color (read from nationStore)
- [ ] Stroke between provinces (visible borders)
- [ ] Tapping a province sets `uiStore.selectedProvinceId`
- [ ] Selected province has visible highlight (thicker stroke or color overlay)
- [ ] Map fills the screen below the HUD bar
- [ ] No hover states (touch-first)
- [ ] Component does NOT re-render on every store change — only re-renders affected provinces when their data changes
- [ ] `npm run typecheck` passes

### Files affected

- `/src/components/map/WorldMap.tsx`
- `/src/components/map/Province.tsx`
- `/src/hooks/useProvinceColor.ts`
- `/app/play/page.tsx` (uses WorldMap)

### Test requirements

- `tests/components/Province.test.tsx`:
  - Renders the correct fill color based on owner
  - Tapping calls `setSelectedProvince`
  - Memoization: changing an unrelated province doesn't re-render this one (verify via render-count assertion)

### Notes

- Use the React `memo` wrapper around Province
- Selectors should be specific — `useProvinceStore(s => s.provinces[id].pathData)` not `useProvinceStore(s => s)`
- Don't use SVG filters or gradients in v0.1 — they're expensive on iPad
- Add a fallback color (`#888`) for provinces with no owner

---

## Issue #14: Implement map pan and pinch-zoom gestures

**Labels:** `v0.1`, `ui`
**Effort:** M
**Dependencies:** #13

### Description

Make the SVG map respond to iPad gestures: single-finger pan, two-finger pinch-zoom. Update the SVG viewBox based on camera state in uiStore. Must feel smooth on iPad Safari.

### Acceptance criteria

- [ ] `/src/hooks/useMapGestures.ts` exports a hook that attaches touch event listeners to the SVG element
- [ ] One-finger drag pans the map
- [ ] Two-finger pinch zooms in/out, centered between fingers
- [ ] Camera state stored in uiStore (`cameraCenter`, `cameraZoom`)
- [ ] Pan limits: can't pan map entirely off-screen
- [ ] Zoom limits: minimum 0.5x, maximum 5x
- [ ] Tapping (not dragging) still triggers province selection — distinguish via touch movement threshold (e.g., <10px = tap, >10px = drag)
- [ ] No bounce or scrolling artifacts on iPad
- [ ] Works in iPad Safari + Chrome devtools touch emulation

### Files affected

- `/src/hooks/useMapGestures.ts`
- `/src/components/map/WorldMap.tsx` (use the hook)
- `/src/lib/geometry.ts` (add `touchDistance` helper)

### Test requirements

- Unit tests for gesture math:
  - `touchDistance` returns correct distance for two points
  - Pan math correctly translates camera
  - Pinch math correctly scales camera, anchored at midpoint
- Manual iPad testing required (no automation for touch gestures)

### Notes

- Use `passive: false` on touch event listeners so we can call `preventDefault` to block iPad scrolling
- Set CSS `touch-action: none` on the SVG element
- Reference TECH.md Section 10 for the gesture handler skeleton
- Consider adding a "Reset view" button in the HUD for accidentally-zoomed-out cases

---

## Issue #15: Add HUD top bar (date, speed controls, player resources)

**Labels:** `v0.1`, `ui`
**Effort:** M
**Dependencies:** #14

### Description

Build the persistent HUD: top bar showing current in-game date, game speed controls (0-5), and player nation's treasury, manpower, prestige. This is always visible and is the primary control surface for the player.

### Acceptance criteria

- [ ] `/src/components/hud/TopBar.tsx` renders:
  - Current in-game date formatted (e.g., "March 1230")
  - Speed controls: 5 buttons for speeds 1-5 + a pause/play toggle
  - Current player nation's treasury, manpower, prestige
  - Tappable nation banner (opens nation drawer — drawer comes in Issue #20)
- [ ] Speed buttons highlight the active speed
- [ ] Pause/play toggle correctly stops/resumes the tick loop
- [ ] All tappable elements meet 44pt minimum tap target
- [ ] Updates reactively when state changes
- [ ] `npm run typecheck` passes

### Files affected

- `/src/components/hud/TopBar.tsx`
- `/src/components/hud/SpeedControls.tsx`
- `/src/components/hud/ResourceDisplay.tsx`
- `/app/play/page.tsx` (uses TopBar)

### Test requirements

- `tests/components/TopBar.test.tsx`:
  - Renders current date
  - Tapping speed button updates worldStore
  - Pause toggle updates `isPaused`
  - Resource display updates when player nation's treasury changes

### Notes

- Use Tailwind for styling — keep it minimal for v0.1
- Place at the very top of the screen, fixed positioning
- Background should be semi-opaque so map is partially visible behind it
- Speed 0 = paused (or use the pause button separately — either pattern works)

---

## Issue #16: Implement the tick loop hook and tickEngine skeleton

**Labels:** `v0.1`, `engine`
**Effort:** S
**Dependencies:** #15

### Description

Wire up the heartbeat. `useTickLoop` hook fires `runMonthlyTick()` on an interval determined by `speedSetting`. The engine skeleton orchestrates calls to each subsystem's tick — empty for v0.1, filled in subsequent issues.

### Acceptance criteria

- [ ] `/src/hooks/useTickLoop.ts` exports `useTickLoop()` hook
- [ ] Hook reads `speedSetting` and `isPaused` from worldStore
- [ ] On speed change, restarts the interval at the appropriate ms
- [ ] On pause, stops the interval
- [ ] `/src/engine/tickEngine.ts` exports `runMonthlyTick()`
- [ ] `runMonthlyTick()`:
  - Calls subsystem tick stubs in order (economyTick, militaryTick, etc.)
  - Calls `worldStore.advanceMonth()` at the end
  - Calls `checkPauseConditions()` after time advance
- [ ] Subsystem tick functions exist as empty stubs (logs only)
- [ ] Hook mounted in `/app/play/page.tsx`
- [ ] Date in HUD advances when not paused

### Files affected

- `/src/hooks/useTickLoop.ts`
- `/src/engine/tickEngine.ts`
- `/src/engine/economy/tick.ts` (stub)
- `/src/engine/military/tick.ts` (stub)
- `/src/engine/diplomacy/tick.ts` (stub)
- `/src/engine/dynasty/tick.ts` (stub)
- `/app/play/page.tsx`

### Test requirements

- `tests/engine/tickEngine.test.ts`:
  - Calling `runMonthlyTick` advances `currentDate` by one month
  - Subsystem ticks called in order

### Notes

- The hook uses `setInterval`. Clean up on speed change / unmount via the `useEffect` return function
- For testing, expose a synchronous `runMonthlyTick` rather than only running on interval — tests call it directly N times
- Speed ms values from TECH.md Section 8: speed 1 = 2000ms, 5 = 100ms

---

## Issue #17: Implement minimal economyTick (province tax income + manpower regen)

**Labels:** `v0.1`, `engine`
**Effort:** M
**Dependencies:** #16

### Description

The smallest economy worth shipping for v0.1: each month, each nation collects tax from its provinces, regenerates manpower in each province, and updates treasury and manpower totals. No trade nodes, no buildings, no estate cuts — those wait for v0.2+.

### Acceptance criteria

- [ ] `/src/engine/economy/tick.ts` exports `economyTick()`
- [ ] On call, for each nation:
  - [ ] Sum tax income from owned provinces (simple formula: province.development.tax × 1.0 gold/month)
  - [ ] Add to nation's treasury via nationStore.updateTreasury
  - [ ] For each owned province, regenerate manpower: `province.manpowerPool.current += province.manpowerPool.regenRate`, capped at max
  - [ ] Sum nation's total manpower from province pools
  - [ ] Set nation.maxManpower and nation.manpower
- [ ] Skipped for occupied provinces (no income from occupied territory)
- [ ] Updates cached fields on nation (`cachedIncome.tax`, `cachedIncome.total`)

### Files affected

- `/src/engine/economy/tick.ts`
- `/src/engine/economy/income.ts`
- `/src/engine/economy/manpower.ts`

### Test requirements

- `tests/engine/economy/tick.test.ts`:
  - Treasury increases by expected amount each month
  - Manpower regenerates in provinces
  - Manpower caps at province max
  - Occupied provinces don't contribute income
- `tests/integration/economyMonth.test.ts`:
  - Set up France 1200 with all owned provinces
  - Run 1 tick
  - Assert treasury increased by expected total
  - Assert manpower regenerated

### Notes

- Formula simplifications for v0.1: `incomePerProvince = province.development.tax * 1.0`. Real formula with estate cuts, buildings, etc. comes in v0.2
- Manpower regenRate baseline: 0.05 × manpowerPool.max per month (so manpower fully refills in ~20 months)

---

## Issue #18: Implement minimal dynastyTick (aging, mortality, succession)

**Labels:** `v0.1`, `engine`
**Effort:** L
**Dependencies:** #17

### Description

Characters age. Sometimes they die. When a ruler dies, succession resolves and the next ruler takes the throne. This is the core "your ruler matters" loop and the simplest version of all dynasty mechanics.

### Acceptance criteria

- [ ] `/src/engine/dynasty/tick.ts` exports `dynastyTick()`
- [ ] On call, for each living character:
  - [ ] Age in months (compare birthDate to currentDate)
  - [ ] If health below 25, character bedridden — handle next tick
  - [ ] Health drain with age (linear after age 40, accelerating after 55) — small drain per month
  - [ ] Mortality roll using `rng.mortality`:
    - Base mortality probability by age (from TECH.md: ~50 year average lifespan baseline)
    - Multiplied by health (low health = higher death chance)
    - Plot armor check: if character has `plotArmor: true` and `plotArmorExpires` is after currentDate, skip mortality roll
  - [ ] If death rolls: call `dynastyStore.killCharacter(id, currentDate)`
- [ ] When a character with the role of ruler dies:
  - [ ] Fire ruler-death event (queued to event queue)
  - [ ] Pause the game (call `worldStore.pauseWithReasons`)
  - [ ] Resolve succession:
    - For v0.1: simple primogeniture — eldest legitimate son (or eldest legitimate child if absolute primogeniture)
    - If no eligible heir, mark nation as "succession crisis" (flag for later, doesn't break game)
  - [ ] Update `nation.rulerId` to new heir
  - [ ] Fire succession event with new ruler info

### Files affected

- `/src/engine/dynasty/tick.ts`
- `/src/engine/dynasty/aging.ts`
- `/src/engine/dynasty/mortality.ts`
- `/src/engine/dynasty/succession.ts`
- `/src/engine/orchestrator.ts` (the pause-and-update orchestration for ruler death)

### Test requirements

- `tests/engine/dynasty/mortality.test.ts`:
  - 80-year-old with normal health has very high death chance per year
  - 30-year-old with healthy stats has very low death chance per year
  - Plot-armored character with future expires date never dies in mortality roll
  - Distribution test: 1000 simulated 50-year-old characters over 10 years should produce realistic death rates
- `tests/engine/dynasty/succession.test.ts`:
  - Ruler with 1 son → son inherits
  - Ruler with no legitimate children → succession crisis flag set
  - Ruler with 1 son + 1 daughter under Salic Primogeniture → son inherits even if daughter older
  - Ruler with 1 son + 1 daughter under Absolute Primogeniture → eldest inherits regardless

### Notes

- This is the largest v0.1 ticket. Take your time.
- Mortality formula reference (TECH.md doesn't spec — use this baseline):
  ```
  monthlyMortalityRate(age, health) =
    baseRate(age) * (100 - health) / 100
  baseRate(age):
    age < 30: 0.0005   (0.06%/year)
    age < 40: 0.001
    age < 50: 0.002
    age < 60: 0.004
    age < 70: 0.008
    age < 80: 0.020
    age >= 80: 0.040
  ```
- The succession resolution logic just picks the heir; the orchestrator pauses + fires the event + updates state atomically across stores

---

## Issue #19: Implement minimal militaryTick (army movement, abstracted combat)

**Labels:** `v0.1`, `engine`
**Effort:** L
**Dependencies:** #18

### Description

Armies that have a movement target advance toward it. When two armies of opposing nations occupy the same province, resolve combat using the abstracted formula. No combat width, no terrain modifiers, no general traits for v0.1 — just numbers vs numbers + a small RNG factor. Real combat depth comes in v0.2+.

### Acceptance criteria

- [ ] `/src/engine/military/tick.ts` exports `militaryTick()`
- [ ] On call:
  - [ ] For each army with a `movementTarget`:
    - [ ] Advance `movementProgress` by 1 / (movement_time_in_months)
    - [ ] Movement time depends on terrain (basic: 1 month per province jump for plains, 2 for hills/forest, 3 for mountains)
    - [ ] When movementProgress >= 1.0, arrive at target: update `provinceId`, clear `movementTarget`
  - [ ] For each province with armies of opposing nations (at war or hostile):
    - [ ] Initiate battle (start a Battle entity)
    - [ ] Resolve battle immediately for v0.1 (no multi-month combat)
    - [ ] Calculate effectiveness: `numbers * (1 + RNG ± 0.1)` for each side
    - [ ] Higher effectiveness wins
    - [ ] Loser takes 30% casualties, winner takes 15% casualties (round numbers for v0.1)
    - [ ] Loser retreats to a friendly adjacent province
    - [ ] Winner takes control of province (sets `occupierId`)
    - [ ] Update manpower pools: subtract casualties from each nation's manpower

### Files affected

- `/src/engine/military/tick.ts`
- `/src/engine/military/movement.ts`
- `/src/engine/military/combat.ts`
- `/src/engine/orchestrator.ts` (add `resolveBattle` orchestrator)

### Test requirements

- `tests/engine/military/movement.test.ts`:
  - Army moves 1 province per month on plains
  - Army arrives at target after expected months
- `tests/engine/military/combat.test.ts`:
  - Larger army usually wins (test across many RNG seeds)
  - Casualties applied correctly
  - Loser retreats (or is destroyed if no retreat path)
  - Winner takes province occupation
- `tests/integration/warOutcome.test.ts`:
  - Start 1200 France, declare war on England
  - Move French army into English province
  - Resolve battle
  - Verify casualties + occupation

### Notes

- Combat resolution for v0.1 is intentionally simple. The full combat-width / terrain / general formula from DESIGN.md gets implemented in v0.2.
- If loser has no friendly adjacent province to retreat to, army is destroyed (full casualties)
- The `resolveBattle` orchestrator in `/src/engine/orchestrator.ts` handles multi-store writes per TECH.md Section 4

---

## Issue #20: Add Province and Nation drawers (basic UI)

**Labels:** `v0.1`, `ui`
**Effort:** M
**Dependencies:** #19

### Description

Tapping a province opens a slide-up drawer with province details. Tapping the player nation banner in the HUD opens the nation drawer. These are the primary "inspect entity" UIs for v0.1.

### Acceptance criteria

- [ ] `/src/components/drawers/ProvinceDrawer.tsx`:
  - Shows when `uiStore.openDrawer === 'province'`
  - Displays: province name, owner, culture, religion, development (tax/production/manpower), trade good, terrain, buildings, manpower pool
  - Close button or swipe-down to dismiss
- [ ] `/src/components/drawers/NationDrawer.tsx`:
  - Shows when `uiStore.openDrawer === 'nation'`
  - Displays: nation name, government type, archetype, current ruler (name + title), stats summary (Diplomacy etc. from ruler), treasury, manpower, prestige, ideology vector (as text for v0.1 — radar chart in v0.2)
  - Close button
- [ ] Drawers slide up from bottom on mobile/tablet, panel from right on desktop (use Tailwind responsive)
- [ ] Tapping outside drawer dismisses it (overlay backdrop)
- [ ] Tap targets meet 44pt minimum
- [ ] `npm run typecheck` passes

### Files affected

- `/src/components/drawers/ProvinceDrawer.tsx`
- `/src/components/drawers/NationDrawer.tsx`
- `/src/components/drawers/DrawerContainer.tsx` (shared slide animation logic)
- `/src/components/shared/Backdrop.tsx`
- `/app/play/page.tsx` (mount drawers)

### Test requirements

- `tests/components/ProvinceDrawer.test.tsx`:
  - Renders province data when open
  - Doesn't render when closed
  - Close button triggers `uiStore.closeDrawer`
- Manual test: tap a province on iPad → drawer opens

### Notes

- Use CSS `transform: translateY` for the slide animation (cheap on GPU)
- Drawer should not block the entire map — half-screen height is fine
- Use `aria-modal` for accessibility (even though touch-first, screen readers should work)

---

## Issue #21: Add "Declare War" button and basic war declaration flow

**Labels:** `v0.1`, `ui`, `engine`
**Effort:** M
**Dependencies:** #20

### Description

The player must be able to actually start a war. Add a "Declare War" button to the Nation drawer (when viewing a foreign nation). On tap, prompt for CB (or auto-select conquest for v0.1), then create the War entity, set opinions to hostile, queue the war declaration event for AI nation.

### Acceptance criteria

- [ ] When player taps a province NOT owned by player nation, opening NationDrawer shows the foreign nation
- [ ] Foreign NationDrawer has "Declare War" button (only enabled if no existing war between player and target)
- [ ] Tap button → confirm dialog
- [ ] On confirm:
  - [ ] `militaryStore.declareWar(playerNationId, targetNationId, casusBelli: 'conquest')`
  - [ ] Update `diplomacyStore` opinions: both nations' opinions of each other drop -50
  - [ ] Queue a war-declaration event (descriptive)
- [ ] AI response: the AI nation accepts the war (no peace negotiations in v0.1)
- [ ] War appears in some UI indicator (e.g., red border on the foreign nation in NationDrawer)

### Files affected

- `/src/components/drawers/NationDrawer.tsx` (add War button)
- `/src/components/dialogs/DeclareWarDialog.tsx`
- `/src/engine/orchestrator.ts` (add `declareWar` orchestrator)
- `/src/engine/diplomacy/opinions.ts`

### Test requirements

- `tests/engine/diplomacy/declareWar.test.ts`:
  - Declaring war creates War entity in militaryStore
  - Opinion modifiers added in both directions
  - War declaration event queued
- Manual test: select foreign nation → declare war → see war state

### Notes

- For v0.1, only "Conquest" CB is available. Pick a province as the war goal (the one the player tapped to open the drawer, or just generic "Conquest of X")
- No prestige cost for declaring war for v0.1 — that's v0.2 polish
- AI doesn't initiate wars in v0.1 — only player can declare

---

## Issue #22: Implement raise army UI + basic army movement

**Labels:** `v0.1`, `ui`, `engine`
**Effort:** M
**Dependencies:** #21

### Description

Player needs to actually field armies. From the player Nation drawer, raise an army (consume manpower, create Army entity). From the army UI, tap a destination province to move it. This completes the basic war loop.

### Acceptance criteria

- [ ] Player NationDrawer has a "Raise Army" section:
  - Shows current armies (count, location, regiments)
  - "Raise New Army" button creates a new Army with N regiments (cost: manpower + gold)
- [ ] Armies appear on the map as small markers (a circle with army size text on the province where they're located)
- [ ] Tapping an army marker selects it (sets `uiStore.selectedArmyId`)
- [ ] With an army selected, tapping a province sets its `movementTarget`
- [ ] Army moves toward target via militaryTick (Issue #19)
- [ ] When army moves into a hostile foreign province (at war), combat resolves
- [ ] When army occupies an enemy province, war score updates (won't be wired for v0.1 — just flag occupation)

### Files affected

- `/src/components/map/ArmyMarker.tsx`
- `/src/components/drawers/NationDrawer.tsx` (add Raise Army UI)
- `/src/components/hud/ArmySelector.tsx` (when army selected, show its info in HUD)
- `/src/engine/orchestrator.ts` (`raiseArmy`, `setArmyMovement`)

### Test requirements

- `tests/engine/military/raiseArmy.test.ts`:
  - Raise army deducts manpower + gold from nation
  - Army created in militaryStore with correct provinceId (capital by default)
  - Can't raise army without enough manpower
- Manual test: full war loop on iPad — raise army, move it, win battle, occupy province

### Notes

- Army marker styling can be minimal — a small filled circle with army size as label
- Selected army should have a visible highlight (border or pulse)
- Army cost for v0.1: 100 gold + 5 manpower per regiment. 10-regiment army = 1000 gold + 50 manpower
- The `setArmyMovement` orchestrator handles updating both `militaryStore` (army target) and any UI state

---

## Issue #23: PWA manifest, iPad meta tags, install testing

**Labels:** `v0.1`, `infra`
**Effort:** S
**Dependencies:** #22

### Description

Configure the app as an installable PWA. Add manifest, iPad-specific meta tags, app icons. Verify install flow works on iPad Safari ("Add to Home Screen") and the game opens full-screen without browser chrome.

### Acceptance criteria

- [ ] `/public/manifest.json` with name, short_name, icons, display: fullscreen, orientation: landscape-primary, start_url: /play
- [ ] `/public/icons/` contains 192x192, 512x512, and 512x512 maskable PNGs
- [ ] `/app/layout.tsx` includes:
  - manifest link
  - `appleWebApp` metadata
  - viewport meta tags preventing zoom/scaling
- [ ] `/app/globals.css` includes iPad-specific CSS from TECH.md Section 16
- [ ] On iPad Safari, visiting deployed URL → Share → Add to Home Screen works
- [ ] Installed app opens full-screen with no browser chrome
- [ ] App icon shows correctly on home screen
- [ ] Orientation locks to landscape

### Files affected

- `/public/manifest.json`
- `/public/icons/icon-192.png`
- `/public/icons/icon-512.png`
- `/public/icons/icon-512-maskable.png`
- `/app/layout.tsx`
- `/app/globals.css`

### Test requirements

- Manual: install on iPad, verify experience
- Lighthouse PWA audit run: target ≥90 PWA score (some service-worker-related categories will fail since we're not adding SW in v0.1 — that's OK)

### Notes

- Use a generic placeholder icon for v0.1 (text "KC" on a flat-color background) — design polish later
- The app icon needs both maskable and regular variants for proper home-screen display on iOS
- Lock orientation to landscape because the map UI assumes wide aspect ratio

---

## Issue #24: Implement save/load to localStorage

**Labels:** `v0.1`, `infra`
**Effort:** M
**Dependencies:** #23

### Description

Players can save the game and reload it later. Implement the snapshot/hydrate pattern from TECH.md Section 11 for all stores. Support 5 manual save slots plus 3 rotating autosaves.

### Acceptance criteria

- [ ] `/src/persistence/saveGame.ts` exports `saveGame(slot: string): Promise<void>`
- [ ] `/src/persistence/loadGame.ts` exports `loadGame(slot: string): Promise<void>`
- [ ] `/src/persistence/storage.ts` exports a `storageBackend` interface (localStorage implementation for v0.1)
- [ ] Save game serializes:
  - worldStore snapshot
  - provinceStore snapshot
  - nationStore snapshot
  - dynastyStore snapshot
  - militaryStore snapshot
  - diplomacyStore snapshot
  - eventQueueStore snapshot
  - (uiStore NOT saved)
- [ ] Save format includes `version: 1` for future migrations
- [ ] Load game hydrates each store from snapshot
- [ ] Settings/main menu drawer adds Save/Load buttons:
  - Save: shows 5 slots, tap to save
  - Load: shows saved games with metadata (date, nation, year)
- [ ] Autosave fires every 12 in-game months to rotating `autosave_1`, `autosave_2`, `autosave_3` slots
- [ ] Emergency autosave fires on ruler death

### Files affected

- `/src/persistence/saveGame.ts`
- `/src/persistence/loadGame.ts`
- `/src/persistence/storage.ts`
- `/src/persistence/migrations.ts` (skeleton; no migrations needed in v0.1)
- `/src/components/drawers/SaveLoadDrawer.tsx`
- `/src/engine/orchestrator.ts` (autosave hook in tick post-step)

### Test requirements

- `tests/persistence/saveLoad.test.ts`:
  - Save game → reload from localStorage → state identical
  - Save format includes version
  - Load with missing slot throws expected error
- `tests/integration/saveAndContinue.test.ts`:
  - Play 12 months, save, reset all stores, load, play another 12 months
  - Final state matches what would have happened in continuous play (verifies determinism through save/load)

### Notes

- localStorage key format: `kc:save:slot1`, `kc:save:autosave_1`, etc. (`kc:` namespace prevents collision)
- Save size for v0.1 should be under 100KB compressed — no compression needed yet
- If save fails (quota exceeded), show user a clear error
- For autosave, write to next rotating slot (1 → 2 → 3 → 1 → ...) so player has multiple recoveries

---

## Issue #25: Polish, perf tuning, and v0.1 cleanup

**Labels:** `v0.1`, `polish`
**Effort:** M
**Dependencies:** #24

### Description

The final pass before v0.1 ships. Hunt down obvious bugs from end-to-end iPad playthroughs. Profile tick performance. Verify smooth pan/zoom. Clean up dead code. Update README with current state.

### Acceptance criteria

- [ ] Play a full 10-year campaign on iPad without crashes:
  - Pick France
  - Play to 1210
  - Declare a war on England at some point
  - Win or lose the war
  - Save and reload mid-game
  - Verify ruler death + succession works if it triggers
- [ ] Map pan/zoom is smooth on iPad (no jank, no lag)
- [ ] Tick at speed 5 completes in under 200ms (see TECH.md Section 5 budget)
- [ ] No console errors during normal play
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No lint errors (`npm run lint`)
- [ ] All tests pass (`npm run test:run`)
- [ ] README updated with:
  - Project description
  - Current version (v0.1)
  - Setup instructions
  - Known limitations / not-yet-implemented features
- [ ] Tag `v0.1.0` on `main` branch

### Files affected

- Various, depending on findings
- `README.md`

### Test requirements

- Existing test suite passes
- Manual iPad playtest checklist completed

### Notes

- **Known v0.1 limitations to document in README:**
  - Only ~50 Western European provinces
  - Only 10 nations
  - No estates, religion mechanics, ideology drift, tech tree, events beyond ruler-death
  - Combat is abstracted (no width, terrain, general traits)
  - AI doesn't declare wars
  - No peace negotiations — wars are open-ended (white peace by closing the war)
- This is the "this is fun enough to want more" checkpoint. If v0.1 isn't fun to play even at this depth, we revisit assumptions before charging into v0.2

---

## Summary

**Total tickets:** 25
**Estimated total effort:** ~100-140 hours across all tickets
**Parallelizable:** None really — each builds on prior

**Order of difficulty:**
- Setup (1, 2): trivial but boring
- Types and stores (3, 4, 5, 6, 7, 8): straightforward, mostly mechanical
- Content (9, 10, 11): time-intensive but easy work
- Loader (12): integration moment
- Map (13, 14, 15): satisfying UI work
- Engine (16, 17, 18, 19): the meat — most challenging
- Drawers + war flow (20, 21, 22): mechanical UI work
- Infra (23, 24): straightforward
- Polish (25): the unknown unknowns

**When this is done, you have:**
- A working iPad-installed PWA
- A map you can pan/zoom
- 10 nations to choose from
- Real characters with real stats
- A ruler who can die and be succeeded
- A war you can declare and fight
- Save/load so you can come back

**What's missing (v0.2+ scope):**
- The remaining 350 provinces and 70 nations
- Estates, religion mechanics, ideology drift, tech trees
- Trade nodes, buildings, full economy
- Combat depth (width, terrain, generals)
- AI that initiates wars
- Peace negotiations
- The other ~190 events
- Cultural conversion, conversion mechanics
- All of the polish

---

*End of ROADMAP_V01.md. This document represents the v0.1 build plan, locked alongside DESIGN.md and TECH.md.*
