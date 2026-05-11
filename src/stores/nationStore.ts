/**
 * nationStore — all nations in the world.
 *
 * Treasury/manpower/prestige/legitimacy/stability are mutated frequently
 * (every economy tick, every battle). Use the narrow update helpers
 * rather than spreading whole Nation objects to keep selector
 * subscriptions tight.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type {
  Ambition,
  ArchetypeId,
  CharacterId,
  Nation,
  NationId,
} from '@/types';

export interface NationStoreSnapshot {
  nations: Record<NationId, Nation>;
}

export interface NationStoreState {
  nations: Record<NationId, Nation>;

  // Actions
  setNation: (id: NationId, nation: Nation) => void;
  updateNation: (id: NationId, patch: Partial<Nation>) => void;
  bulkSet: (nations: Record<NationId, Nation>) => void;

  updateTreasury: (id: NationId, delta: number) => void;
  updateManpower: (id: NationId, delta: number) => void;
  setMaxManpower: (id: NationId, max: number) => void;
  updatePrestige: (id: NationId, delta: number) => void;
  updateStability: (id: NationId, delta: number) => void;

  setRuler: (id: NationId, rulerId: CharacterId) => void;
  setArchetype: (id: NationId, archetypeId: ArchetypeId) => void;

  addAmbition: (id: NationId, ambition: Ambition) => void;
  completeAmbition: (id: NationId, ambitionId: string) => void;

  // Save/load
  snapshot: () => NationStoreSnapshot;
  hydrate: (snap: NationStoreSnapshot) => void;
  initialize: () => void;
}

function clamp(v: number, min: number, max: number): number {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

function mutate(
  state: NationStoreState,
  id: NationId,
  fn: (n: Nation) => Nation,
): Pick<NationStoreState, 'nations'> | NationStoreState {
  const existing = state.nations[id];
  if (!existing) return state;
  return {
    nations: { ...state.nations, [id]: fn(existing) },
  };
}

export const useNationStore = create<NationStoreState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      nations: {},

      setNation: (id, nation) =>
        set(
          (state) => ({ nations: { ...state.nations, [id]: nation } }),
          false,
          'nation/setNation',
        ),

      updateNation: (id, patch) =>
        set(
          (state) =>
            mutate(state, id, (n) => ({ ...n, ...patch })),
          false,
          'nation/updateNation',
        ),

      bulkSet: (nations) =>
        set(() => ({ nations: { ...nations } }), false, 'nation/bulkSet'),

      updateTreasury: (id, delta) =>
        set(
          (state) =>
            mutate(state, id, (n) => ({ ...n, treasury: n.treasury + delta })),
          false,
          'nation/updateTreasury',
        ),

      updateManpower: (id, delta) =>
        set(
          (state) =>
            mutate(state, id, (n) => ({
              ...n,
              manpower: Math.max(0, Math.min(n.maxManpower, n.manpower + delta)),
            })),
          false,
          'nation/updateManpower',
        ),

      setMaxManpower: (id, max) =>
        set(
          (state) =>
            mutate(state, id, (n) => ({
              ...n,
              maxManpower: Math.max(0, max),
              manpower: Math.min(n.manpower, max),
            })),
          false,
          'nation/setMaxManpower',
        ),

      updatePrestige: (id, delta) =>
        set(
          (state) =>
            mutate(state, id, (n) => ({
              ...n,
              prestige: clamp(n.prestige + delta, -100, 500),
            })),
          false,
          'nation/updatePrestige',
        ),

      updateStability: (id, delta) =>
        set(
          (state) =>
            mutate(state, id, (n) => ({
              ...n,
              stability: clamp(n.stability + delta, 0, 100),
            })),
          false,
          'nation/updateStability',
        ),

      setRuler: (id, rulerId) =>
        set(
          (state) => mutate(state, id, (n) => ({ ...n, rulerId })),
          false,
          'nation/setRuler',
        ),

      setArchetype: (id, archetypeId) =>
        set(
          (state) => mutate(state, id, (n) => ({ ...n, archetypeId })),
          false,
          'nation/setArchetype',
        ),

      addAmbition: (id, ambition) =>
        set(
          (state) =>
            mutate(state, id, (n) => ({
              ...n,
              ambitions: [...n.ambitions, ambition],
            })),
          false,
          'nation/addAmbition',
        ),

      completeAmbition: (id, ambitionId) =>
        set(
          (state) =>
            mutate(state, id, (n) => ({
              ...n,
              ambitions: n.ambitions.filter((a) => a.id !== ambitionId),
            })),
          false,
          'nation/completeAmbition',
        ),

      snapshot: () => ({ nations: { ...get().nations } }),

      hydrate: (snap) =>
        set(
          () => ({ nations: { ...snap.nations } }),
          false,
          'nation/hydrate',
        ),

      initialize: () =>
        set(() => ({ nations: {} }), false, 'nation/initialize'),
    })),
    { name: 'nationStore' },
  ),
);
