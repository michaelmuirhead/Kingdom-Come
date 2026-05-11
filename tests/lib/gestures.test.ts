import { describe, it, expect } from 'vitest';
import { midpoint, touchDistance } from '@/lib/geometry';
import {
  BASE_VIEW,
  ZOOM_MAX,
  ZOOM_MIN,
  applyPan,
  applyPinch,
  clampCenter,
  clampZoom,
  screenToWorld,
  viewBoxFor,
  viewBoxString,
  type Camera,
} from '@/lib/gestures';

const SCREEN = { width: 1000, height: 800 };

const ORIGIN_CAMERA: Camera = {
  center: { x: BASE_VIEW.width / 2, y: BASE_VIEW.height / 2 },
  zoom: 1,
};

describe('touchDistance / midpoint', () => {
  it('returns Euclidean distance for two points', () => {
    expect(touchDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('midpoint is the average of components', () => {
    expect(midpoint({ x: 0, y: 0 }, { x: 10, y: 20 })).toEqual({ x: 5, y: 10 });
  });
});

describe('clamping', () => {
  it('clampZoom respects [0.5, 5]', () => {
    expect(clampZoom(0.1)).toBe(ZOOM_MIN);
    expect(clampZoom(10)).toBe(ZOOM_MAX);
    expect(clampZoom(2)).toBe(2);
  });

  it('clampCenter clips to [0, 1000] x [0, 800]', () => {
    expect(clampCenter({ x: -100, y: -50 })).toEqual({ x: 0, y: 0 });
    expect(clampCenter({ x: 5000, y: 5000 })).toEqual({
      x: BASE_VIEW.width,
      y: BASE_VIEW.height,
    });
    expect(clampCenter({ x: 500, y: 400 })).toEqual({ x: 500, y: 400 });
  });
});

describe('viewBoxFor / viewBoxString', () => {
  it('returns the base viewBox at zoom 1, centred', () => {
    expect(viewBoxFor(ORIGIN_CAMERA)).toEqual({ x: 0, y: 0, width: 1000, height: 800 });
    expect(viewBoxString(viewBoxFor(ORIGIN_CAMERA))).toBe('0 0 1000 800');
  });

  it('halves dimensions at zoom 2', () => {
    const vb = viewBoxFor({ center: { x: 500, y: 400 }, zoom: 2 });
    expect(vb.width).toBe(500);
    expect(vb.height).toBe(400);
    expect(vb.x).toBe(250);
    expect(vb.y).toBe(200);
  });
});

describe('screenToWorld', () => {
  it('returns the camera center at the screen center', () => {
    const result = screenToWorld(
      { x: SCREEN.width / 2, y: SCREEN.height / 2 },
      SCREEN,
      ORIGIN_CAMERA,
    );
    expect(result).toEqual(ORIGIN_CAMERA.center);
  });

  it('maps screen (0,0) to the viewBox top-left at zoom 1', () => {
    expect(screenToWorld({ x: 0, y: 0 }, SCREEN, ORIGIN_CAMERA)).toEqual({ x: 0, y: 0 });
  });
});

describe('applyPan', () => {
  it('translates the camera in the opposite direction of the drag', () => {
    const next = applyPan(ORIGIN_CAMERA, { x: 100, y: 0 }, SCREEN);
    // A 100-pixel right drag at zoom 1 with a 1000x800 screen / viewBox
    // should shift the world 100 units to the left.
    expect(next.center.x).toBe(400);
    expect(next.center.y).toBe(400);
  });

  it('clamps the centre to the world bounds', () => {
    const next = applyPan(
      ORIGIN_CAMERA,
      { x: -10_000, y: -10_000 }, // wild leftward+upward drag → push centre right+down a lot
      SCREEN,
    );
    expect(next.center.x).toBeLessThanOrEqual(BASE_VIEW.width);
    expect(next.center.y).toBeLessThanOrEqual(BASE_VIEW.height);
  });

  it('moves further per pixel when zoomed in less', () => {
    const wide = applyPan({ ...ORIGIN_CAMERA, zoom: 0.5 }, { x: 10, y: 0 }, SCREEN);
    const tight = applyPan({ ...ORIGIN_CAMERA, zoom: 4 }, { x: 10, y: 0 }, SCREEN);
    // At lower zoom (more zoomed out), each pixel covers MORE world units,
    // so a 10-pixel drag should move the centre further.
    const wideDx = Math.abs(wide.center.x - ORIGIN_CAMERA.center.x);
    const tightDx = Math.abs(tight.center.x - ORIGIN_CAMERA.center.x);
    expect(wideDx).toBeGreaterThan(tightDx);
  });
});

describe('applyPinch', () => {
  it('scales zoom by the factor (clamped)', () => {
    const next = applyPinch(ORIGIN_CAMERA, { x: 500, y: 400 }, 2, SCREEN);
    expect(next.zoom).toBe(2);
  });

  it('zooming centred on the screen midpoint keeps the centre fixed', () => {
    const screenAnchor = { x: SCREEN.width / 2, y: SCREEN.height / 2 };
    const next = applyPinch(ORIGIN_CAMERA, screenAnchor, 2, SCREEN);
    expect(next.center).toEqual(ORIGIN_CAMERA.center);
  });

  it('zooming off-centre moves the world point under the anchor to stay still', () => {
    const anchorScreen = { x: 250, y: 200 }; // top-left quadrant
    const worldBefore = screenToWorld(anchorScreen, SCREEN, ORIGIN_CAMERA);
    const next = applyPinch(ORIGIN_CAMERA, anchorScreen, 2, SCREEN);
    const worldAfter = screenToWorld(anchorScreen, SCREEN, next);
    expect(worldAfter.x).toBeCloseTo(worldBefore.x, 6);
    expect(worldAfter.y).toBeCloseTo(worldBefore.y, 6);
  });

  it('respects zoom min/max bounds', () => {
    const tooHigh = applyPinch(ORIGIN_CAMERA, { x: 500, y: 400 }, 100, SCREEN);
    expect(tooHigh.zoom).toBe(ZOOM_MAX);

    const tooLow = applyPinch(ORIGIN_CAMERA, { x: 500, y: 400 }, 0.01, SCREEN);
    expect(tooLow.zoom).toBe(ZOOM_MIN);
  });

  it('returns the same camera when the new zoom equals the old (no-op)', () => {
    const same = applyPinch(ORIGIN_CAMERA, { x: 500, y: 400 }, 1, SCREEN);
    expect(same).toBe(ORIGIN_CAMERA);
  });
});
