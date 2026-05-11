import { describe, it, expect, beforeEach } from 'vitest';
import { dynastyTick } from '@/engine/dynasty/tick';
import { handleRulerDeath } from '@/engine/orchestrator';
import { startNewCampaign } from '@/persistence/loadCampaign';
import {
  useDynastyStore,
  useEventQueueStore,
  useNationStore,
  useWorldStore,
} from '@/stores';

describe('dynastyTick (integration with real campaign)', () => {
  beforeEach(() => {
    startNewCampaign({ playerNationTag: 'FRA', seed: 'dynasty-tick-tests' });
  });

  it('drains health on rulers past age 40 over many ticks', () => {
    // Philip II Augustus is 35 in 1200 — still under 40 → no drain
    // immediately. Run forward enough months to pass 40.
    const philipBefore =
      useDynastyStore.getState().characters.char_philip_ii_augustus
        ?.health.current ?? 0;

    // 7 years × 12 months → he's now 42. Should have lost some health.
    for (let i = 0; i < 12 * 7; i++) {
      // advance the world clock so age math reflects each tick
      useWorldStore.getState().advanceMonth();
      dynastyTick();
    }

    const philipAfter =
      useDynastyStore.getState().characters.char_philip_ii_augustus
        ?.health.current ?? 0;
    expect(philipAfter).toBeLessThan(philipBefore);
  });

  it('plot-armored rulers do not die during their armor window', () => {
    // Run 240 months (20 years) — well within everyone's plot armor.
    for (let i = 0; i < 240; i++) {
      useWorldStore.getState().advanceMonth();
      dynastyTick();
    }
    const fraRuler = useDynastyStore.getState().characters.char_philip_ii_augustus;
    expect(fraRuler?.deathDate).toBeNull();
  });

  it('non-armored characters can die under sufficient pressure', () => {
    // Set a 90-year-old non-ruler to terrible health, no plot armor.
    useDynastyStore.getState().updateCharacter('char_enrico_dandolo', {
      birthDate: { year: 1110, month: 1, day: 1 },
      health: { current: 5, max: 100, conditions: [], plotArmor: false },
    });
    // Run several years; mortality should bite eventually.
    let died = false;
    for (let i = 0; i < 240 && !died; i++) {
      useWorldStore.getState().advanceMonth();
      dynastyTick();
      const c = useDynastyStore.getState().characters.char_enrico_dandolo;
      if (c?.deathDate !== null) died = true;
    }
    expect(died).toBe(true);
  });

  it('producing the same death sequence with the same seed (reproducibility)', () => {
    // Strip plot armor from one character, run 60 months, snapshot.
    function runOnce(): { deathMonth: number | null } {
      startNewCampaign({ playerNationTag: 'FRA', seed: 'repro-seed' });
      useDynastyStore.getState().updateCharacter('char_enrico_dandolo', {
        birthDate: { year: 1108, month: 1, day: 1 },
        health: { current: 1, max: 100, conditions: [], plotArmor: false },
      });
      for (let m = 0; m < 60; m++) {
        useWorldStore.getState().advanceMonth();
        dynastyTick();
        if (
          useDynastyStore.getState().characters.char_enrico_dandolo
            ?.deathDate !== null
        ) {
          return { deathMonth: m };
        }
      }
      return { deathMonth: null };
    }

    const a = runOnce();
    const b = runOnce();
    expect(a.deathMonth).toBe(b.deathMonth);
  });
});

describe('handleRulerDeath orchestrator', () => {
  beforeEach(() => {
    startNewCampaign({ playerNationTag: 'FRA', seed: 'ruler-death-tests' });
  });

  it('kills ruler, queues event, pauses, succeeds heir', () => {
    const fra = useNationStore.getState().nations.FRA;
    const philip = useDynastyStore.getState().characters.char_philip_ii_augustus;
    if (!fra || !philip) throw new Error('fixtures missing');

    handleRulerDeath(philip, fra, { year: 1223, month: 7, day: 14 });

    const after = useDynastyStore.getState().characters.char_philip_ii_augustus;
    expect(after?.deathDate).toEqual({ year: 1223, month: 7, day: 14 });
    expect(useNationStore.getState().nations.FRA?.rulerId).toBe('char_louis_viii');
    expect(useWorldStore.getState().isPaused).toBe(true);
    expect(useWorldStore.getState().pauseReasons[0]?.type).toBe('ruler_death');
    const events = useEventQueueStore.getState().pending;
    expect(events.some((e) => e.eventDefinitionId === 'ruler_death')).toBe(true);
    expect(events.some((e) => e.eventDefinitionId === 'succession_complete')).toBe(true);
  });

  it('flags a succession crisis when no heir is available', () => {
    // Innocent III has no children — papacy succession will crisis under
    // the v0.1 primogeniture fallback for elective laws lacking heirs.
    const pap = useNationStore.getState().nations.PAP;
    const innocent = useDynastyStore.getState().characters.char_innocent_iii;
    if (!pap || !innocent) throw new Error('fixtures missing');

    handleRulerDeath(innocent, pap, { year: 1216, month: 7, day: 16 });
    expect(
      useWorldStore.getState().flags['succession_crisis:PAP'],
    ).toBe(true);
  });
});
