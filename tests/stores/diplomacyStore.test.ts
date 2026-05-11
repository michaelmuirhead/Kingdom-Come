import { describe, it, expect, beforeEach } from 'vitest';
import { useDiplomacyStore } from '@/stores/diplomacyStore';
import type { OpinionModifier, Treaty } from '@/types';

const D = { year: 1200, month: 1, day: 1 };

describe('diplomacyStore', () => {
  beforeEach(() => {
    useDiplomacyStore.getState().initialize();
  });

  describe('setOpinion', () => {
    it('creates an opinion entry on first set', () => {
      useDiplomacyStore.getState().setOpinion('FRA', 'ENG', -40);
      const s = useDiplomacyStore.getState();
      expect(s.opinions.FRA?.ENG?.value).toBe(-40);
      expect(s.opinions.FRA?.ENG?.modifiers).toEqual([]);
    });

    it('updates an existing entry without losing modifiers', () => {
      const mod: OpinionModifier = {
        source: 'Royal Marriage',
        value: 25,
        appliedDate: D,
        expiresDate: null,
      };
      useDiplomacyStore.getState().addOpinionModifier('FRA', 'ENG', mod);
      useDiplomacyStore.getState().setOpinion('FRA', 'ENG', -10);
      const entry = useDiplomacyStore.getState().opinions.FRA?.ENG;
      expect(entry?.value).toBe(-10);
      expect(entry?.modifiers).toHaveLength(1);
    });

    it('clamps to [-200, 200]', () => {
      useDiplomacyStore.getState().setOpinion('FRA', 'ENG', 500);
      expect(useDiplomacyStore.getState().opinions.FRA?.ENG?.value).toBe(200);
      useDiplomacyStore.getState().setOpinion('FRA', 'ENG', -500);
      expect(useDiplomacyStore.getState().opinions.FRA?.ENG?.value).toBe(-200);
    });
  });

  describe('addOpinionModifier', () => {
    it('accumulates modifiers and recomputes the value as their sum', () => {
      const a: OpinionModifier = { source: 'a', value: 30, appliedDate: D, expiresDate: null };
      const b: OpinionModifier = { source: 'b', value: -10, appliedDate: D, expiresDate: null };
      useDiplomacyStore.getState().addOpinionModifier('FRA', 'ENG', a);
      useDiplomacyStore.getState().addOpinionModifier('FRA', 'ENG', b);
      const entry = useDiplomacyStore.getState().opinions.FRA?.ENG;
      expect(entry?.value).toBe(20);
      expect(entry?.modifiers).toHaveLength(2);
    });
  });

  describe('clearOpinion', () => {
    it('removes an existing entry', () => {
      useDiplomacyStore.getState().setOpinion('FRA', 'ENG', -30);
      useDiplomacyStore.getState().clearOpinion('FRA', 'ENG');
      expect(useDiplomacyStore.getState().opinions.FRA?.ENG).toBeUndefined();
    });
  });

  describe('treaties', () => {
    const treaty: Treaty = {
      id: 't1',
      type: 'alliance',
      signedDate: D,
      expiresDate: null,
      signatoryIds: ['FRA', 'CAS'],
      terms: {},
      broken: false,
    };

    it('signTreaty stores by id', () => {
      useDiplomacyStore.getState().signTreaty(treaty);
      expect(useDiplomacyStore.getState().treaties.t1?.type).toBe('alliance');
    });

    it('breakTreaty flips broken without deleting', () => {
      useDiplomacyStore.getState().signTreaty(treaty);
      useDiplomacyStore.getState().breakTreaty('t1');
      expect(useDiplomacyStore.getState().treaties.t1?.broken).toBe(true);
    });

    it('removeTreaty deletes the record', () => {
      useDiplomacyStore.getState().signTreaty(treaty);
      useDiplomacyStore.getState().removeTreaty('t1');
      expect(useDiplomacyStore.getState().treaties.t1).toBeUndefined();
    });
  });

  describe('snapshot / hydrate', () => {
    it('round-trips through JSON', () => {
      useDiplomacyStore.getState().setOpinion('FRA', 'ENG', -50);
      const snap = useDiplomacyStore.getState().snapshot();
      const restored = JSON.parse(JSON.stringify(snap));
      useDiplomacyStore.getState().initialize();
      useDiplomacyStore.getState().hydrate(restored);
      expect(useDiplomacyStore.getState().opinions.FRA?.ENG?.value).toBe(-50);
    });
  });
});
