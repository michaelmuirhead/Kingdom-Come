import { describe, it, expect, beforeEach } from 'vitest';
import { economyTick } from '@/engine/economy/tick';
import {
  calculateNationTaxIncome,
  provinceMonthlyTax,
} from '@/engine/economy/income';
import { regenerateManpower } from '@/engine/economy/manpower';
import { useProvinceStore } from '@/stores/provinceStore';
import { useNationStore } from '@/stores/nationStore';
import { makeNation, makeProvince } from '../../stores/fixtures';

describe('provinceMonthlyTax', () => {
  it('returns development.tax for an unoccupied province', () => {
    const p = makeProvince({
      id: 'p',
      controllerId: 'FRA',
      development: { tax: 7, production: 3, manpower: 2 },
    });
    expect(provinceMonthlyTax(p)).toBe(7);
  });

  it('returns 0 for an occupied province', () => {
    const p = makeProvince({
      id: 'p',
      controllerId: 'FRA',
      occupierId: 'ENG',
      development: { tax: 7, production: 3, manpower: 2 },
    });
    expect(provinceMonthlyTax(p)).toBe(0);
  });
});

describe('calculateNationTaxIncome', () => {
  it('sums tax over only the nation\'s unoccupied provinces', () => {
    const provinces = [
      makeProvince({
        id: 'p1',
        controllerId: 'FRA',
        development: { tax: 5, production: 0, manpower: 0 },
      }),
      makeProvince({
        id: 'p2',
        controllerId: 'FRA',
        occupierId: 'ENG',
        development: { tax: 7, production: 0, manpower: 0 },
      }),
      makeProvince({
        id: 'p3',
        controllerId: 'ENG',
        development: { tax: 3, production: 0, manpower: 0 },
      }),
    ];
    expect(calculateNationTaxIncome('FRA', provinces)).toBe(5);
    expect(calculateNationTaxIncome('ENG', provinces)).toBe(3);
  });
});

describe('regenerateManpower', () => {
  it('adds regenRate to current, capped at max', () => {
    expect(regenerateManpower({ current: 500, max: 1000, regenRate: 50 })).toEqual({
      current: 550,
      max: 1000,
      regenRate: 50,
    });
  });

  it('does not exceed max', () => {
    expect(regenerateManpower({ current: 980, max: 1000, regenRate: 50 })).toEqual({
      current: 1000,
      max: 1000,
      regenRate: 50,
    });
  });

  it('is a no-op at the cap', () => {
    const pool = { current: 1000, max: 1000, regenRate: 50 };
    expect(regenerateManpower(pool)).toBe(pool);
  });
});

describe('economyTick', () => {
  beforeEach(() => {
    useProvinceStore.getState().initialize();
    useNationStore.getState().initialize();
  });

  function seed(): void {
    useNationStore.getState().bulkSet({
      FRA: makeNation({
        id: 'FRA',
        treasury: 100,
        manpower: 0,
        maxManpower: 0,
      }),
      ENG: makeNation({
        id: 'ENG',
        treasury: 100,
        manpower: 0,
        maxManpower: 0,
      }),
    });
    useProvinceStore.getState().bulkSet({
      p1: makeProvince({
        id: 'p1',
        controllerId: 'FRA',
        development: { tax: 5, production: 0, manpower: 0 },
        manpowerPool: { current: 500, max: 1000, regenRate: 50 },
      }),
      p2: makeProvince({
        id: 'p2',
        controllerId: 'FRA',
        development: { tax: 4, production: 0, manpower: 0 },
        manpowerPool: { current: 980, max: 1000, regenRate: 50 },
      }),
      p3: makeProvince({
        id: 'p3',
        controllerId: 'ENG',
        development: { tax: 6, production: 0, manpower: 0 },
        manpowerPool: { current: 400, max: 1000, regenRate: 50 },
      }),
    });
  }

  it('adds tax income to each nation\'s treasury', () => {
    seed();
    economyTick();
    expect(useNationStore.getState().nations.FRA?.treasury).toBe(100 + 9); // 5+4
    expect(useNationStore.getState().nations.ENG?.treasury).toBe(100 + 6);
  });

  it('regenerates manpower in every province (capped at max)', () => {
    seed();
    economyTick();
    expect(useProvinceStore.getState().provinces.p1?.manpowerPool.current).toBe(550);
    expect(useProvinceStore.getState().provinces.p2?.manpowerPool.current).toBe(1000);
    expect(useProvinceStore.getState().provinces.p3?.manpowerPool.current).toBe(450);
  });

  it('rolls province manpower pools up into nation manpower', () => {
    seed();
    economyTick();
    const fra = useNationStore.getState().nations.FRA;
    expect(fra?.manpower).toBe(550 + 1000);
    expect(fra?.maxManpower).toBe(1000 + 1000);
  });

  it('skips occupied provinces for tax and manpower roll-up', () => {
    seed();
    useProvinceStore.getState().updateOccupation('p2', 'ENG');
    economyTick();
    const fra = useNationStore.getState().nations.FRA;
    expect(fra?.treasury).toBe(100 + 5); // p2 is now occupied
    expect(fra?.manpower).toBe(550); // p1 only
    expect(fra?.maxManpower).toBe(1000);
  });

  it('updates cachedIncome and cachedNetMonthly', () => {
    seed();
    economyTick();
    const fra = useNationStore.getState().nations.FRA;
    expect(fra?.cachedIncome.tax).toBe(9);
    expect(fra?.cachedIncome.total).toBe(9);
    expect(fra?.cachedNetMonthly).toBe(9);
  });

  it('is idempotent in the per-nation update — repeated ticks accumulate treasury', () => {
    seed();
    economyTick();
    economyTick();
    const fra = useNationStore.getState().nations.FRA;
    expect(fra?.treasury).toBe(100 + 9 + 9);
  });
});
