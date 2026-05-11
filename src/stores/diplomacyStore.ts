/**
 * diplomacyStore — opinions and treaties.
 *
 * v0.1 stub: opinion is a flat value per (from, to) pair, with a list
 * of modifiers tracked alongside for later expiration logic. Treaties
 * are stored by id; breakTreaty just flips a flag rather than deleting
 * so post-mortem queries (who broke what?) keep working.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type {
  NationId,
  OpinionEntry,
  OpinionModifier,
  Treaty,
  TreatyId,
} from '@/types';

export interface DiplomacyStoreSnapshot {
  opinions: Record<NationId, Record<NationId, OpinionEntry>>;
  treaties: Record<TreatyId, Treaty>;
}

export interface DiplomacyStoreState extends DiplomacyStoreSnapshot {
  // Opinion actions
  setOpinion: (from: NationId, to: NationId, value: number) => void;
  addOpinionModifier: (
    from: NationId,
    to: NationId,
    modifier: OpinionModifier,
  ) => void;
  clearOpinion: (from: NationId, to: NationId) => void;

  // Treaty actions
  signTreaty: (treaty: Treaty) => void;
  breakTreaty: (treatyId: TreatyId) => void;
  removeTreaty: (treatyId: TreatyId) => void;

  // Save/load
  snapshot: () => DiplomacyStoreSnapshot;
  hydrate: (snap: DiplomacyStoreSnapshot) => void;
  initialize: () => void;
}

const OPINION_MIN = -200;
const OPINION_MAX = 200;

function clampOpinion(v: number): number {
  if (v < OPINION_MIN) return OPINION_MIN;
  if (v > OPINION_MAX) return OPINION_MAX;
  return v;
}

function getOrCreate(
  opinions: Record<NationId, Record<NationId, OpinionEntry>>,
  from: NationId,
  to: NationId,
): OpinionEntry {
  const existing = opinions[from]?.[to];
  if (existing) return existing;
  return { fromNationId: from, toNationId: to, value: 0, modifiers: [] };
}

function setEntry(
  opinions: Record<NationId, Record<NationId, OpinionEntry>>,
  entry: OpinionEntry,
): Record<NationId, Record<NationId, OpinionEntry>> {
  const innerExisting = opinions[entry.fromNationId] ?? {};
  return {
    ...opinions,
    [entry.fromNationId]: { ...innerExisting, [entry.toNationId]: entry },
  };
}

export const useDiplomacyStore = create<DiplomacyStoreState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      opinions: {},
      treaties: {},

      setOpinion: (from, to, value) =>
        set(
          (state) => {
            const entry = getOrCreate(state.opinions, from, to);
            const updated: OpinionEntry = { ...entry, value: clampOpinion(value) };
            return { opinions: setEntry(state.opinions, updated) };
          },
          false,
          'diplomacy/setOpinion',
        ),

      addOpinionModifier: (from, to, modifier) =>
        set(
          (state) => {
            const entry = getOrCreate(state.opinions, from, to);
            const modifiers = [...entry.modifiers, modifier];
            const total = modifiers.reduce((s, m) => s + m.value, 0);
            const updated: OpinionEntry = {
              ...entry,
              modifiers,
              value: clampOpinion(total),
            };
            return { opinions: setEntry(state.opinions, updated) };
          },
          false,
          'diplomacy/addOpinionModifier',
        ),

      clearOpinion: (from, to) =>
        set(
          (state) => {
            const inner = state.opinions[from];
            if (!inner || !inner[to]) return state;
            const { [to]: _, ...rest } = inner;
            return { opinions: { ...state.opinions, [from]: rest } };
          },
          false,
          'diplomacy/clearOpinion',
        ),

      signTreaty: (treaty) =>
        set(
          (state) => ({ treaties: { ...state.treaties, [treaty.id]: treaty } }),
          false,
          'diplomacy/signTreaty',
        ),

      breakTreaty: (treatyId) =>
        set(
          (state) => {
            const t = state.treaties[treatyId];
            if (!t) return state;
            return {
              treaties: { ...state.treaties, [treatyId]: { ...t, broken: true } },
            };
          },
          false,
          'diplomacy/breakTreaty',
        ),

      removeTreaty: (treatyId) =>
        set(
          (state) => {
            if (!state.treaties[treatyId]) return state;
            const { [treatyId]: _, ...rest } = state.treaties;
            return { treaties: rest };
          },
          false,
          'diplomacy/removeTreaty',
        ),

      snapshot: () => {
        const s = get();
        return {
          opinions: structuredClone(s.opinions),
          treaties: { ...s.treaties },
        };
      },

      hydrate: (snap) =>
        set(
          () => ({
            opinions: structuredClone(snap.opinions),
            treaties: { ...snap.treaties },
          }),
          false,
          'diplomacy/hydrate',
        ),

      initialize: () =>
        set(
          () => ({ opinions: {}, treaties: {} }),
          false,
          'diplomacy/initialize',
        ),
    })),
    { name: 'diplomacyStore' },
  ),
);
