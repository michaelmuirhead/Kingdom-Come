import { describe, it, expect } from 'vitest';
import {
  baseMortalityRate,
  isPlotArmored,
  monthlyMortalityRate,
  rollDeath,
} from '@/engine/dynasty/mortality';
import { createRNG } from '@/lib/rng';
import type { Character, GameDate } from '@/types';
import { makeCharacter } from '../../stores/fixtures';

const NOW: GameDate = { year: 1200, month: 1, day: 1 };

describe('baseMortalityRate', () => {
  it('rises monotonically with age', () => {
    let prev = 0;
    for (const a of [20, 35, 45, 55, 65, 75, 85]) {
      const v = baseMortalityRate(a);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it('matches the documented brackets at boundaries', () => {
    expect(baseMortalityRate(29)).toBe(0.0005);
    expect(baseMortalityRate(30)).toBe(0.001);
    expect(baseMortalityRate(79)).toBe(0.02);
    expect(baseMortalityRate(80)).toBe(0.04);
  });
});

describe('monthlyMortalityRate', () => {
  it('is higher at low health than at full health (same age)', () => {
    const ageY = 50;
    const sick = monthlyMortalityRate(ageY, 20);
    const healthy = monthlyMortalityRate(ageY, 100);
    expect(sick).toBeGreaterThan(healthy);
  });

  it('at health 100, equals baseRate (one-to-one)', () => {
    const ageY = 50;
    expect(monthlyMortalityRate(ageY, 100)).toBe(baseMortalityRate(ageY));
  });

  it('clamps health to [0, 100]', () => {
    const ageY = 60;
    expect(monthlyMortalityRate(ageY, -50)).toBe(monthlyMortalityRate(ageY, 0));
    expect(monthlyMortalityRate(ageY, 200)).toBe(monthlyMortalityRate(ageY, 100));
  });
});

describe('isPlotArmored', () => {
  function c(opts: Partial<Character['health']>): Character {
    return makeCharacter({
      id: 'c',
      health: {
        current: 90,
        max: 100,
        conditions: [],
        plotArmor: false,
        ...opts,
      },
    });
  }

  it('false when plotArmor is false', () => {
    expect(isPlotArmored(c({ plotArmor: false }), NOW)).toBe(false);
  });

  it('true when plotArmor is true and expires is in the future', () => {
    const char = c({
      plotArmor: true,
      plotArmorExpires: { year: 1220, month: 1, day: 1 },
    });
    expect(isPlotArmored(char, NOW)).toBe(true);
  });

  it('false when plot armor has expired', () => {
    const char = c({
      plotArmor: true,
      plotArmorExpires: { year: 1199, month: 12, day: 1 },
    });
    expect(isPlotArmored(char, NOW)).toBe(false);
  });

  it('true forever when plotArmor is true and no expires set', () => {
    const char = c({ plotArmor: true });
    expect(isPlotArmored(char, NOW)).toBe(true);
    expect(isPlotArmored(char, { year: 2200, month: 1, day: 1 })).toBe(true);
  });
});

describe('rollDeath distribution', () => {
  it('an 80-year-old in poor health is very likely to die over 5 years', () => {
    const rng = createRNG('mortality-elderly');
    const char = makeCharacter({
      id: 'old',
      birthDate: { year: 1120, month: 1, day: 1 }, // age 80 in 1200
      health: { current: 30, max: 100, conditions: [], plotArmor: false },
    });
    let died = 0;
    for (let m = 0; m < 60; m++) {
      if (rollDeath(char, NOW, 80, rng)) died++;
    }
    expect(died).toBeGreaterThan(0);
  });

  it('a healthy 30-year-old rarely dies over 10 years', () => {
    const char = makeCharacter({
      id: 'young',
      birthDate: { year: 1170, month: 1, day: 1 },
      health: { current: 95, max: 100, conditions: [], plotArmor: false },
    });
    // Aggregate over many seeds to reduce flakiness.
    let totalDeaths = 0;
    const SAMPLES = 200;
    for (let s = 0; s < SAMPLES; s++) {
      const rng = createRNG(`mortality-young-${s}`);
      for (let m = 0; m < 120; m++) {
        if (rollDeath(char, NOW, 30, rng)) {
          totalDeaths++;
          break;
        }
      }
    }
    // 0.0005 * (1 + 4 * 0.05) = ~0.0006 per month, ~0.072 per 120 months.
    // Expect about 14/200 deaths — generous slack.
    expect(totalDeaths).toBeLessThan(40);
  });

  it('plot-armored characters never die during the armor window', () => {
    const rng = createRNG('plot-armor');
    const char = makeCharacter({
      id: 'protected',
      birthDate: { year: 1120, month: 1, day: 1 },
      health: {
        current: 1,
        max: 100,
        conditions: [],
        plotArmor: true,
        plotArmorExpires: { year: 1250, month: 1, day: 1 },
      },
    });
    for (let m = 0; m < 1000; m++) {
      expect(rollDeath(char, NOW, 80, rng)).toBe(false);
    }
  });
});
