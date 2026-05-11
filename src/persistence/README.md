# /src/persistence — Save & Load

`saveGame.ts` / `loadGame.ts` snapshot and hydrate every store except `uiStore`. `storage.ts` abstracts the backend (localStorage in v0.1, IndexedDB later). `migrations.ts` upgrades old save formats by `version` field. Save slots: 5 manual + 3 rotating autosaves + an emergency autosave on ruler death.
