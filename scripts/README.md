# /scripts

Build and content-pipeline helpers run via `tsx`:

- `validateContent.ts` — runs every Zod schema against every file in `/src/data`. Exits non-zero on validation error.
- `generateNamePools.ts` — one-off culture-appropriate name pool generation.

Add new scripts here, then wire a `package.json` script entry.
