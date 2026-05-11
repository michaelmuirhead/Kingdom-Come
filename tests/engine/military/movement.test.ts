import { describe, it, expect } from 'vitest';
import {
  advanceMovement,
  monthsToCross,
} from '@/engine/military/movement';
import type { Army } from '@/types';

function makeArmy(over: Partial<Army> & { id: string }): Army {
  const { id, ...rest } = over;
  return {
    id,
    nationId: 'FRA',
    name: `Army ${id}`,
    regiments: [],
    provinceId: 'p1',
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
    ...rest,
  };
}

describe('monthsToCross', () => {
  it('plains = 1, hills/forest = 2, mountains = 3', () => {
    expect(monthsToCross('plains')).toBe(1);
    expect(monthsToCross('hills')).toBe(2);
    expect(monthsToCross('forest')).toBe(2);
    expect(monthsToCross('jungle')).toBe(2);
    expect(monthsToCross('mountains')).toBe(3);
    expect(monthsToCross('coastal')).toBe(1);
    expect(monthsToCross('marsh')).toBe(1);
  });
});

describe('advanceMovement', () => {
  it('returns the army unchanged when there is no target', () => {
    const a = makeArmy({ id: 'a' });
    const r = advanceMovement(a, 'plains');
    expect(r.arrived).toBe(false);
    expect(r.army).toBe(a);
  });

  it('arrives in one tick on plains', () => {
    const a = makeArmy({ id: 'a', movementTarget: 'p2' });
    const r = advanceMovement(a, 'plains');
    expect(r.arrived).toBe(true);
    expect(r.army.provinceId).toBe('p2');
    expect(r.army.movementTarget).toBeNull();
    expect(r.army.movementProgress).toBe(0);
  });

  it('takes two ticks on hills', () => {
    const a = makeArmy({ id: 'a', movementTarget: 'p2' });
    const r1 = advanceMovement(a, 'hills');
    expect(r1.arrived).toBe(false);
    expect(r1.army.movementProgress).toBeCloseTo(0.5);
    const r2 = advanceMovement(r1.army, 'hills');
    expect(r2.arrived).toBe(true);
  });

  it('takes three ticks on mountains', () => {
    let army = makeArmy({ id: 'a', movementTarget: 'p2' });
    for (let i = 0; i < 2; i++) {
      const r = advanceMovement(army, 'mountains');
      expect(r.arrived).toBe(false);
      army = r.army;
    }
    const final = advanceMovement(army, 'mountains');
    expect(final.arrived).toBe(true);
  });
});
