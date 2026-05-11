import { describe, it, expect, beforeEach } from 'vitest';
import { startNewCampaign, validateContent } from '@/persistence/loadCampaign';
import {
  useDynastyStore,
  useEventQueueStore,
  useNationStore,
  useProvinceStore,
  useWorldStore,
  useDiplomacyStore,
  useMilitaryStore,
} from '@/stores';

describe('loadCampaign', () => {
  describe('validateContent', () => {
    it('returns ok=true for v0.1 authored content', () => {
      const r = validateContent();
      if (!r.ok) {
        throw new Error(
          `Unexpected validation issues:\n${r.issues
            .map((i) => `  [${i.kind}] ${i.entityId}: ${i.message}`)
            .join('\n')}`,
        );
      }
      expect(r.ok).toBe(true);
      expect(r.issues).toEqual([]);
    });
  });

  describe('startNewCampaign', () => {
    beforeEach(() => {
      useWorldStore.getState().initialize({
        startDate: { year: 1100, month: 1, day: 1 },
        campaignSeed: '',
        playerNationId: '',
      });
      useProvinceStore.getState().initialize();
      useNationStore.getState().initialize();
      useDynastyStore.getState().initialize();
      useMilitaryStore.getState().initialize();
      useDiplomacyStore.getState().initialize();
      useEventQueueStore.getState().initialize();
    });

    it('hydrates every store with authored content', () => {
      const summary = startNewCampaign({
        playerNationTag: 'FRA',
        seed: 'test-campaign',
      });

      expect(summary.playerNationId).toBe('FRA');
      expect(summary.seed).toBe('test-campaign');
      expect(summary.provinceCount).toBeGreaterThanOrEqual(40);
      expect(summary.nationCount).toBeGreaterThanOrEqual(10);
      expect(summary.characterCount).toBeGreaterThanOrEqual(18);

      const provinces = useProvinceStore.getState().provinces;
      const nations = useNationStore.getState().nations;
      const characters = useDynastyStore.getState().characters;
      const dynasties = useDynastyStore.getState().dynasties;

      expect(Object.keys(provinces).length).toBe(summary.provinceCount);
      expect(Object.keys(nations).length).toBe(summary.nationCount);
      expect(Object.keys(characters).length).toBe(summary.characterCount);
      expect(Object.keys(dynasties).length).toBeGreaterThanOrEqual(10);

      // Index rebuild check — provinces index by nation should be populated.
      expect(useProvinceStore.getState().provincesByNation.FRA?.length).toBeGreaterThan(0);
      expect(useDynastyStore.getState().livingCharacters.length).toBe(
        summary.characterCount,
      );
    });

    it('primes the world clock with the requested seed and start date', () => {
      startNewCampaign({ playerNationTag: 'ENG', seed: 'eng-2026' });
      const w = useWorldStore.getState();
      expect(w.currentDate).toEqual({ year: 1200, month: 1, day: 1 });
      expect(w.campaignStartDate).toEqual({ year: 1200, month: 1, day: 1 });
      expect(w.campaignSeed).toBe('eng-2026');
      expect(w.playerNationId).toBe('ENG');
      expect(w.isPaused).toBe(true);
      expect(w.speedSetting).toBe(0);
    });

    it('generates a seed when none is provided', () => {
      const summary = startNewCampaign({ playerNationTag: 'FRA' });
      expect(summary.seed.length).toBeGreaterThan(0);
    });

    it('resets the event queue and military / diplomacy stores', () => {
      useEventQueueStore
        .getState()
        .queueEvent({
          id: 'stale',
          eventDefinitionId: 'def',
          nationId: 'X',
          triggeredDate: { year: 1199, month: 1, day: 1 },
          contextParams: {},
        });
      useMilitaryStore.getState().createArmy({
        id: 'stale_army',
        nationId: 'FRA',
        name: 'leftover',
        regiments: [],
        provinceId: 'prov_ile_de_france',
        movementTarget: null,
        movementProgress: 0,
        generalId: null,
        morale: 100,
        organization: 100,
        attritionMonth: 0,
        inBattle: null,
        inSiege: null,
        isEmbarked: false,
        embarkedOnFleetId: null,
      });

      startNewCampaign({ playerNationTag: 'FRA' });
      expect(useEventQueueStore.getState().pending).toEqual([]);
      expect(Object.keys(useMilitaryStore.getState().armies)).toEqual([]);
    });

    it('throws on an unknown player nation tag', () => {
      expect(() =>
        startNewCampaign({ playerNationTag: 'NOPE' }),
      ).toThrow(/Unknown player nation/);
    });

    it('resolves every nation ruler against the dynasty store', () => {
      startNewCampaign({ playerNationTag: 'FRA' });
      const characters = useDynastyStore.getState().characters;
      for (const n of Object.values(useNationStore.getState().nations)) {
        expect(characters[n.rulerId], `${n.id} ruler missing`).toBeDefined();
      }
    });

    it('two campaigns with the same seed produce identical world state', () => {
      startNewCampaign({ playerNationTag: 'FRA', seed: 'deterministic' });
      const a = useWorldStore.getState().snapshot();

      startNewCampaign({ playerNationTag: 'FRA', seed: 'deterministic' });
      const b = useWorldStore.getState().snapshot();

      expect(a).toEqual(b);
    });
  });
});
