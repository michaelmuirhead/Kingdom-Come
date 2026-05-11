# /src/stores — State Layer

Zustand stores, one per concern (world, province, nation, dynasty, economy, military, diplomacy, religion, politics, tech, ideology, eventQueue, ui). State shape only — minimal logic, just normalized records keyed by ID plus simple setters and `hydrate` / `snapshot` for save/load.

**Single-source rule:** every piece of game state lives in exactly one store. Cross-store views are composed via selectors, not denormalized.

Components subscribe through narrow selectors so only affected components re-render. Components must never write to multiple stores in one user action — multi-store writes go through engine orchestrators.
