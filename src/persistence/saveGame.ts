/**
 * saveGame — snapshot every persisted store into a serialized save file.
 *
 * UI state isn't included — selections, drawer state, and camera are
 * session-local. Save format includes a `version` field for migrations.
 */

import {
  useDiplomacyStore,
  useDynastyStore,
  useEventQueueStore,
  useMilitaryStore,
  useNationStore,
  useProvinceStore,
  useWorldStore,
} from '@/stores';
import { CURRENT_SAVE_VERSION, type SaveFile } from './migrations';
import { getStorageBackend, slotKey, type StorageBackend } from './storage';

export const MANUAL_SLOTS = ['slot1', 'slot2', 'slot3', 'slot4', 'slot5'] as const;
export const AUTOSAVE_SLOTS = ['autosave_1', 'autosave_2', 'autosave_3'] as const;
export const EMERGENCY_SLOT = 'autosave_emergency';

export type ManualSlot = (typeof MANUAL_SLOTS)[number];
export type AutosaveSlot = (typeof AUTOSAVE_SLOTS)[number];

export function buildSaveFile(): SaveFile {
  const world = useWorldStore.getState().snapshot();
  const provinces = useProvinceStore.getState().snapshot();
  const nations = useNationStore.getState().snapshot();
  const dynasty = useDynastyStore.getState().snapshot();
  const military = useMilitaryStore.getState().snapshot();
  const diplomacy = useDiplomacyStore.getState().snapshot();
  const eventQueue = useEventQueueStore.getState().snapshot();

  const playerNation =
    useNationStore.getState().nations[world.playerNationId];

  return {
    version: CURRENT_SAVE_VERSION,
    savedAt: new Date().toISOString(),
    metadata: {
      inGameDate: world.currentDate,
      playerNationId: world.playerNationId,
      playerNationName: playerNation?.name ?? world.playerNationId,
      monthsPlayed: world.monthsPlayed,
    },
    stores: {
      world,
      provinces,
      nations,
      dynasty,
      military,
      diplomacy,
      eventQueue,
    },
  };
}

export async function saveGame(
  slot: string,
  backend: StorageBackend = getStorageBackend(),
): Promise<void> {
  const save = buildSaveFile();
  const json = JSON.stringify(save);
  await backend.write(slotKey(slot), json);
}

/**
 * Choose the next autosave slot in the three-slot rotation, then write.
 * Rotation key is monthsPlayed / 12 so the rotation is deterministic
 * across runs of the same campaign.
 */
export async function autosave(
  backend: StorageBackend = getStorageBackend(),
): Promise<void> {
  const months = useWorldStore.getState().monthsPlayed;
  const idx = months > 0 ? ((months / 12 - 1) | 0) % AUTOSAVE_SLOTS.length : 0;
  const slot = AUTOSAVE_SLOTS[(idx + AUTOSAVE_SLOTS.length) % AUTOSAVE_SLOTS.length]!;
  await saveGame(slot, backend);
}

export async function emergencyAutosave(
  backend: StorageBackend = getStorageBackend(),
): Promise<void> {
  await saveGame(EMERGENCY_SLOT, backend);
}
