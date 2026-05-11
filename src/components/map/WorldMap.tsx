'use client';

/**
 * WorldMap — the SVG canvas. Renders every province via the memoized
 * Province leaf. v0.1 has no pan / zoom yet (those come in Issue #14);
 * the SVG just fills its container and uses the authored 1000x800
 * viewBox.
 */

import { useProvinceStore } from '@/stores/provinceStore';
import { MAP_BACKGROUND } from '@/hooks/useProvinceColor';
import { ProvinceComponent } from './Province';

const VIEWBOX = { width: 1000, height: 800 };

export function WorldMap() {
  const provinceIds = useProvinceStore((s) => Object.keys(s.provinces));

  return (
    <svg
      className="h-full w-full"
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ touchAction: 'none', backgroundColor: MAP_BACKGROUND }}
      role="img"
      aria-label="Kingdom Come world map"
    >
      {provinceIds.map((id) => (
        <ProvinceComponent key={id} provinceId={id} />
      ))}
    </svg>
  );
}
