import { describe, it, expect, beforeEach } from 'vitest';
import { runMonthlyTick, setTickStage } from '@/engine/tickEngine';
import { startNewCampaign } from '@/persistence/loadCampaign';
import { loadGame } from '@/persistence/loadGame';
import { saveGame } from '@/persistence/saveGame';
import { InMemoryBackend, setStorageBackend } from '@/persistence/storage';
import {
  useDynastyStore,
  useNationStore,
  useProvinceStore,
  useWorldStore,
} from '@/stores';

describe('save → reload → continue produces matching state', () => {
  let backend: InMemoryBackend;

  beforeEach(() => {
    backend = new InMemoryBackend();
    setStorageBackend(backend);
  });

  it('12-month continuous play === 12-month save+reload+play', async () => {
    // Disable subsystem ticks so the only entropy source is the world
    // clock; we just want to prove the snapshot/hydrate path matches a
    // continuous play.
    const restorers = [
      setTickStage('economy', () => {}),
      setTickStage('military', () => {}),
      setTickStage('diplomacy', () => {}),
      setTickStage('dynasty', () => {}),
    ];

    // Continuous run.
    startNewCampaign({
      playerNationTag: 'FRA',
      seed: 'continuous-run',
    });
    for (let i = 0; i < 12; i++) runMonthlyTick();
    const continuousState = {
      date: useWorldStore.getState().currentDate,
      monthsPlayed: useWorldStore.getState().monthsPlayed,
      provinceCount: Object.keys(useProvinceStore.getState().provinces).length,
      nationCount: Object.keys(useNationStore.getState().nations).length,
      characterCount: Object.keys(useDynastyStore.getState().characters).length,
    };

    // Reset + run 6 months, save, run 6 more, save → compare against
    // round-trip through localStorage.
    startNewCampaign({
      playerNationTag: 'FRA',
      seed: 'continuous-run',
    });
    for (let i = 0; i < 6; i++) runMonthlyTick();
    await saveGame('roundtrip', backend);

    // Continue from save.
    startNewCampaign({
      playerNationTag: 'FRA',
      seed: 'continuous-run',
    });
    await loadGame('roundtrip', backend);
    for (let i = 0; i < 6; i++) runMonthlyTick();
    const reloadedState = {
      date: useWorldStore.getState().currentDate,
      monthsPlayed: useWorldStore.getState().monthsPlayed,
      provinceCount: Object.keys(useProvinceStore.getState().provinces).length,
      nationCount: Object.keys(useNationStore.getState().nations).length,
      characterCount: Object.keys(useDynastyStore.getState().characters).length,
    };

    expect(reloadedState).toEqual(continuousState);

    restorers.forEach((r) => r());
  });

  it('hydrate restores indices like provincesByNation', async () => {
    startNewCampaign({ playerNationTag: 'FRA', seed: 'index-test' });
    // Force an ownership change so the index is meaningful.
    useProvinceStore.getState().updateOwnership('prov_normandy', 'FRA');
    await saveGame('idx', backend);

    // Wipe state, then load.
    startNewCampaign({ playerNationTag: 'FRA', seed: 'index-test' });
    await loadGame('idx', backend);

    const idx = useProvinceStore.getState().provincesByNation.FRA;
    expect(idx).toContain('prov_normandy');
  });
});
