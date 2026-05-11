import { describe, it, expect, beforeEach } from 'vitest';
import { startNewCampaign } from '@/persistence/loadCampaign';
import { economyTick } from '@/engine/economy/tick';
import { useNationStore } from '@/stores/nationStore';
import { useProvinceStore } from '@/stores/provinceStore';

describe('economyTick against the real 1200 campaign', () => {
  beforeEach(() => {
    startNewCampaign({ playerNationTag: 'FRA', seed: 'economy-integration' });
  });

  it('grows treasury by the sum of FRA-owned non-occupied development.tax', () => {
    const before = useNationStore.getState().nations.FRA;
    if (!before) throw new Error('FRA missing');

    let expectedGain = 0;
    for (const p of Object.values(useProvinceStore.getState().provinces)) {
      if (p.controllerId !== 'FRA') continue;
      if (p.occupierId !== null) continue;
      expectedGain += p.development.tax;
    }
    expect(expectedGain).toBeGreaterThan(0);

    economyTick();

    const after = useNationStore.getState().nations.FRA;
    expect(after?.treasury).toBe(before.treasury + expectedGain);
    expect(after?.cachedIncome.tax).toBe(expectedGain);
  });

  it('regenerates manpower in every province', () => {
    const beforeMap = new Map<string, number>();
    for (const [id, p] of Object.entries(
      useProvinceStore.getState().provinces,
    )) {
      beforeMap.set(id, p.manpowerPool.current);
    }

    economyTick();

    for (const [id, p] of Object.entries(
      useProvinceStore.getState().provinces,
    )) {
      const before = beforeMap.get(id) ?? 0;
      expect(p.manpowerPool.current, id).toBeGreaterThanOrEqual(before);
      expect(p.manpowerPool.current, id).toBeLessThanOrEqual(p.manpowerPool.max);
    }
  });

  it('FRA manpower equals the sum of its provinces', () => {
    economyTick();
    let provincesSum = 0;
    for (const p of Object.values(useProvinceStore.getState().provinces)) {
      if (p.controllerId !== 'FRA' || p.occupierId !== null) continue;
      provincesSum += p.manpowerPool.current;
    }
    expect(useNationStore.getState().nations.FRA?.manpower).toBe(provincesSum);
  });

  it('twelve months of ticks grow FRA treasury by 12× per-month tax', () => {
    const startTreasury = useNationStore.getState().nations.FRA?.treasury ?? 0;
    economyTick(); // tick 1
    const perMonth = useNationStore.getState().nations.FRA?.cachedIncome.tax ?? 0;

    for (let i = 0; i < 11; i++) economyTick(); // ticks 2..12

    const endTreasury = useNationStore.getState().nations.FRA?.treasury ?? 0;
    expect(endTreasury).toBe(startTreasury + perMonth * 12);
  });
});
