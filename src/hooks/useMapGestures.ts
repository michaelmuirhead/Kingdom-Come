'use client';

/**
 * useMapGestures — attaches one-finger pan, two-finger pinch-zoom, and
 * tap-vs-drag detection to an SVG element. Multi-touch pinch is centred
 * between the two touches. Single taps that don't drift past
 * TAP_MOVEMENT_THRESHOLD pixels dispatch to setSelectedProvince via
 * elementFromPoint(), keeping the Province leaf React-free for touch.
 */

import { useEffect, useRef, type RefObject } from 'react';
import { touchDistance, midpoint } from '@/lib/geometry';
import {
  TAP_MOVEMENT_THRESHOLD,
  applyPan,
  applyPinch,
  type Camera,
} from '@/lib/gestures';
import type { Position } from '@/types';

type SetCamera = (camera: Camera) => void;
type SelectProvinceFn = (provinceId: string | null) => void;

export interface UseMapGesturesOpts {
  cameraRef: RefObject<Camera>;
  setCamera: SetCamera;
  selectProvince: SelectProvinceFn;
}

interface TouchPoint {
  identifier: number;
  position: Position;
}

interface GestureState {
  mode: 'idle' | 'pan' | 'pinch';
  startScreen: Position; // initial primary-finger position (for tap detection)
  lastScreen: Position; // most recent primary-finger position
  movedDistance: number;
  pinchStartDistance: number;
  pinchAnchor: Position;
  touches: Map<number, Position>;
}

function clientToLocal(rect: DOMRect, clientX: number, clientY: number): Position {
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function getTouchById(
  touches: TouchList,
  id: number,
): TouchPoint | null {
  for (let i = 0; i < touches.length; i++) {
    const t = touches.item(i);
    if (t && t.identifier === id) {
      return { identifier: t.identifier, position: { x: t.clientX, y: t.clientY } };
    }
  }
  return null;
}

function findProvinceIdUnder(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  return (el as Element).getAttribute('data-province-id');
}

export function useMapGestures(
  svgRef: RefObject<SVGSVGElement | null>,
  opts: UseMapGesturesOpts,
): void {
  const { cameraRef, setCamera, selectProvince } = opts;
  const stateRef = useRef<GestureState>({
    mode: 'idle',
    startScreen: { x: 0, y: 0 },
    lastScreen: { x: 0, y: 0 },
    movedDistance: 0,
    pinchStartDistance: 0,
    pinchAnchor: { x: 0, y: 0 },
    touches: new Map(),
  });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onTouchStart = (e: TouchEvent) => {
      const rect = svg.getBoundingClientRect();
      const st = stateRef.current;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches.item(i);
        if (!t) continue;
        st.touches.set(t.identifier, clientToLocal(rect, t.clientX, t.clientY));
      }
      if (st.touches.size === 1) {
        const [only] = Array.from(st.touches.values());
        if (!only) return;
        st.mode = 'pan';
        st.startScreen = only;
        st.lastScreen = only;
        st.movedDistance = 0;
      } else if (st.touches.size >= 2) {
        const [a, b] = Array.from(st.touches.values()).slice(0, 2);
        if (!a || !b) return;
        st.mode = 'pinch';
        st.pinchStartDistance = touchDistance(a, b);
        st.pinchAnchor = midpoint(a, b);
      }
      // Prevent iOS scroll / pull-to-refresh.
      e.preventDefault();
    };

    const onTouchMove = (e: TouchEvent) => {
      const rect = svg.getBoundingClientRect();
      const screenSize = { width: rect.width, height: rect.height };
      const st = stateRef.current;
      // Update tracked positions.
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches.item(i);
        if (!t) continue;
        if (st.touches.has(t.identifier)) {
          st.touches.set(t.identifier, clientToLocal(rect, t.clientX, t.clientY));
        }
      }

      if (st.mode === 'pan' && st.touches.size === 1) {
        const [only] = Array.from(st.touches.values());
        if (!only) return;
        const dx = only.x - st.lastScreen.x;
        const dy = only.y - st.lastScreen.y;
        st.lastScreen = only;
        st.movedDistance += Math.hypot(dx, dy);
        const camera = cameraRef.current;
        if (camera) {
          setCamera(
            applyPan(camera, { x: dx, y: dy }, screenSize),
          );
        }
      } else if (st.mode === 'pinch' && st.touches.size >= 2) {
        const [a, b] = Array.from(st.touches.values()).slice(0, 2);
        if (!a || !b) return;
        const dist = touchDistance(a, b);
        if (st.pinchStartDistance > 0) {
          const scale = dist / st.pinchStartDistance;
          const camera = cameraRef.current;
          if (camera) {
            setCamera(
              applyPinch(camera, midpoint(a, b), scale, screenSize),
            );
          }
          st.pinchStartDistance = dist;
        }
      }
      e.preventDefault();
    };

    const onTouchEnd = (e: TouchEvent) => {
      const st = stateRef.current;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches.item(i);
        if (!t) continue;
        st.touches.delete(t.identifier);
      }

      if (st.touches.size === 0) {
        // Was this a tap? If we ended in pan mode and the finger never
        // moved past the threshold, treat as a tap.
        if (st.mode === 'pan' && st.movedDistance < TAP_MOVEMENT_THRESHOLD) {
          const rect = svg.getBoundingClientRect();
          const provinceId = findProvinceIdUnder(
            rect.left + st.startScreen.x,
            rect.top + st.startScreen.y,
          );
          selectProvince(provinceId);
        }
        st.mode = 'idle';
      } else if (st.touches.size === 1 && st.mode === 'pinch') {
        // Dropped to one finger; downgrade to pan from the remaining
        // touch's current position. The remaining gesture is no longer a
        // tap (we've already been pinching).
        const [only] = Array.from(st.touches.values());
        if (only) {
          st.mode = 'pan';
          st.startScreen = only;
          st.lastScreen = only;
          st.movedDistance = TAP_MOVEMENT_THRESHOLD; // > threshold → no tap
        }
      }
      e.preventDefault();
    };

    const onTouchCancel = (e: TouchEvent) => {
      const st = stateRef.current;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches.item(i);
        if (!t) continue;
        st.touches.delete(t.identifier);
      }
      if (st.touches.size === 0) st.mode = 'idle';
      e.preventDefault();
    };

    svg.addEventListener('touchstart', onTouchStart, { passive: false });
    svg.addEventListener('touchmove', onTouchMove, { passive: false });
    svg.addEventListener('touchend', onTouchEnd, { passive: false });
    svg.addEventListener('touchcancel', onTouchCancel, { passive: false });

    return () => {
      svg.removeEventListener('touchstart', onTouchStart);
      svg.removeEventListener('touchmove', onTouchMove);
      svg.removeEventListener('touchend', onTouchEnd);
      svg.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [svgRef, cameraRef, setCamera, selectProvince]);
}
