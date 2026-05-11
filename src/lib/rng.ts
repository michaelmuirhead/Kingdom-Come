/**
 * Seeded pseudo-random number generator (mulberry32).
 *
 * Tiny, fast, deterministic — the same seed always produces the same
 * sequence. Critical for reproducible campaigns, save/load round-trips,
 * and per-subsystem RNG streams.
 *
 * See TECH.md Section 12.
 */

export interface WeightedItem<T> {
  value: T;
  weight: number;
}

export interface RNG {
  /** Uniformly distributed in [0, 1). */
  next(): number;
  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number;
  /** Pick a uniformly random element of `arr`. Throws if empty. */
  pick<T>(arr: readonly T[]): T;
  /** Pick by weight. Throws on empty / non-positive total weight. */
  weighted<T>(items: ReadonlyArray<WeightedItem<T>>): T;
  /** Boolean true with probability `p` (clamped to [0,1]). */
  chance(p: number): boolean;
}

/** FNV-1a string hash → uint32. Stable across runs and platforms. */
function hashSeed(seed: string): number {
  let h = 2166136261; // FNV offset basis
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Mix once more so adjacent string seeds don't yield adjacent states.
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489917);
  h ^= h >>> 16;
  return h >>> 0;
}

export function createRNG(seed: string): RNG {
  let state = hashSeed(seed);

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number): number => {
    if (max < min) throw new Error(`int(${min}, ${max}): max < min`);
    return Math.floor(next() * (max - min + 1)) + min;
  };

  const pick = <T,>(arr: readonly T[]): T => {
    if (arr.length === 0) throw new Error('pick: empty array');
    const idx = Math.floor(next() * arr.length);
    // length-guarded above; non-null assertion is safe.
    return arr[idx] as T;
  };

  const weighted = <T,>(items: ReadonlyArray<WeightedItem<T>>): T => {
    if (items.length === 0) throw new Error('weighted: empty array');
    let total = 0;
    for (const item of items) {
      if (item.weight < 0) throw new Error('weighted: negative weight');
      total += item.weight;
    }
    if (total <= 0) throw new Error('weighted: total weight must be > 0');
    let r = next() * total;
    for (const item of items) {
      r -= item.weight;
      if (r <= 0) return item.value;
    }
    // Floating-point drift fallback — return the last positive-weight item.
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i] as WeightedItem<T>;
      if (item.weight > 0) return item.value;
    }
    throw new Error('weighted: unreachable');
  };

  const chance = (p: number): boolean => {
    if (p <= 0) return false;
    if (p >= 1) return true;
    return next() < p;
  };

  return { next, int, pick, weighted, chance };
}
