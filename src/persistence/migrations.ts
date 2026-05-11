/**
 * Save-format migrations.
 *
 * v0.1 ships only schema version 1. Future versions add cases to
 * `migrate` that walk a save up from its written version to the
 * current. Throw on unknown versions so we never silently load
 * malformed state.
 */

import type {
  DiplomacyStoreSnapshot,
  DynastyStoreSnapshot,
  EventQueueSnapshot,
  MilitaryStoreSnapshot,
  NationStoreSnapshot,
  ProvinceStoreSnapshot,
} from '@/stores';
import type { GameDate, WorldState } from '@/types';

export const CURRENT_SAVE_VERSION = 1 as const;

export interface SaveMetadataV1 {
  inGameDate: GameDate;
  playerNationId: string;
  playerNationName: string;
  monthsPlayed: number;
}

export interface SaveFileV1 {
  version: 1;
  savedAt: string;
  metadata: SaveMetadataV1;
  stores: {
    world: WorldState;
    provinces: ProvinceStoreSnapshot;
    nations: NationStoreSnapshot;
    dynasty: DynastyStoreSnapshot;
    military: MilitaryStoreSnapshot;
    diplomacy: DiplomacyStoreSnapshot;
    eventQueue: EventQueueSnapshot;
  };
}

export type SaveFile = SaveFileV1;

interface UnknownSave {
  version?: number;
}

export function migrate(raw: unknown): SaveFile {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Save file is not an object');
  }
  const save = raw as UnknownSave;
  if (save.version === undefined) {
    throw new Error('Save file has no version field');
  }
  if (save.version === CURRENT_SAVE_VERSION) {
    return raw as SaveFile;
  }
  if (save.version > CURRENT_SAVE_VERSION) {
    throw new Error(
      `Save version ${save.version} is newer than this build supports (${CURRENT_SAVE_VERSION})`,
    );
  }
  throw new Error(`Unsupported save version: ${save.version}`);
}
