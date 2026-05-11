/**
 * Pure gesture math for the map. The React hook in
 * `hooks/useMapGestures.ts` wires touch events to these helpers so the
 * tricky bits (anchored pinch zoom, viewBox mapping) stay independently
 * testable.
 *
 * Coordinate spaces:
 *  - screen — pixel coords of the SVG element (clientX/Y minus its rect)
 *  - world  — coords inside the map's 1000x800 viewBox
 *
 * The camera is (center, zoom) where `center` is the world point at the
 * SVG centre and zoom > 1 = zoomed in.
 */

import type { Position } from '@/types';

export const BASE_VIEW = { width: 1000, height: 800 };
export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 5;
/** Below this much movement, a touch is treated as a tap. */
export const TAP_MOVEMENT_THRESHOLD = 10; // CSS pixels

export interface Camera {
  center: Position;
  zoom: number;
}

export interface ScreenSize {
  width: number;
  height: number;
}

export function clampZoom(z: number): number {
  if (z < ZOOM_MIN) return ZOOM_MIN;
  if (z > ZOOM_MAX) return ZOOM_MAX;
  return z;
}

/** Constrain `center` so the camera never drifts off the world. */
export function clampCenter(center: Position): Position {
  return {
    x: Math.max(0, Math.min(BASE_VIEW.width, center.x)),
    y: Math.max(0, Math.min(BASE_VIEW.height, center.y)),
  };
}

/** Visible viewBox derived from the current camera. */
export function viewBoxFor(camera: Camera): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const z = clampZoom(camera.zoom);
  const width = BASE_VIEW.width / z;
  const height = BASE_VIEW.height / z;
  return {
    x: camera.center.x - width / 2,
    y: camera.center.y - height / 2,
    width,
    height,
  };
}

/** Format a viewBox object as the string SVG wants. */
export function viewBoxString(vb: ReturnType<typeof viewBoxFor>): string {
  return `${vb.x} ${vb.y} ${vb.width} ${vb.height}`;
}

/**
 * Map a screen-space point inside the SVG to the world-space viewBox
 * coordinate it currently represents.
 */
export function screenToWorld(
  screen: Position,
  screenSize: ScreenSize,
  camera: Camera,
): Position {
  const vb = viewBoxFor(camera);
  const fx = screen.x / screenSize.width;
  const fy = screen.y / screenSize.height;
  return {
    x: vb.x + fx * vb.width,
    y: vb.y + fy * vb.height,
  };
}

/** Apply a screen-space pan delta to the camera. */
export function applyPan(
  camera: Camera,
  screenDelta: Position,
  screenSize: ScreenSize,
): Camera {
  const z = clampZoom(camera.zoom);
  // Convert the screen delta into world units. The viewBox is
  // BASE_VIEW / z wide, mapped onto screenSize.width pixels — so each
  // screen pixel covers `BASE_VIEW.width / z / screenSize.width` world
  // units.
  const worldDx = -(screenDelta.x * BASE_VIEW.width) / (z * screenSize.width);
  const worldDy = -(screenDelta.y * BASE_VIEW.height) / (z * screenSize.height);
  return {
    center: clampCenter({
      x: camera.center.x + worldDx,
      y: camera.center.y + worldDy,
    }),
    zoom: z,
  };
}

/**
 * Apply a pinch zoom anchored at `screenAnchor` (the midpoint between
 * the two touches). The world point currently under the anchor stays
 * under the anchor after the zoom — that's what makes pinch feel right.
 */
export function applyPinch(
  camera: Camera,
  screenAnchor: Position,
  scaleFactor: number,
  screenSize: ScreenSize,
): Camera {
  const newZoom = clampZoom(camera.zoom * scaleFactor);
  if (newZoom === camera.zoom) return camera;
  const worldBefore = screenToWorld(screenAnchor, screenSize, camera);
  const candidate: Camera = { center: camera.center, zoom: newZoom };
  const worldAfter = screenToWorld(screenAnchor, screenSize, candidate);
  return {
    center: clampCenter({
      x: camera.center.x + (worldBefore.x - worldAfter.x),
      y: camera.center.y + (worldBefore.y - worldAfter.y),
    }),
    zoom: newZoom,
  };
}
