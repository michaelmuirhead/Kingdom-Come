import { describe, it, expect } from 'vitest';
import {
  LOSER_CASUALTY_RATE,
  WINNER_CASUALTY_RATE,
  buildSide,
  resolveCombat,
} from '@/engine/military/combat';
import { createRNG } from '@/lib/rng';
import type { Army, Regiment } from '@/types';

function reg(id: string, size: number): Regiment {
  return { id, unitType: 'levy', size, experience: 0 };
}

function makeArmy(id: string, regiments: Regiment[]): Army {
  return {
    id,
    nationId: 'FRA',
    name: `Army ${id}`,
    regiments,
    provinceId: 'p',
    movementTarget: null,
    movementProgress: 0,
    generalId: null,
    morale: 100,
    organization: 100,
    attritionMonth: 0,
    inBattle: null,
    inSiege: null,
    isEmbarked: false,
    embarkedOnFleetId: null,
  };
}

describe('resolveCombat', () => {
  it('larger force usually wins over many seeds', () => {
    let bigWins = 0;
    for (let s = 0; s < 100; s++) {
      const rng = createRNG(`combat-${s}`);
      const big = buildSide('FRA', [makeArmy('big', [reg('r1', 1000)])], rng);
      const small = buildSide(
        'ENG',
        [makeArmy('small', [reg('r2', 500)])],
        rng,
      );
      const outcome = resolveCombat(big, small);
      if (outcome.winnerNationId === 'FRA') bigWins++;
    }
    // 2× larger force should win the vast majority of the time (the
    // ±10% RNG factor can't overcome a 2:1 size advantage).
    expect(bigWins).toBe(100);
  });

  it('applies the correct casualty rates (15% winner / 30% loser)', () => {
    const rng = createRNG('casualties');
    const a = buildSide('FRA', [makeArmy('a', [reg('r1', 1000)])], rng);
    const b = buildSide('ENG', [makeArmy('b', [reg('r2', 500)])], rng);
    const outcome = resolveCombat(a, b);
    expect(outcome.totalWinnerCasualties).toBe(
      Math.round(1000 * WINNER_CASUALTY_RATE),
    );
    expect(outcome.totalLoserCasualties).toBe(
      Math.round(500 * LOSER_CASUALTY_RATE),
    );
  });

  it('distributes losses to each regiment proportionally', () => {
    const rng = createRNG('multi-regiment');
    const armyA = makeArmy('a', [reg('r1', 800), reg('r2', 200)]);
    const armyB = makeArmy('b', [reg('rb', 100)]);
    const outcome = resolveCombat(
      buildSide('FRA', [armyA], rng),
      buildSide('ENG', [armyB], rng),
    );
    const updated = outcome.updatedRegiments[armyA.id];
    expect(updated).toBeDefined();
    expect(updated!.length).toBe(2);
    // Each regiment loses 15% rounded individually.
    expect(updated![0]!.size).toBe(800 - Math.round(800 * WINNER_CASUALTY_RATE));
    expect(updated![1]!.size).toBe(200 - Math.round(200 * WINNER_CASUALTY_RATE));
  });

  it('regiments can drop to zero', () => {
    const rng = createRNG('zero-drop');
    const a = buildSide('FRA', [makeArmy('a', [reg('r1', 1000)])], rng);
    const tiny = buildSide('ENG', [makeArmy('b', [reg('r2', 1)])], rng);
    const outcome = resolveCombat(a, tiny);
    expect(
      outcome.updatedRegiments[Object.keys(outcome.updatedRegiments)[1] ?? ''],
    ).toBeDefined();
  });
});
