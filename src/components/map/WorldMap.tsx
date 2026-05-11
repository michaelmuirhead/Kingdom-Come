'use client';

/**
 * WorldMap — the SVG canvas.
 *
 * Renders one <path> per province via the memoized ProvinceComponent
 * plus one <g> per army via ArmyMarker. Camera state (centre + zoom)
 * maps onto the SVG viewBox each render; pan/pinch gestures are
 * attached by useMapGestures.
 *
 * Tap behaviour:
 *   - No army selected → province tap selects + opens province drawer.
 *   - Army selected     → province tap orders the army to move there
 *                         and deselects the army.
 *   - Army marker tap   → selects that army (clears province selection).
 */

import { useEffect, useRef } from 'react';
import { useMilitaryStore } from '@/stores/militaryStore';
import { useProvinceStore } from '@/stores/provinceStore';
import { useUIStore } from '@/stores/uiStore';
import { MAP_BACKGROUND } from '@/hooks/useProvinceColor';
import { useMapGestures } from '@/hooks/useMapGestures';
import { setArmyMovement } from '@/engine/orchestrator';
import { viewBoxFor, viewBoxString, type Camera } from '@/lib/gestures';
import { ArmyMarker } from './ArmyMarker';
import { ProvinceComponent } from './Province';

export function WorldMap() {
  const provinceIds = useProvinceStore((s) => Object.keys(s.provinces));
  const armyIds = useMilitaryStore((s) => Object.keys(s.armies));
  const cameraCenter = useUIStore((s) => s.cameraCenter);
  const cameraZoom = useUIStore((s) => s.cameraZoom);
  const setCamera = useUIStore((s) => s.setCamera);
  const setSelectedProvince = useUIStore((s) => s.setSelectedProvince);
  const setSelectedArmy = useUIStore((s) => s.setSelectedArmy);
  const setDrawer = useUIStore((s) => s.setDrawer);

  const camera: Camera = { center: cameraCenter, zoom: cameraZoom };
  const viewBox = viewBoxString(viewBoxFor(camera));

  const svgRef = useRef<SVGSVGElement | null>(null);
  const cameraRef = useRef<Camera>(camera);

  useEffect(() => {
    cameraRef.current = camera;
  });

  useMapGestures(svgRef, {
    cameraRef,
    setCamera: (c) => setCamera(c.center, c.zoom),
    selectProvince: (id) => {
      const { selectedArmyId } = useUIStore.getState();
      // Army selected? Treat the tap as a movement order.
      if (selectedArmyId && id) {
        setArmyMovement(selectedArmyId, id);
        setSelectedArmy(null);
        return;
      }
      setSelectedProvince(id);
      if (id) setDrawer('province');
    },
  });

  return (
    <svg
      ref={svgRef}
      className="h-full w-full"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      style={{ touchAction: 'none', backgroundColor: MAP_BACKGROUND }}
      role="img"
      aria-label="Kingdom Come world map"
    >
      <g data-testid="province-layer">
        {provinceIds.map((id) => (
          <ProvinceComponent key={id} provinceId={id} />
        ))}
      </g>
      <g data-testid="army-layer">
        {armyIds.map((id) => (
          <ArmyMarker key={id} armyId={id} />
        ))}
      </g>
    </svg>
  );
}
