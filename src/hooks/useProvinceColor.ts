/**
 * Resolves the fill color a province should display under the current
 * map mode. v0.1 only implements political mode (owner flag color);
 * other modes return a sensible fallback so the map never goes blank
 * while we build them out.
 */

import { useNationStore } from '@/stores/nationStore';
import { useProvinceStore } from '@/stores/provinceStore';
import { useUIStore } from '@/stores/uiStore';
import type { MapMode, ProvinceId } from '@/types';

const UNCONTROLLED = '#404040';
const SEA_BLUE = '#1f3a5a';

function colorForMode(
  mode: MapMode,
  controllerColor: string | undefined,
): string {
  switch (mode) {
    case 'political':
    case 'diplomatic':
    case 'dynasty':
      return controllerColor ?? UNCONTROLLED;
    case 'terrain':
    case 'religion':
    case 'culture':
    case 'trade':
    case 'development':
      // Placeholder until each map mode lands; political color keeps
      // the canvas legible.
      return controllerColor ?? UNCONTROLLED;
    default:
      return UNCONTROLLED;
  }
}

export function useProvinceColor(provinceId: ProvinceId): string {
  const controllerId = useProvinceStore(
    (s) => s.provinces[provinceId]?.controllerId,
  );
  const flag = useNationStore((s) =>
    controllerId ? s.nations[controllerId]?.flagColor : undefined,
  );
  const mode = useUIStore((s) => s.currentMapMode);
  return colorForMode(mode, flag);
}

export const MAP_BACKGROUND = SEA_BLUE;
