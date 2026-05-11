import { describe, it, expect } from 'vitest';
import { createRNG } from '@/lib/rng';
import { createStream, createStreamFactory } from '@/engine/rngStreams';

describe('createRNG', () => {
  it('same seed produces identical sequence', () => {
    const a = createRNG('campaign-1200');
    const b = createRNG('campaign-1200');
    for (let i = 0; i < 100; i++) {
      expect(a.next()).toBe(b.next());
    }
  });

  it('different seeds produce different sequences', () => {
    const a = createRNG('seed-a');
    const b = createRNG('seed-b');
    let identical = 0;
    for (let i = 0; i < 100; i++) {
      if (a.next() === b.next()) identical++;
    }
    // Different seeds should almost never collide. Allow up to 1 collision
    // for floating-point edge cases, well below random chance.
    expect(identical).toBeLessThan(2);
  });

  it('next() stays in [0, 1)', () => {
    const r = createRNG('range');
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  describe('chance', () => {
    it('returns true with ~50% probability over 10000 samples', () => {
      const r = createRNG('chance-half');
      let trues = 0;
      for (let i = 0; i < 10_000; i++) {
        if (r.chance(0.5)) trues++;
      }
      // 5% tolerance per acceptance criteria: 4750..5250.
      expect(trues).toBeGreaterThanOrEqual(4750);
      expect(trues).toBeLessThanOrEqual(5250);
    });

    it('p<=0 is always false, p>=1 is always true', () => {
      const r = createRNG('chance-bounds');
      for (let i = 0; i < 100; i++) {
        expect(r.chance(0)).toBe(false);
        expect(r.chance(-1)).toBe(false);
        expect(r.chance(1)).toBe(true);
        expect(r.chance(2)).toBe(true);
      }
    });
  });

  describe('int', () => {
    it('int(1, 6) covers every face roughly uniformly over 10000 rolls', () => {
      const r = createRNG('d6');
      const counts = [0, 0, 0, 0, 0, 0];
      for (let i = 0; i < 10_000; i++) {
        const v = r.int(1, 6);
        expect(v).toBeGreaterThanOrEqual(1);
        expect(v).toBeLessThanOrEqual(6);
        const idx = v - 1;
        counts[idx] = (counts[idx] ?? 0) + 1;
      }
      // Expected ~1667 per face; allow ±15% (1417..1917) to absorb variance.
      for (const c of counts) {
        expect(c).toBeGreaterThanOrEqual(1417);
        expect(c).toBeLessThanOrEqual(1917);
      }
    });

    it('int(5, 5) always returns 5', () => {
      const r = createRNG('point');
      for (let i = 0; i < 100; i++) {
        expect(r.int(5, 5)).toBe(5);
      }
    });

    it('throws when max < min', () => {
      const r = createRNG('bad');
      expect(() => r.int(10, 1)).toThrow();
    });
  });

  describe('pick', () => {
    it('returns a member of the array', () => {
      const arr = ['a', 'b', 'c', 'd'] as const;
      const r = createRNG('pick');
      for (let i = 0; i < 1000; i++) {
        const v = r.pick(arr);
        expect(arr).toContain(v);
      }
    });

    it('covers every element over enough samples', () => {
      const arr = [0, 1, 2, 3, 4];
      const r = createRNG('cover');
      const seen = new Set<number>();
      for (let i = 0; i < 500; i++) {
        seen.add(r.pick(arr));
      }
      expect(seen.size).toBe(arr.length);
    });

    it('throws on empty array', () => {
      const r = createRNG('empty');
      expect(() => r.pick([] as readonly number[])).toThrow();
    });
  });

  describe('weighted', () => {
    it('respects weights over 10000 samples', () => {
      const r = createRNG('weighted');
      const items = [
        { value: 'rare', weight: 1 },
        { value: 'common', weight: 9 },
      ];
      let rare = 0;
      let common = 0;
      for (let i = 0; i < 10_000; i++) {
        const v = r.weighted(items);
        if (v === 'rare') rare++;
        else common++;
      }
      // Expected rare ~1000, common ~9000. Allow ±15%.
      expect(rare).toBeGreaterThanOrEqual(850);
      expect(rare).toBeLessThanOrEqual(1150);
      expect(common).toBeGreaterThanOrEqual(8500);
      expect(common).toBeLessThanOrEqual(9500);
    });

    it('throws on empty array, total <= 0, or negative weights', () => {
      const r = createRNG('weighted-bad');
      expect(() =>
        r.weighted([] as ReadonlyArray<{ value: string; weight: number }>),
      ).toThrow();
      expect(() =>
        r.weighted([{ value: 'a', weight: 0 }]),
      ).toThrow();
      expect(() =>
        r.weighted([{ value: 'a', weight: -1 }]),
      ).toThrow();
    });
  });

  it('two RNGs with same seed produce same downstream helper calls', () => {
    const a = createRNG('shared');
    const b = createRNG('shared');
    expect(a.int(1, 100)).toBe(b.int(1, 100));
    expect(a.pick(['x', 'y', 'z'])).toBe(b.pick(['x', 'y', 'z']));
    expect(a.chance(0.5)).toBe(b.chance(0.5));
  });
});

describe('createStream / createStreamFactory', () => {
  it('different stream names from the same (seed, month) give different sequences', () => {
    const econ = createStream('campaign', 'economy', 0);
    const mil = createStream('campaign', 'military', 0);
    let identical = 0;
    for (let i = 0; i < 100; i++) {
      if (econ.next() === mil.next()) identical++;
    }
    expect(identical).toBeLessThan(2);
  });

  it('same (seed, name, month) reproduces the same sequence', () => {
    const a = createStream('campaign', 'dynasty', 42);
    const b = createStream('campaign', 'dynasty', 42);
    for (let i = 0; i < 100; i++) {
      expect(a.next()).toBe(b.next());
    }
  });

  it('different month numbers yield different streams for the same subsystem', () => {
    const m0 = createStream('campaign', 'economy', 0);
    const m1 = createStream('campaign', 'economy', 1);
    let identical = 0;
    for (let i = 0; i < 100; i++) {
      if (m0.next() === m1.next()) identical++;
    }
    expect(identical).toBeLessThan(2);
  });

  it('factory returns streams matching createStream', () => {
    const factory = createStreamFactory('seed-x', 7);
    const fromFactory = factory('religion');
    const direct = createStream('seed-x', 'religion', 7);
    for (let i = 0; i < 20; i++) {
      expect(fromFactory.next()).toBe(direct.next());
    }
  });
});
