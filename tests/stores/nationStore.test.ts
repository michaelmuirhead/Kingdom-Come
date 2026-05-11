import { describe, it, expect, beforeEach } from 'vitest';
import { useNationStore } from '@/stores/nationStore';
import { makeNation } from './fixtures';
import type { Ambition } from '@/types';

describe('nationStore', () => {
  beforeEach(() => {
    useNationStore.getState().initialize();
  });

  describe('setNation / bulkSet', () => {
    it('adds nations and looks them up by id', () => {
      const fra = makeNation({ id: 'FRA' });
      const eng = makeNation({ id: 'ENG' });
      useNationStore.getState().bulkSet({ FRA: fra, ENG: eng });
      expect(useNationStore.getState().nations.FRA?.id).toBe('FRA');
      expect(useNationStore.getState().nations.ENG?.id).toBe('ENG');
    });
  });

  describe('updateTreasury', () => {
    it('adds the delta to the current treasury', () => {
      useNationStore
        .getState()
        .setNation('FRA', makeNation({ id: 'FRA', treasury: 100 }));
      useNationStore.getState().updateTreasury('FRA', 50);
      expect(useNationStore.getState().nations.FRA?.treasury).toBe(150);

      useNationStore.getState().updateTreasury('FRA', -75);
      expect(useNationStore.getState().nations.FRA?.treasury).toBe(75);
    });

    it('is a no-op for unknown nations', () => {
      useNationStore.getState().updateTreasury('UNKNOWN', 100);
      expect(useNationStore.getState().nations.UNKNOWN).toBeUndefined();
    });
  });

  describe('updateManpower / setMaxManpower', () => {
    it('clamps manpower between 0 and max', () => {
      useNationStore.getState().setNation(
        'FRA',
        makeNation({ id: 'FRA', manpower: 5000, maxManpower: 10000 }),
      );
      useNationStore.getState().updateManpower('FRA', 20000); // overshoot
      expect(useNationStore.getState().nations.FRA?.manpower).toBe(10000);
      useNationStore.getState().updateManpower('FRA', -50000); // underflow
      expect(useNationStore.getState().nations.FRA?.manpower).toBe(0);
    });

    it('setMaxManpower clamps current down if it now exceeds the cap', () => {
      useNationStore.getState().setNation(
        'FRA',
        makeNation({ id: 'FRA', manpower: 9000, maxManpower: 10000 }),
      );
      useNationStore.getState().setMaxManpower('FRA', 5000);
      const n = useNationStore.getState().nations.FRA;
      expect(n?.maxManpower).toBe(5000);
      expect(n?.manpower).toBe(5000);
    });
  });

  describe('updatePrestige', () => {
    it('clamps to [-100, 500]', () => {
      useNationStore.getState().setNation(
        'FRA',
        makeNation({ id: 'FRA', prestige: 480 }),
      );
      useNationStore.getState().updatePrestige('FRA', 100);
      expect(useNationStore.getState().nations.FRA?.prestige).toBe(500);
      useNationStore.getState().updatePrestige('FRA', -10000);
      expect(useNationStore.getState().nations.FRA?.prestige).toBe(-100);
    });
  });

  describe('setRuler / setArchetype', () => {
    it('updates ruler and archetype references', () => {
      useNationStore.getState().setNation('FRA', makeNation({ id: 'FRA' }));
      useNationStore.getState().setRuler('FRA', 'char_louis_viii');
      useNationStore.getState().setArchetype('FRA', 'imperialist');
      const n = useNationStore.getState().nations.FRA;
      expect(n?.rulerId).toBe('char_louis_viii');
      expect(n?.archetypeId).toBe('imperialist');
    });
  });

  describe('ambitions', () => {
    it('adds and completes ambitions', () => {
      useNationStore.getState().setNation('FRA', makeNation({ id: 'FRA' }));
      const a: Ambition = {
        id: 'amb_reconquer_normandy',
        type: 'territorial',
        description: 'Take Normandy from England',
        targetProvinceIds: ['prov_normandy'],
        progress: 0,
        startedDate: { year: 1200, month: 1, day: 1 },
        weight: 10,
      };
      useNationStore.getState().addAmbition('FRA', a);
      expect(useNationStore.getState().nations.FRA?.ambitions).toHaveLength(1);
      useNationStore.getState().completeAmbition('FRA', a.id);
      expect(useNationStore.getState().nations.FRA?.ambitions).toEqual([]);
    });
  });

  describe('snapshot / hydrate', () => {
    it('round-trips state through JSON', () => {
      useNationStore.getState().setNation(
        'FRA',
        makeNation({ id: 'FRA', treasury: 250, prestige: 30 }),
      );
      const snap = useNationStore.getState().snapshot();
      const json = JSON.parse(JSON.stringify(snap));

      useNationStore.getState().initialize();
      useNationStore.getState().hydrate(json);

      const n = useNationStore.getState().nations.FRA;
      expect(n?.treasury).toBe(250);
      expect(n?.prestige).toBe(30);
    });
  });
});
