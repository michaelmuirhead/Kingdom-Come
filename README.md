# Kingdom Come

A client-side grand-strategy simulation. Built for iPad as a PWA.

**Status:** v0.1 — Skeleton (in development)

See `DESIGN.md`, `TECH.md`, and `ROADMAP_V01.md` for the canonical specifications.

## Tech stack

- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Zustand (state)
- Zod (schema validation)
- Vitest + React Testing Library

## Scripts

```bash
npm install            # Install dependencies
npm run dev            # Start dev server (localhost:3000)
npm run build          # Production build
npm run start          # Run production build
npm run typecheck      # TypeScript noEmit check
npm run lint           # ESLint
npm run test           # Vitest watch mode
npm run test:run       # Vitest one-shot run
npm run format         # Format with Prettier
```

## Project layout

See `TECH.md` Section 3 for the canonical folder structure.
