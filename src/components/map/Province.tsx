'use client';

/**
 * Province — memoized SVG `<path>` for one province.
 *
 * Subscribes only to its own slice of provinceStore (the pathData) and
 * to its own controller's flag colour via useProvinceColor. Selection
 * highlight comes from a narrow uiStore selector that returns a
 * boolean, so unrelated selection changes do not trigger a re-render.
 */

import { memo } from 'react';
import { useProvinceColor } from '@/hooks/useProvinceColor';
import { useProvinceStore } from '@/stores/provinceStore';
import { useUIStore } from '@/stores/uiStore';
import type { ProvinceId } from '@/types';

interface ProvinceProps {
  provinceId: ProvinceId;
}

function ProvinceComponentImpl({ provinceId }: ProvinceProps) {
  const pathData = useProvinceStore((s) => s.provinces[provinceId]?.pathData);
  const fill = useProvinceColor(provinceId);
  const isSelected = useUIStore(
    (s) => s.selectedProvinceId === provinceId,
  );
  const setSelectedProvince = useUIStore((s) => s.setSelectedProvince);

  if (!pathData) return null;

  return (
    <path
      d={pathData}
      fill={fill}
      stroke={isSelected ? '#ffffff' : '#222222'}
      strokeWidth={isSelected ? 3 : 0.5}
      data-province-id={provinceId}
      onClick={() => setSelectedProvince(provinceId)}
      onTouchEnd={(e) => {
        e.preventDefault();
        setSelectedProvince(provinceId);
      }}
      style={{ cursor: 'pointer', touchAction: 'none' }}
    />
  );
}

export const ProvinceComponent = memo(ProvinceComponentImpl);
ProvinceComponent.displayName = 'ProvinceComponent';
