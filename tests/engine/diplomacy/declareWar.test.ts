import { describe, it, expect, beforeEach } from 'vitest';
import { declareWar } from '@/engine/orchestrator';
import { areNationsAtWar } from '@/engine/diplomacy/opinions';
import { startNewCampaign } from '@/persistence/loadCampaign';
import {
  useDiplomacyStore,
  useEventQueueStore,
  useMilitaryStore,
  useWorldStore,
} from '@/stores';

describe('declareWar orchestrator', () => {
  beforeEach(() => {
    startNewCampaign({ playerNationTag: 'FRA', seed: 'declare-war-tests' });
  });

  it('creates a War entity in the military store', () => {
    const warId = declareWar({
      attackerNationId: 'FRA',
      defenderNationId: 'ENG',
      casusBelli: 'conquest',
      now: useWorldStore.getState().currentDate,
    });
    const war = useMilitaryStore.getState().wars[warId];
    expect(war).toBeDefined();
    expect(war?.attackers).toEqual(['FRA']);
    expect(war?.defenders).toEqual(['ENG']);
    expect(war?.casusBelli).toBe('conquest');
    expect(war?.endDate).toBeNull();
  });

  it('adds a -50 opinion modifier in both directions', () => {
    declareWar({
      attackerNationId: 'FRA',
      defenderNationId: 'ENG',
      casusBelli: 'conquest',
      now: useWorldStore.getState().currentDate,
    });
    const opinions = useDiplomacyStore.getState().opinions;
    expect(opinions.FRA?.ENG?.value).toBe(-50);
    expect(opinions.ENG?.FRA?.value).toBe(-50);
    expect(opinions.FRA?.ENG?.modifiers[0]?.source).toBe('Declared war');
  });

  it('queues a war_declared event addressed to the defender', () => {
    declareWar({
      attackerNationId: 'FRA',
      defenderNationId: 'ENG',
      casusBelli: 'conquest',
      now: useWorldStore.getState().currentDate,
    });
    const events = useEventQueueStore.getState().pending;
    const e = events.find((x) => x.eventDefinitionId === 'war_declared');
    expect(e).toBeDefined();
    expect(e?.nationId).toBe('ENG');
    expect(e?.contextParams.attackerNationId).toBe('FRA');
    expect(e?.contextParams.casusBelli).toBe('conquest');
  });

  it('throws on unknown nations', () => {
    expect(() =>
      declareWar({
        attackerNationId: 'FRA',
        defenderNationId: 'XXX',
        casusBelli: 'conquest',
        now: useWorldStore.getState().currentDate,
      }),
    ).toThrow(/unknown nation/);
  });
});

describe('areNationsAtWar', () => {
  beforeEach(() => {
    startNewCampaign({ playerNationTag: 'FRA', seed: 'at-war-tests' });
  });

  it('returns false when no wars exist', () => {
    expect(
      areNationsAtWar('FRA', 'ENG', useMilitaryStore.getState().wars),
    ).toBe(false);
  });

  it('returns true after declareWar between the two', () => {
    declareWar({
      attackerNationId: 'FRA',
      defenderNationId: 'ENG',
      casusBelli: 'conquest',
      now: useWorldStore.getState().currentDate,
    });
    expect(
      areNationsAtWar('FRA', 'ENG', useMilitaryStore.getState().wars),
    ).toBe(true);
    // symmetric
    expect(
      areNationsAtWar('ENG', 'FRA', useMilitaryStore.getState().wars),
    ).toBe(true);
  });

  it('ignores ended wars', () => {
    const warId = declareWar({
      attackerNationId: 'FRA',
      defenderNationId: 'ENG',
      casusBelli: 'conquest',
      now: useWorldStore.getState().currentDate,
    });
    useMilitaryStore.getState().endWar(warId, { year: 1205, month: 5, day: 1 });
    expect(
      areNationsAtWar('FRA', 'ENG', useMilitaryStore.getState().wars),
    ).toBe(false);
  });
});
