# /src/hooks — Custom React Hooks

`useTickLoop` drives the simulation heartbeat. `useMapGestures` attaches touch handlers for pan/pinch. Other hooks compose store selectors (`useCurrentNation`, `useSelectedProvince`) so components stay narrow. Hooks must not contain engine logic — they observe state and dispatch to orchestrators.
