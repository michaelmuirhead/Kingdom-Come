import { describe, it, expect, beforeEach } from 'vitest';
import {
  ARMY_GOLD_PER_REGIMENT,
  ARMY_MANPOWER_PER_REGIMENT,
  raiseArmy,
} from '@/engine/orchestrator';
import { startNewCampaign } from '@/persistence/loadCampaign';
import { useMilitaryStore, useNationStore } from '@/stores';

describe('raiseArmy orchestrator', () => {
  beforeEach(() => {
    startNewCampaign({ playerNationTag: 'FRA', seed: 'raise-army-tests' });
  });

  it('spawns an army in the controller capital and deducts cost', () => {
    const beforeT = useNationStore.getState().nations.FRA?.treasury ?? 0;
    const beforeM = useNationStore.getState().nations.FRA?.manpower ?? 0;

    const armyId = raiseArmy({ nationId: 'FRA', regimentCount: 2 });

    const army = useMilitaryStore.getState().armies[armyId];
    expect(army).toBeDefined();
    expect(army?.nationId).toBe('FRA');
    expect(army?.provinceId).toBe('prov_ile_de_france'); // FRA capital
    expect(army?.regiments).toHaveLength(2);
    const after = useNationStore.getState().nations.FRA;
    expect(after?.treasury).toBe(beforeT - ARMY_GOLD_PER_REGIMENT * 2);
    expect(after?.manpower).toBe(beforeM - ARMY_MANPOWER_PER_REGIMENT * 2);
  });

  it('throws on regimentCount <= 0', () => {
    expect(() =>
      raiseArmy({ nationId: 'FRA', regimentCount: 0 }),
    ).toThrow(/regimentCount/);
  });

  it('throws when the nation cannot afford the cost (gold)', () => {
    useNationStore.getState().updateTreasury('FRA', -10_000);
    expect(() =>
      raiseArmy({ nationId: 'FRA', regimentCount: 2 }),
    ).toThrow(/treasury/);
  });

  it('throws when the nation cannot afford the cost (manpower)', () => {
    // Drain manpower fully so the manpower check fires.
    useNationStore.getState().setMaxManpower('FRA', 0);
    expect(() =>
      raiseArmy({ nationId: 'FRA', regimentCount: 2 }),
    ).toThrow(/manpower/);
  });

  it('throws on unknown nation', () => {
    expect(() =>
      raiseArmy({ nationId: 'XXX', regimentCount: 2 }),
    ).toThrow(/unknown nation/);
  });
});
