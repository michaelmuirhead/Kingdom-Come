/**
 * Ideology vector math.
 *
 * Seven axes, each clamped to [-100, +100]. Vectors are the substrate for
 * archetype matching, ideology drift, and earthquake-event triggering.
 * Clamping happens on every mutation so a vector can never drift past
 * bounds.
 */

import type { IdeologyVector } from '@/types';

export const IDEOLOGY_AXES = [
  'militaristPacifist',
  'mercantileAgrarian',
  'theocraticSecular',
  'openIsolationist',
  'aristocraticPopulist',
  'traditionalProgressive',
  'centralistFederalist',
] as const satisfies readonly (keyof IdeologyVector)[];

export type IdeologyAxis = (typeof IDEOLOGY_AXES)[number];

export interface IdeologyAxisRange {
  min?: number;
  max?: number;
}

export type IdeologyRange = Partial<Record<IdeologyAxis, IdeologyAxisRange>>;

const AXIS_MIN = -100;
const AXIS_MAX = 100;

function clampAxis(v: number): number {
  if (v < AXIS_MIN) return AXIS_MIN;
  if (v > AXIS_MAX) return AXIS_MAX;
  return v;
}

export function createVector(): IdeologyVector {
  return {
    militaristPacifist: 0,
    mercantileAgrarian: 0,
    theocraticSecular: 0,
    openIsolationist: 0,
    aristocraticPopulist: 0,
    traditionalProgressive: 0,
    centralistFederalist: 0,
  };
}

export function addVector(
  v: IdeologyVector,
  delta: Partial<IdeologyVector>,
): IdeologyVector {
  const out: IdeologyVector = { ...v };
  for (const axis of IDEOLOGY_AXES) {
    const d = delta[axis];
    if (typeof d === 'number') {
      out[axis] = clampAxis(out[axis] + d);
    }
  }
  return out;
}

/** Euclidean distance across all seven axes. */
export function vectorDistance(a: IdeologyVector, b: IdeologyVector): number {
  let sum = 0;
  for (const axis of IDEOLOGY_AXES) {
    const d = a[axis] - b[axis];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/**
 * True when `v` satisfies every axis-range constraint specified in
 * `range`. Unspecified axes are unconstrained. Used to test archetype
 * signature membership.
 */
export function vectorInRange(
  v: IdeologyVector,
  range: IdeologyRange,
): boolean {
  for (const axis of IDEOLOGY_AXES) {
    const r = range[axis];
    if (!r) continue;
    if (r.min !== undefined && v[axis] < r.min) return false;
    if (r.max !== undefined && v[axis] > r.max) return false;
  }
  return true;
}
