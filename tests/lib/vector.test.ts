import { describe, it, expect } from 'vitest';
import type { IdeologyVector } from '@/types';
import {
  IDEOLOGY_AXES,
  addVector,
  createVector,
  vectorDistance,
  vectorInRange,
} from '@/lib/vector';

describe('createVector', () => {
  it('returns a zero vector on all seven axes', () => {
    const v = createVector();
    for (const axis of IDEOLOGY_AXES) {
      expect(v[axis]).toBe(0);
    }
  });
});

describe('addVector', () => {
  it('adds the delta to each specified axis', () => {
    const out = addVector(createVector(), { militaristPacifist: 25 });
    expect(out.militaristPacifist).toBe(25);
    expect(out.mercantileAgrarian).toBe(0);
  });

  it('does not mutate the input vector', () => {
    const v = createVector();
    addVector(v, { militaristPacifist: 30 });
    expect(v.militaristPacifist).toBe(0);
  });

  it('clamps to +100', () => {
    const start: IdeologyVector = { ...createVector(), militaristPacifist: 90 };
    const out = addVector(start, { militaristPacifist: 50 });
    expect(out.militaristPacifist).toBe(100);
  });

  it('clamps to -100', () => {
    const start: IdeologyVector = {
      ...createVector(),
      theocraticSecular: -90,
    };
    const out = addVector(start, { theocraticSecular: -50 });
    expect(out.theocraticSecular).toBe(-100);
  });

  it('ignores axes not present in the delta', () => {
    const v = addVector(createVector(), {});
    for (const axis of IDEOLOGY_AXES) {
      expect(v[axis]).toBe(0);
    }
  });
});

describe('vectorDistance', () => {
  it('is zero for identical vectors', () => {
    expect(vectorDistance(createVector(), createVector())).toBe(0);
  });

  it('is the Euclidean distance', () => {
    const a = createVector();
    const b = addVector(createVector(), {
      militaristPacifist: 3,
      mercantileAgrarian: 4,
    });
    expect(vectorDistance(a, b)).toBe(5);
  });

  it('is symmetric', () => {
    const a = addVector(createVector(), { militaristPacifist: 50 });
    const b = addVector(createVector(), { theocraticSecular: -30 });
    expect(vectorDistance(a, b)).toBeCloseTo(vectorDistance(b, a));
  });
});

describe('vectorInRange', () => {
  it('returns true when no constraints are specified', () => {
    expect(vectorInRange(createVector(), {})).toBe(true);
  });

  it('respects min on a single axis', () => {
    const v = addVector(createVector(), { militaristPacifist: 40 });
    expect(vectorInRange(v, { militaristPacifist: { min: 30 } })).toBe(true);
    expect(vectorInRange(v, { militaristPacifist: { min: 50 } })).toBe(false);
  });

  it('respects max on a single axis', () => {
    const v = addVector(createVector(), { militaristPacifist: 40 });
    expect(vectorInRange(v, { militaristPacifist: { max: 50 } })).toBe(true);
    expect(vectorInRange(v, { militaristPacifist: { max: 30 } })).toBe(false);
  });

  it('respects multi-axis ranges (all must pass)', () => {
    const v = addVector(createVector(), {
      militaristPacifist: 60,
      mercantileAgrarian: 20,
    });
    expect(
      vectorInRange(v, {
        militaristPacifist: { min: 50 },
        mercantileAgrarian: { max: 30 },
      }),
    ).toBe(true);
    expect(
      vectorInRange(v, {
        militaristPacifist: { min: 50 },
        mercantileAgrarian: { max: 10 },
      }),
    ).toBe(false);
  });
});
