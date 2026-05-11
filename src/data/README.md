# /src/data — Hand-Authored Content

JSON content files for the game: provinces, nations, characters, traits, religions, tech tree, archetypes, etc. Validated against Zod schemas in `schemas/` at load time. The content-entry tool under `/app/content-tool` writes here.

Each subdirectory is a single content type — see DESIGN.md for the gameplay role and TECH.md Section 6 for the schema. v0.1 ships only Western European provinces, ~10 nations, ~20 historical characters; the remainder fill in for v0.2+.
