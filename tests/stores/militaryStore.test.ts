import { describe, it, expect, beforeEach } from 'vitest';
import { useMilitaryStore } from '@/stores/militaryStore';
import type { Army, Battle, BattleResult, War } from '@/types';

const D = { year: 1200, month: 1, day: 1 };

function makeArmy(over: Partial<Army> & { id: string }): Army {
  const { id, ...rest } = over;
  return {
    id,
    nationId: 'FRA',
    name: `Army ${id}`,
    regiments: [],
    provinceId: 'prov_ile_de_france',
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

function makeWar(over: Partial<War> & { id: string }): War {
  const { id, ...rest } = over;
  return {
    id,
    name: 'Anglo-French War',
    startDate: D,
    endDate: null,
    attackers: ['FRA'],
    defenders: ['ENG'],
    warLeader: { attacker: 'FRA', defender: 'ENG' },
    warGoals: [],
    casusBelli: 'conquest',
    warScore: 0,
    battlesIds: [],
    siegesIds: [],
    occupiedProvinces: [],
    ...rest,
  };
}

function makeBattle(over: Partial<Battle> & { id: string }): Battle {
  const { id, ...rest } = over;
  return {
    id,
    provinceId: 'prov_normandy',
    attackerArmyIds: [],
    defenderArmyIds: [],
    combatWidth: 20,
    startDate: D,
    resolved: false,
    ...rest,
  };
}

describe('militaryStore', () => {
  beforeEach(() => {
    useMilitaryStore.getState().initialize();
  });

  describe('createArmy / disbandArmy', () => {
    it('createArmy indexes by nation and province', () => {
      const a = makeArmy({ id: 'army_1', nationId: 'FRA', provinceId: 'p1' });
      useMilitaryStore.getState().createArmy(a);
      const s = useMilitaryStore.getState();
      expect(s.armies.army_1?.nationId).toBe('FRA');
      expect(s.armiesByNation.FRA).toContain('army_1');
      expect(s.armiesByProvince.p1).toContain('army_1');
    });

    it('disbandArmy removes from store and indices', () => {
      useMilitaryStore.getState().createArmy(makeArmy({ id: 'a', nationId: 'FRA', provinceId: 'p' }));
      useMilitaryStore.getState().disbandArmy('a');
      const s = useMilitaryStore.getState();
      expect(s.armies.a).toBeUndefined();
      expect(s.armiesByNation.FRA ?? []).not.toContain('a');
    });
  });

  describe('moveArmy / setArmyLocation', () => {
    it('moveArmy sets target without changing provinceId', () => {
      useMilitaryStore.getState().createArmy(makeArmy({ id: 'a', provinceId: 'p1' }));
      useMilitaryStore.getState().moveArmy('a', 'p2');
      expect(useMilitaryStore.getState().armies.a?.movementTarget).toBe('p2');
      expect(useMilitaryStore.getState().armies.a?.provinceId).toBe('p1');
    });

    it('setArmyLocation re-indexes by province and clears the target', () => {
      useMilitaryStore.getState().createArmy(makeArmy({ id: 'a', provinceId: 'p1' }));
      useMilitaryStore.getState().moveArmy('a', 'p2');
      useMilitaryStore.getState().setArmyLocation('a', 'p2');
      const s = useMilitaryStore.getState();
      expect(s.armies.a?.provinceId).toBe('p2');
      expect(s.armies.a?.movementTarget).toBeNull();
      expect(s.armiesByProvince.p1 ?? []).not.toContain('a');
      expect(s.armiesByProvince.p2).toContain('a');
    });
  });

  describe('wars', () => {
    it('declareWar adds the war', () => {
      useMilitaryStore.getState().declareWar(makeWar({ id: 'w1' }));
      expect(useMilitaryStore.getState().wars.w1?.id).toBe('w1');
    });

    it('endWar sets endDate', () => {
      useMilitaryStore.getState().declareWar(makeWar({ id: 'w1' }));
      useMilitaryStore.getState().endWar('w1', { year: 1203, month: 5, day: 1 });
      expect(useMilitaryStore.getState().wars.w1?.endDate?.year).toBe(1203);
    });

    it('updateWarScore clamps to [-100, 100]', () => {
      useMilitaryStore.getState().declareWar(makeWar({ id: 'w1', warScore: 80 }));
      useMilitaryStore.getState().updateWarScore('w1', 50);
      expect(useMilitaryStore.getState().wars.w1?.warScore).toBe(100);
      useMilitaryStore.getState().updateWarScore('w1', -1000);
      expect(useMilitaryStore.getState().wars.w1?.warScore).toBe(-100);
    });
  });

  describe('battles', () => {
    it('startBattle adds an unresolved battle', () => {
      useMilitaryStore.getState().startBattle(makeBattle({ id: 'b1' }));
      expect(useMilitaryStore.getState().battles.b1?.resolved).toBe(false);
    });

    it('resolveBattle attaches a result and marks resolved', () => {
      useMilitaryStore.getState().startBattle(makeBattle({ id: 'b1' }));
      const result: BattleResult = {
        winnerId: 'FRA',
        attackerCasualties: 200,
        defenderCasualties: 800,
        generalsKilled: [],
        generalsWounded: [],
      };
      useMilitaryStore.getState().resolveBattle('b1', result);
      const b = useMilitaryStore.getState().battles.b1;
      expect(b?.resolved).toBe(true);
      expect(b?.result?.winnerId).toBe('FRA');
    });
  });

  describe('snapshot / hydrate', () => {
    it('round-trips through JSON', () => {
      useMilitaryStore.getState().createArmy(makeArmy({ id: 'a' }));
      useMilitaryStore.getState().declareWar(makeWar({ id: 'w' }));
      const snap = useMilitaryStore.getState().snapshot();
      const restored = JSON.parse(JSON.stringify(snap));

      useMilitaryStore.getState().initialize();
      useMilitaryStore.getState().hydrate(restored);
      const s = useMilitaryStore.getState();
      expect(s.armies.a?.id).toBe('a');
      expect(s.wars.w?.id).toBe('w');
    });
  });
});
