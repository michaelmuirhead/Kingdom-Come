import { describe, it, expect } from 'vitest';
import {
  boundingBox,
  centerOfPath,
  parsePath,
  pointInPath,
} from '@/lib/geometry';

const SQUARE = 'M 0 0 L 10 0 L 10 10 L 0 10 Z';
const TRIANGLE = 'M 0 0 L 10 0 L 5 10 Z';

describe('parsePath', () => {
  it('parses a square with M, L, Z commands', () => {
    expect(parsePath(SQUARE)).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ]);
  });

  it('handles implicit lineto after the initial M', () => {
    // "M 0 0 1 1 2 2" ≡ "M 0 0 L 1 1 L 2 2"
    expect(parsePath('M 0 0 1 1 2 2')).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ]);
  });

  it('throws on unsupported commands', () => {
    expect(() => parsePath('M 0 0 C 1 1 2 2 3 3')).toThrow(/unsupported/);
  });

  it('throws on relative commands', () => {
    expect(() => parsePath('m 0 0 l 1 1')).toThrow(/relative/);
  });
});

describe('boundingBox', () => {
  it('returns min/max corners for a square', () => {
    expect(boundingBox(SQUARE)).toEqual({
      min: { x: 0, y: 0 },
      max: { x: 10, y: 10 },
    });
  });

  it('returns the same point for a single vertex', () => {
    expect(boundingBox('M 3 7')).toEqual({
      min: { x: 3, y: 7 },
      max: { x: 3, y: 7 },
    });
  });

  it('handles negative coordinates', () => {
    expect(boundingBox('M -5 -3 L 5 -3 L 5 7 L -5 7 Z')).toEqual({
      min: { x: -5, y: -3 },
      max: { x: 5, y: 7 },
    });
  });
});

describe('centerOfPath', () => {
  it('returns the vertex average for a square (5, 5)', () => {
    expect(centerOfPath(SQUARE)).toEqual({ x: 5, y: 5 });
  });

  it('returns the centroid of three triangle vertices', () => {
    const c = centerOfPath(TRIANGLE);
    expect(c.x).toBeCloseTo(5);
    expect(c.y).toBeCloseTo(10 / 3);
  });
});

describe('pointInPath', () => {
  it('returns true for points inside a square', () => {
    expect(pointInPath({ x: 5, y: 5 }, SQUARE)).toBe(true);
    expect(pointInPath({ x: 1, y: 1 }, SQUARE)).toBe(true);
    expect(pointInPath({ x: 9, y: 9 }, SQUARE)).toBe(true);
  });

  it('returns false for points outside a square', () => {
    expect(pointInPath({ x: -1, y: 5 }, SQUARE)).toBe(false);
    expect(pointInPath({ x: 11, y: 5 }, SQUARE)).toBe(false);
    expect(pointInPath({ x: 5, y: -1 }, SQUARE)).toBe(false);
    expect(pointInPath({ x: 5, y: 11 }, SQUARE)).toBe(false);
  });

  it('returns true for points inside a triangle', () => {
    expect(pointInPath({ x: 5, y: 3 }, TRIANGLE)).toBe(true);
  });

  it('returns false for points outside a triangle', () => {
    expect(pointInPath({ x: 0, y: 5 }, TRIANGLE)).toBe(false);
    expect(pointInPath({ x: 10, y: 5 }, TRIANGLE)).toBe(false);
  });

  it('returns false for degenerate paths with fewer than 3 vertices', () => {
    expect(pointInPath({ x: 0, y: 0 }, 'M 0 0 L 1 0')).toBe(false);
  });
});
