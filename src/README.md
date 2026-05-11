# /src

All non-route source. Layered per TECH.md Section 1:

- `types/` — pure TypeScript interfaces; no values, no runtime.
- `stores/` — Zustand stores (state layer). Minimal logic, just state + setters.
- `engine/` — simulation layer. Pure functions where possible, orchestrators for multi-store writes. No React imports.
- `data/` — hand-authored content (JSON) plus Zod schemas. Loaded into stores at startup.
- `components/` — React UI. Reads from stores via selectors; never writes to multiple stores in one user action.
- `hooks/` — custom React hooks (tick loop, gestures, selectors).
- `lib/` — pure utility functions (RNG, dates, geometry, vector math). No React, no Zustand.
- `persistence/` — save/load and storage abstraction.
- `constants/` — tuning numbers, magic constants, era thresholds, UI sizes.
