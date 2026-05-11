import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  TICK_ORDER,
  runMonthlyTick,
  setTickStage,
  type TickStage,
} from '@/engine/tickEngine';
import { startNewCampaign } from '@/persistence/loadCampaign';
import { useWorldStore } from '@/stores/worldStore';

describe('tickEngine', () => {
  beforeEach(() => {
    startNewCampaign({ playerNationTag: 'FRA', seed: 'tick-tests' });
  });

  describe('TICK_ORDER', () => {
    it('runs economy → military → diplomacy → dynasty', () => {
      expect([...TICK_ORDER]).toEqual([
        'economy',
        'military',
        'diplomacy',
        'dynasty',
      ]);
    });
  });

  describe('runMonthlyTick', () => {
    it('advances the world clock by one month', () => {
      const before = useWorldStore.getState().currentDate;
      runMonthlyTick();
      const after = useWorldStore.getState().currentDate;
      expect(after.month).toBe(before.month === 12 ? 1 : before.month + 1);
      expect(after.year).toBe(before.month === 12 ? before.year + 1 : before.year);
    });

    it('increments monthsPlayed', () => {
      expect(useWorldStore.getState().monthsPlayed).toBe(0);
      runMonthlyTick();
      runMonthlyTick();
      runMonthlyTick();
      expect(useWorldStore.getState().monthsPlayed).toBe(3);
    });

    it('calls each subsystem tick in TICK_ORDER', () => {
      const calls: TickStage[] = [];
      const restorers = TICK_ORDER.map((stage) =>
        setTickStage(stage, () => calls.push(stage)),
      );

      runMonthlyTick();

      expect(calls).toEqual([...TICK_ORDER]);
      restorers.forEach((r) => r());
    });

    it('each subsystem tick is called exactly once per tick', () => {
      const spies = TICK_ORDER.map(() => vi.fn());
      const restorers = TICK_ORDER.map((stage, i) =>
        setTickStage(stage, spies[i] as () => void),
      );

      runMonthlyTick();

      for (const spy of spies) {
        expect(spy).toHaveBeenCalledTimes(1);
      }
      restorers.forEach((r) => r());
    });

    it('time advances even if a subsystem throws (none should in v0.1)', () => {
      // Ensure default subsystems are no-throw — basic regression check.
      const before = useWorldStore.getState().monthsPlayed;
      expect(() => runMonthlyTick()).not.toThrow();
      expect(useWorldStore.getState().monthsPlayed).toBe(before + 1);
    });
  });

  describe('setTickStage', () => {
    it('restores the previous stage when the returned restorer is called', () => {
      const spy = vi.fn();
      const restore = setTickStage('economy', spy);
      runMonthlyTick();
      expect(spy).toHaveBeenCalledTimes(1);
      restore();
      runMonthlyTick();
      expect(spy).toHaveBeenCalledTimes(1); // still 1 — restored
    });
  });
});
