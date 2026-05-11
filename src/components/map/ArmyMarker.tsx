'use client';

/**
 * ArmyMarker — small SVG circle at the centroid of the army's province.
 *
 * Reads the army, its province center, and the owning nation's flag
 * colour with narrow store selectors. Tapping selects the army (and
 * clears the province selection so the next province tap is
 * interpreted as a movement order, see WorldMap).
 */

import { memo } from 'react';
import { useMilitaryStore } from '@/stores/militaryStore';
import { useNationStore } from '@/stores/nationStore';
import { useProvinceStore } from '@/stores/provinceStore';
import { useUIStore } from '@/stores/uiStore';
import type { ArmyId } from '@/types';

interface ArmyMarkerProps {
  armyId: ArmyId;
}

function ArmyMarkerImpl({ armyId }: ArmyMarkerProps) {
  const army = useMilitaryStore((s) => s.armies[armyId]);
  const province = useProvinceStore((s) =>
    army ? s.provinces[army.provinceId] : undefined,
  );
  const flagColor = useNationStore((s) =>
    army ? s.nations[army.nationId]?.flagColor : undefined,
  );
  const isSelected = useUIStore((s) => s.selectedArmyId === armyId);
  const setSelectedArmy = useUIStore((s) => s.setSelectedArmy);
  const setSelectedProvince = useUIStore((s) => s.setSelectedProvince);

  if (!army || !province) return null;
  const size = army.regiments.reduce((s, r) => s + r.size, 0);
  const sizeLabel =
    size >= 10_000 ? `${Math.round(size / 1000)}k` : `${size}`;

  return (
    <g
      data-army-id={armyId}
      data-testid={`army-marker-${armyId}`}
      transform={`translate(${province.position.x} ${province.position.y})`}
      style={{ cursor: 'pointer', touchAction: 'none' }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedProvince(null);
        setSelectedArmy(armyId);
      }}
    >
      <circle
        r={14}
        fill={flagColor ?? '#888888'}
        stroke={isSelected ? '#ffffff' : '#101010'}
        strokeWidth={isSelected ? 3 : 1.5}
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={700}
        fill="#ffffff"
        pointerEvents="none"
      >
        {sizeLabel}
      </text>
    </g>
  );
}

export const ArmyMarker = memo(ArmyMarkerImpl);
ArmyMarker.displayName = 'ArmyMarker';
