/**
 * Tick budget — guard against accidental performance regressions.
 *
 * Per TECH.md §5, a full monthly tick at speed 5 should land under
 * ~200ms on iPad. Our CI box is faster than an iPad, but a 1000-tick
 * average that creeps toward 50ms+ on commodity hardware is a strong
 * signal that we've burned the headroom.
 *
 * Intentionally generous bounds — this test is a tripwire, not a hard
 * benchmark. Tightens as we add real subsystem cost.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { runMonthlyTick } from '@/engine/tickEngine';
import { startNewCampaign } from '@/persistence/loadCampaign';
import { InMemoryBackend, setStorageBackend } from '@/persistence/storage';

describe('tick budget', () => {
  beforeEach(() => {
    // Don't let autosave skew timings via real storage I/O.
    setStorageBackend(new InMemoryBackend());
    startNewCampaign({ playerNationTag: 'FRA', seed: 'tick-budget' });
  });

  it('1000 ticks complete in well under the iPad budget on commodity hardware', () => {
    const TICKS = 1000;
    const start = performance.now();
    for (let i = 0; i < TICKS; i++) runMonthlyTick();
    const elapsed = performance.now() - start;
    const avg = elapsed / TICKS;
    // iPad target is ~200ms / tick at speed 5; CI hardware should be
    // a few orders of magnitude under. Allow up to 50ms / tick before
    // failing — anything that slow on a clean box is a problem.
    expect(avg).toBeLessThan(50);
  });
});
