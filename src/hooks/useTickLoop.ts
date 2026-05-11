'use client';

/**
 * useTickLoop — drives the simulation. While the player isn't paused,
 * fires `runMonthlyTick()` on a setInterval whose period is determined
 * by the current speed setting. Restarts the interval on speed change;
 * tears it down on pause / unmount.
 *
 * Speed → ms mapping per TECH.md Section 8:
 *   1 = 2000ms (slow)   2 = 1000ms   3 = 500ms   4 = 250ms   5 = 100ms (fast)
 *   0 = paused (no interval; isPaused mirrors this)
 */

import { useEffect } from 'react';
import { useWorldStore } from '@/stores/worldStore';
import type { SpeedSetting } from '@/types';
import { runMonthlyTick } from '@/engine/tickEngine';

export const SPEED_MS: Readonly<Record<SpeedSetting, number>> = {
  0: Infinity,
  1: 2000,
  2: 1000,
  3: 500,
  4: 250,
  5: 100,
};

export function useTickLoop(): void {
  const speedSetting = useWorldStore((s) => s.speedSetting);
  const isPaused = useWorldStore((s) => s.isPaused);

  useEffect(() => {
    if (isPaused || speedSetting === 0) return;
    const ms = SPEED_MS[speedSetting];
    if (!Number.isFinite(ms)) return;

    let lastTickAt = Date.now();
    const intervalId = setInterval(() => {
      const now = Date.now();
      const dt = now - lastTickAt;
      lastTickAt = now;

      runMonthlyTick();

      if (
        dt > ms * 2 &&
        process.env.NODE_ENV === 'development'
      ) {
        // eslint-disable-next-line no-console
        console.warn(`Tick took ${dt}ms (budget ${ms}ms)`);
      }
    }, ms);

    return () => clearInterval(intervalId);
  }, [speedSetting, isPaused]);
}
