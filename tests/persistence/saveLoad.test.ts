import { describe, it, expect, beforeEach } from 'vitest';
import {
  AUTOSAVE_SLOTS,
  autosave,
  buildSaveFile,
  emergencyAutosave,
  saveGame,
} from '@/persistence/saveGame';
import { deleteSave, listSaves, loadGame } from '@/persistence/loadGame';
import { CURRENT_SAVE_VERSION, migrate } from '@/persistence/migrations';
import {
  InMemoryBackend,
  setStorageBackend,
  slotKey,
} from '@/persistence/storage';
import { startNewCampaign } from '@/persistence/loadCampaign';
import {
  useDynastyStore,
  useMilitaryStore,
  useNationStore,
  useProvinceStore,
  useWorldStore,
} from '@/stores';

describe('save/load', () => {
  let backend: InMemoryBackend;

  beforeEach(() => {
    backend = new InMemoryBackend();
    setStorageBackend(backend);
    startNewCampaign({ playerNationTag: 'FRA', seed: 'save-load-tests' });
  });

  describe('buildSaveFile', () => {
    it('includes the current version and a savedAt timestamp', () => {
      const save = buildSaveFile();
      expect(save.version).toBe(CURRENT_SAVE_VERSION);
      expect(Date.parse(save.savedAt)).not.toBeNaN();
    });

    it('includes metadata that surfaces in a save listing', () => {
      const save = buildSaveFile();
      expect(save.metadata.playerNationId).toBe('FRA');
      expect(save.metadata.playerNationName).toBe('Kingdom of France');
      expect(save.metadata.inGameDate).toEqual({ year: 1200, month: 1, day: 1 });
      expect(save.metadata.monthsPlayed).toBe(0);
    });

    it('includes a snapshot of every persisted store', () => {
      const save = buildSaveFile();
      expect(save.stores.world).toBeDefined();
      expect(save.stores.provinces).toBeDefined();
      expect(save.stores.nations).toBeDefined();
      expect(save.stores.dynasty).toBeDefined();
      expect(save.stores.military).toBeDefined();
      expect(save.stores.diplomacy).toBeDefined();
      expect(save.stores.eventQueue).toBeDefined();
    });
  });

  describe('saveGame / loadGame round-trip', () => {
    it('round-trips treasury, manpower, and dynasty state', async () => {
      // Mutate.
      useNationStore.getState().updateTreasury('FRA', 1234);
      useWorldStore.getState().advanceMonth();
      useWorldStore.getState().advanceMonth();
      const before = {
        treasury: useNationStore.getState().nations.FRA?.treasury,
        monthsPlayed: useWorldStore.getState().monthsPlayed,
        date: useWorldStore.getState().currentDate,
      };

      await saveGame('slot1', backend);

      // Mutate further so the load has to actually restore.
      useNationStore.getState().updateTreasury('FRA', -9999);
      useWorldStore.getState().advanceMonth();
      expect(useNationStore.getState().nations.FRA?.treasury).not.toBe(
        before.treasury,
      );

      await loadGame('slot1', backend);

      expect(useNationStore.getState().nations.FRA?.treasury).toBe(
        before.treasury,
      );
      expect(useWorldStore.getState().monthsPlayed).toBe(before.monthsPlayed);
      expect(useWorldStore.getState().currentDate).toEqual(before.date);
    });

    it('writes JSON to the slotKey namespace', async () => {
      await saveGame('slot1', backend);
      const raw = await backend.read(slotKey('slot1'));
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw as string);
      expect(parsed.version).toBe(CURRENT_SAVE_VERSION);
    });

    it('throws on missing slot', async () => {
      await expect(loadGame('nonexistent', backend)).rejects.toThrow(/No save/);
    });

    it('throws on garbage JSON', async () => {
      await backend.write(slotKey('garbage'), 'not-json');
      await expect(loadGame('garbage', backend)).rejects.toThrow(/JSON/);
    });

    it('throws on unsupported version', async () => {
      await backend.write(slotKey('future'), JSON.stringify({ version: 99 }));
      await expect(loadGame('future', backend)).rejects.toThrow(
        /version.*newer/i,
      );
    });
  });

  describe('autosave rotation', () => {
    it('writes to the autosave_N rotation slot', async () => {
      // Force monthsPlayed forward 12, 24, 36, 48 and run autosave each
      // time; we should land in slot 1 → 2 → 3 → 1.
      const slotsWritten: string[] = [];
      for (const months of [12, 24, 36, 48]) {
        useWorldStore.setState({ monthsPlayed: months });
        await autosave(backend);
        const keys = await backend.list(slotKey('autosave_'));
        slotsWritten.push(keys.join(','));
      }
      // After 4 ticks we expect at least slots 1, 2, 3 to all be present.
      for (const slot of AUTOSAVE_SLOTS) {
        expect(await backend.read(slotKey(slot))).not.toBeNull();
      }
    });
  });

  describe('emergencyAutosave', () => {
    it('writes to the autosave_emergency slot', async () => {
      await emergencyAutosave(backend);
      const raw = await backend.read(slotKey('autosave_emergency'));
      expect(raw).not.toBeNull();
    });
  });

  describe('listSaves', () => {
    it('returns metadata for every save in the namespace', async () => {
      await saveGame('slot1', backend);
      await saveGame('slot3', backend);
      const summaries = await listSaves('', backend);
      expect(summaries.length).toBe(2);
      const slots = summaries.map((s) => s.slot).sort();
      expect(slots).toEqual(['slot1', 'slot3']);
      const slot1 = summaries.find((s) => s.slot === 'slot1');
      expect(slot1?.metadata.playerNationName).toBe('Kingdom of France');
    });

    it('skips corrupted entries silently', async () => {
      await saveGame('slot1', backend);
      await backend.write(slotKey('slot_bad'), '{"not":"a save"}');
      const summaries = await listSaves('', backend);
      expect(summaries.map((s) => s.slot)).toContain('slot1');
      expect(summaries.map((s) => s.slot)).not.toContain('slot_bad');
    });
  });

  describe('deleteSave', () => {
    it('removes a save from the backend', async () => {
      await saveGame('slot1', backend);
      await deleteSave('slot1', backend);
      const summaries = await listSaves('', backend);
      expect(summaries).toEqual([]);
    });
  });

  describe('migrate', () => {
    it('passes through current-version saves untouched', () => {
      const save = buildSaveFile();
      expect(migrate(save)).toBe(save);
    });

    it('throws for missing version field', () => {
      expect(() => migrate({})).toThrow(/version/);
    });

    it('throws for newer-than-current versions', () => {
      expect(() => migrate({ version: 999 })).toThrow(/newer/);
    });
  });
});
