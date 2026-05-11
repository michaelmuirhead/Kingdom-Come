/**
 * Pure manpower regeneration. Each tick, the current pool grows by
 * `regenRate`, capped at `max`. Authored content uses regenRate = 5%
 * of max, so manpower fully refills in roughly 20 months — matching
 * the design baseline.
 */

import type { Province } from '@/types';

export function regenerateManpower(
  pool: Province['manpowerPool'],
): Province['manpowerPool'] {
  if (pool.current >= pool.max) return pool;
  const next = pool.current + pool.regenRate;
  return {
    ...pool,
    current: next > pool.max ? pool.max : next,
  };
}
