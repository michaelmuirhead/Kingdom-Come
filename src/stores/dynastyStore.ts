/**
 * dynastyStore — characters and dynasties.
 *
 * Largest by entity count over time (~500 starting, grows as children
 * are born). Marriages, deaths, and court appointments all flow through
 * here. The `livingCharacters` index lets the dynasty tick skip dead
 * characters cheaply.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type {
  Character,
  CharacterId,
  CourtRole,
  Dynasty,
  DynastyId,
  GameDate,
  NationId,
  TraitId,
} from '@/types';

export interface DynastyStoreSnapshot {
  characters: Record<CharacterId, Character>;
  dynasties: Record<DynastyId, Dynasty>;
}

export interface DynastyStoreState extends DynastyStoreSnapshot {
  // Indices
  charactersByNation: Record<NationId, CharacterId[]>;
  charactersByDynasty: Record<DynastyId, CharacterId[]>;
  livingCharacters: CharacterId[];

  // Character actions
  setCharacter: (id: CharacterId, character: Character) => void;
  updateCharacter: (id: CharacterId, patch: Partial<Character>) => void;
  bulkSetCharacters: (characters: Record<CharacterId, Character>) => void;
  killCharacter: (id: CharacterId, date: GameDate) => void;
  marryCharacters: (a: CharacterId, b: CharacterId) => void;
  assignCourtRole: (id: CharacterId, role: CourtRole | null) => void;
  giveTrait: (id: CharacterId, traitId: TraitId, date: GameDate) => void;

  // Dynasty actions
  setDynasty: (id: DynastyId, dynasty: Dynasty) => void;
  bulkSetDynasties: (dynasties: Record<DynastyId, Dynasty>) => void;

  // Save/load
  snapshot: () => DynastyStoreSnapshot;
  hydrate: (snap: DynastyStoreSnapshot) => void;
  initialize: () => void;
}

function buildIndices(
  characters: Record<CharacterId, Character>,
): Pick<
  DynastyStoreState,
  'charactersByNation' | 'charactersByDynasty' | 'livingCharacters'
> {
  const byNation: Record<NationId, CharacterId[]> = {};
  const byDynasty: Record<DynastyId, CharacterId[]> = {};
  const living: CharacterId[] = [];

  for (const c of Object.values(characters)) {
    if (c.position.nationId) {
      (byNation[c.position.nationId] ??= []).push(c.id);
    }
    (byDynasty[c.dynastyId] ??= []).push(c.id);
    if (c.deathDate === null) living.push(c.id);
  }

  return {
    charactersByNation: byNation,
    charactersByDynasty: byDynasty,
    livingCharacters: living,
  };
}

function applyCharacterChange(
  state: DynastyStoreState,
  id: CharacterId,
  fn: (c: Character) => Character,
): DynastyStoreState | { characters: Record<CharacterId, Character> } {
  const existing = state.characters[id];
  if (!existing) return state;
  const updated = fn(existing);
  return {
    characters: { ...state.characters, [id]: updated },
  };
}

export const useDynastyStore = create<DynastyStoreState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      characters: {},
      dynasties: {},
      charactersByNation: {},
      charactersByDynasty: {},
      livingCharacters: [],

      setCharacter: (id, character) =>
        set(
          (state) => {
            const characters = { ...state.characters, [id]: character };
            return { characters, ...buildIndices(characters) };
          },
          false,
          'dynasty/setCharacter',
        ),

      updateCharacter: (id, patch) =>
        set(
          (state) => {
            const existing = state.characters[id];
            if (!existing) return state;
            const updated: Character = { ...existing, ...patch };
            const characters = { ...state.characters, [id]: updated };
            // Re-index when fields that drive an index change.
            const reindex =
              patch.position !== undefined ||
              patch.deathDate !== undefined ||
              patch.dynastyId !== undefined;
            return reindex
              ? { characters, ...buildIndices(characters) }
              : { characters };
          },
          false,
          'dynasty/updateCharacter',
        ),

      bulkSetCharacters: (characters) =>
        set(
          () => ({ characters: { ...characters }, ...buildIndices(characters) }),
          false,
          'dynasty/bulkSetCharacters',
        ),

      killCharacter: (id, date) =>
        set(
          (state) => {
            const existing = state.characters[id];
            if (!existing) return state;
            if (existing.deathDate !== null) return state;
            const characters = {
              ...state.characters,
              [id]: { ...existing, deathDate: date },
            };
            return { characters, ...buildIndices(characters) };
          },
          false,
          'dynasty/killCharacter',
        ),

      marryCharacters: (aId, bId) =>
        set(
          (state) => {
            const a = state.characters[aId];
            const b = state.characters[bId];
            if (!a || !b) return state;
            const characters = {
              ...state.characters,
              [aId]: {
                ...a,
                family: { ...a.family, spouseId: bId },
              },
              [bId]: {
                ...b,
                family: { ...b.family, spouseId: aId },
              },
            };
            return { characters };
          },
          false,
          'dynasty/marryCharacters',
        ),

      assignCourtRole: (id, role) =>
        set(
          (state) =>
            applyCharacterChange(state, id, (c) => ({
              ...c,
              position: { ...c.position, courtRole: role },
            })),
          false,
          'dynasty/assignCourtRole',
        ),

      giveTrait: (id, traitId, date) =>
        set(
          (state) =>
            applyCharacterChange(state, id, (c) => {
              if (c.traits.some((t) => t.traitId === traitId)) return c;
              return {
                ...c,
                traits: [
                  ...c.traits,
                  { traitId, source: 'event', acquiredDate: date },
                ],
              };
            }),
          false,
          'dynasty/giveTrait',
        ),

      setDynasty: (id, dynasty) =>
        set(
          (state) => ({ dynasties: { ...state.dynasties, [id]: dynasty } }),
          false,
          'dynasty/setDynasty',
        ),

      bulkSetDynasties: (dynasties) =>
        set(
          () => ({ dynasties: { ...dynasties } }),
          false,
          'dynasty/bulkSetDynasties',
        ),

      snapshot: () => ({
        characters: { ...get().characters },
        dynasties: { ...get().dynasties },
      }),

      hydrate: (snap) =>
        set(
          () => ({
            characters: { ...snap.characters },
            dynasties: { ...snap.dynasties },
            ...buildIndices(snap.characters),
          }),
          false,
          'dynasty/hydrate',
        ),

      initialize: () =>
        set(
          () => ({
            characters: {},
            dynasties: {},
            charactersByNation: {},
            charactersByDynasty: {},
            livingCharacters: [],
          }),
          false,
          'dynasty/initialize',
        ),
    })),
    { name: 'dynastyStore' },
  ),
);
