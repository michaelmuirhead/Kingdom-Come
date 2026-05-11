# /src/components — React UI

Presentation layer. Subdirectories cluster components by feature: `map/`, `hud/`, `drawers/`, `dynasty/`, `diplomacy/`, `military/`, `economy/`, `tech/`, `politics/`, `religion/`, `ideology/`, `events/`, plus `shared/` for generic primitives and `dialogs/` for modal flows.

Components read from stores via Zustand selectors and never write to multiple stores in one user action. Multi-store mutations call engine orchestrator functions (e.g., `resolveBattle`, `declareWar`).

Performance rules: memoize hot leaves (especially `Province`), use narrow selectors, no SVG filters or gradients on the map.
