# map

SVG world map: `WorldMap.tsx` plus the memoized `Province.tsx` leaf and per-mode color hooks. Touch-first gestures (one-finger pan, two-finger pinch) live in `/src/hooks/useMapGestures.ts`. Map modes (political, terrain, trade, religion, culture, diplomatic, development, dynasty) swap province fills via a single selector per mode.
