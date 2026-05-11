# /src/constants — Tuning Numbers

Magic numbers in one place so balance can be reasoned about: combat modifiers, drift rates, costs (`balance.ts`); era thresholds and dates (`eras.ts`); tap target sizes and drawer widths (`ui.ts`); tick rate, max provinces, etc. (`game.ts`).

Constants live here, not scattered across the engine, so designer-mode tuning is one diff away.
