# /tests

Mirrors the `/src` layout. Vitest + React Testing Library. Subdirectories:

- `engine/` — pure simulation logic per subsystem.
- `stores/` — Zustand store actions and indices.
- `lib/` — utility functions (RNG distribution, date math, vector clamping).
- `components/` — UI behavior and rendering.
- `persistence/` — save/load round-trip.
- `integration/` — full-tick scenarios spanning multiple stores.

Run with `npm run test` (watch) or `npm run test:run` (one-shot).
