/**
 * loadGame — read a save slot, validate, migrate, and hydrate every
 * persisted store. UI state is reset on load so opening drawers /
 * selections from the previous session don't leak into the loaded one.
 */

import {
  useDiplomacyStore,
  useDynastyStore,
  useEventQueueStore,
  useMilitaryStore,
  useNationStore,
  useProvinceStore,
  useUIStore,
  useWorldStore,
} from '@/stores';
import { migrate, type SaveFile, type SaveMetadataV1 } from './migrations';
import {
  getStorageBackend,
  slotKey,
  type StorageBackend,
} from './storage';

export interface SaveSummary {
  slot: string;
  savedAt: string;
  metadata: SaveMetadataV1;
}

export async function loadGame(
  slot: string,
  backend: StorageBackend = getStorageBackend(),
): Promise<SaveSummary> {
  const json = await backend.read(slotKey(slot));
  if (!json) {
    throw new Error(`No save in slot "${slot}"`);
  }
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Save in slot "${slot}" is not valid JSON: ${msg}`);
  }
  const save = migrate(raw);
  hydrateStoresFromSave(save);
  return { slot, savedAt: save.savedAt, metadata: save.metadata };
}

export function hydrateStoresFromSave(save: SaveFile): void {
  // Reset UI state before swapping data underneath it.
  useUIStore.getState().initialize();
  useWorldStore.getState().hydrate(save.stores.world);
  useProvinceStore.getState().hydrate(save.stores.provinces);
  useNationStore.getState().hydrate(save.stores.nations);
  useDynastyStore.getState().hydrate(save.stores.dynasty);
  useMilitaryStore.getState().hydrate(save.stores.military);
  useDiplomacyStore.getState().hydrate(save.stores.diplomacy);
  useEventQueueStore.getState().hydrate(save.stores.eventQueue);
}

export async function listSaves(
  prefix: string,
  backend: StorageBackend = getStorageBackend(),
): Promise<SaveSummary[]> {
  const keys = await backend.list(slotKey(prefix));
  const summaries: SaveSummary[] = [];
  for (const key of keys) {
    const json = await backend.read(key);
    if (!json) continue;
    try {
      const raw = JSON.parse(json);
      const save = migrate(raw);
      summaries.push({
        slot: key.replace(slotKey(''), ''),
        savedAt: save.savedAt,
        metadata: save.metadata,
      });
    } catch {
      // Silently skip malformed entries — listSaves is read-only.
    }
  }
  return summaries;
}

export async function deleteSave(
  slot: string,
  backend: StorageBackend = getStorageBackend(),
): Promise<void> {
  await backend.remove(slotKey(slot));
}
