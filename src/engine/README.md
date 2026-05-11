# /src/engine — Simulation Layer

The heart of the game. Each subsystem (economy, military, diplomacy, dynasty, tech, religion, politics, ideology) has its own subdirectory with a monthly `tick.ts` and supporting modules. `tickEngine.ts` (orchestrator entry) is the heartbeat: it calls each subsystem tick in order, runs the AI decision phase, fires events, then advances time.

Engine functions should be **pure where possible** — take state, return new state. Reserve side-effecting orchestrator functions for actually writing to stores. Components never call engine modules directly except via orchestrators (`resolveBattle`, `declareWar`, `raiseArmy`, etc.) that handle multi-store writes atomically.

See TECH.md Section 5 for the tick contract and Section 4 for the orchestration rule.
