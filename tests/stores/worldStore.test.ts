import { describe, it, expect, beforeEach } from 'vitest';
import { useWorldStore } from '@/stores/worldStore';
import type { PauseReason } from '@/types';

describe('worldStore', () => {
  beforeEach(() => {
    useWorldStore.getState().initialize({
      startDate: { year: 1200, month: 1, day: 1 },
      campaignSeed: 'test-seed',
      playerNationId: 'FRA',
    });
  });

  describe('initialize', () => {
    it('seeds the store with the campaign details', () => {
      const s = useWorldStore.getState();
      expect(s.currentDate).toEqual({ year: 1200, month: 1, day: 1 });
      expect(s.campaignStartDate).toEqual({ year: 1200, month: 1, day: 1 });
      expect(s.campaignSeed).toBe('test-seed');
      expect(s.playerNationId).toBe('FRA');
      expect(s.isPaused).toBe(true);
      expect(s.monthsPlayed).toBe(0);
    });
  });

  describe('advanceMonth', () => {
    it('increments the month and monthsPlayed counter', () => {
      useWorldStore.getState().advanceMonth();
      const s = useWorldStore.getState();
      expect(s.currentDate).toEqual({ year: 1200, month: 2, day: 1 });
      expect(s.monthsPlayed).toBe(1);
    });

    it('rolls December → January and increments the year', () => {
      useWorldStore.setState({ currentDate: { year: 1200, month: 12, day: 1 } });
      useWorldStore.getState().advanceMonth();
      expect(useWorldStore.getState().currentDate).toEqual({
        year: 1201,
        month: 1,
        day: 1,
      });
    });
  });

  describe('setSpeed', () => {
    it('updates speedSetting and isPaused', () => {
      useWorldStore.getState().setSpeed(3);
      expect(useWorldStore.getState().speedSetting).toBe(3);
      expect(useWorldStore.getState().isPaused).toBe(false);
    });

    it('setSpeed(0) implicitly pauses', () => {
      useWorldStore.getState().setSpeed(3);
      useWorldStore.getState().setSpeed(0);
      expect(useWorldStore.getState().isPaused).toBe(true);
    });
  });

  describe('togglePause', () => {
    it('toggles isPaused without changing speedSetting', () => {
      useWorldStore.getState().setSpeed(3); // unpaused
      useWorldStore.getState().togglePause();
      expect(useWorldStore.getState().isPaused).toBe(true);
      expect(useWorldStore.getState().speedSetting).toBe(3);
      useWorldStore.getState().togglePause();
      expect(useWorldStore.getState().isPaused).toBe(false);
    });
  });

  describe('pauseWithReasons / clearPauseReasons', () => {
    it('pauses with attached reasons', () => {
      const reasons: PauseReason[] = [{ type: 'ruler_death', priority: 1 }];
      useWorldStore.getState().setSpeed(3);
      useWorldStore.getState().pauseWithReasons(reasons);
      expect(useWorldStore.getState().isPaused).toBe(true);
      expect(useWorldStore.getState().pauseReasons).toEqual(reasons);
    });

    it('clearPauseReasons empties the list (but does not unpause)', () => {
      useWorldStore.getState().pauseWithReasons([
        { type: 'manual', priority: 0 },
      ]);
      useWorldStore.getState().clearPauseReasons();
      expect(useWorldStore.getState().pauseReasons).toEqual([]);
      expect(useWorldStore.getState().isPaused).toBe(true);
    });
  });

  describe('setFlag', () => {
    it('stores arbitrary boolean/number/string values', () => {
      const { setFlag } = useWorldStore.getState();
      setFlag('reformationFired', true);
      setFlag('gunpowderTurn', 47);
      setFlag('campaignName', 'France');
      const flags = useWorldStore.getState().flags;
      expect(flags.reformationFired).toBe(true);
      expect(flags.gunpowderTurn).toBe(47);
      expect(flags.campaignName).toBe('France');
    });

    it('overwrites an existing flag', () => {
      useWorldStore.getState().setFlag('x', 1);
      useWorldStore.getState().setFlag('x', 2);
      expect(useWorldStore.getState().flags.x).toBe(2);
    });
  });

  describe('markScriptedEventFired', () => {
    it('records the event id once and only once', () => {
      const m = useWorldStore.getState().markScriptedEventFired;
      m('french_revolution');
      m('french_revolution');
      expect(useWorldStore.getState().firedScriptedEvents).toEqual([
        'french_revolution',
      ]);
    });
  });

  describe('snapshot / hydrate', () => {
    it('snapshot returns a serializable copy', () => {
      useWorldStore.getState().setSpeed(4);
      useWorldStore.getState().advanceMonth();
      useWorldStore.getState().setFlag('test', 'value');

      const snap = useWorldStore.getState().snapshot();
      // round-trip through JSON to prove serializability
      const json = JSON.stringify(snap);
      const parsed = JSON.parse(json);

      expect(parsed.speedSetting).toBe(4);
      expect(parsed.flags.test).toBe('value');
      expect(parsed.currentDate.month).toBe(2);
    });

    it('snapshot is a deep copy — mutating it does not mutate the store', () => {
      const snap = useWorldStore.getState().snapshot();
      snap.flags.evil = 'mutation';
      snap.firedScriptedEvents.push('hax');
      expect(useWorldStore.getState().flags.evil).toBeUndefined();
      expect(useWorldStore.getState().firedScriptedEvents).toEqual([]);
    });

    it('hydrate restores state from a snapshot', () => {
      useWorldStore.getState().setSpeed(5);
      useWorldStore.getState().advanceMonth();
      const snap = useWorldStore.getState().snapshot();

      // mutate to something else
      useWorldStore.getState().setSpeed(1);
      useWorldStore.getState().advanceMonth();

      useWorldStore.getState().hydrate(snap);

      expect(useWorldStore.getState().speedSetting).toBe(5);
      expect(useWorldStore.getState().monthsPlayed).toBe(snap.monthsPlayed);
      expect(useWorldStore.getState().currentDate).toEqual(snap.currentDate);
    });
  });
});
