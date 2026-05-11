'use client';

/**
 * WorldMap — the SVG canvas.
 *
 * v0.1: one <path> per province via the memoized ProvinceComponent.
 * Camera state (center + zoom) is read from uiStore and mapped onto the
 * SVG viewBox each render. Pan/pinch gestures are attached by
 * useMapGestures.
 */

import { useEffect, useRef } from 'react';
import { useProvinceStore } from '@/stores/provinceStore';
import { useUIStore } from '@/stores/uiStore';
import { MAP_BACKGROUND } from '@/hooks/useProvinceColor';
import { useMapGestures } from '@/hooks/useMapGestures';
import { viewBoxFor, viewBoxString, type Camera } from '@/lib/gestures';
import { ProvinceComponent } from './Province';

export function WorldMap() {
  const provinceIds = useProvinceStore((s) => Object.keys(s.provinces));
  const cameraCenter = useUIStore((s) => s.cameraCenter);
  const cameraZoom = useUIStore((s) => s.cameraZoom);
  const setCamera = useUIStore((s) => s.setCamera);
  const setSelectedProvince = useUIStore((s) => s.setSelectedProvince);

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
    selectProvince: (id) => setSelectedProvince(id),
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
      {provinceIds.map((id) => (
        <ProvinceComponent key={id} provinceId={id} />
      ))}
    </svg>
  );
}
