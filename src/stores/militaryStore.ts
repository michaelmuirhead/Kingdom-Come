/**
 * militaryStore — armies, wars, battles.
 *
 * v0.1 stub: just enough to support player-initiated wars, basic army
 * movement, and immediate battle resolution. Navies, sieges, war goals
 * tracking, and AE/threat math arrive in v0.2.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type {
  Army,
  ArmyId,
  Battle,
  BattleId,
  BattleResult,
  CasusBelliType,
  NationId,
  ProvinceId,
  War,
  WarId,
} from '@/types';

export interface MilitaryStoreSnapshot {
  armies: Record<ArmyId, Army>;
  wars: Record<WarId, War>;
  battles: Record<BattleId, Battle>;
}

export interface MilitaryStoreState extends MilitaryStoreSnapshot {
  // Indices
  armiesByNation: Record<NationId, ArmyId[]>;
  armiesByProvince: Record<ProvinceId, ArmyId[]>;

  // Army actions
  createArmy: (army: Army) => void;
  moveArmy: (id: ArmyId, target: ProvinceId | null) => void;
  setArmyLocation: (id: ArmyId, provinceId: ProvinceId) => void;
  disbandArmy: (id: ArmyId) => void;
  updateArmy: (id: ArmyId, patch: Partial<Army>) => void;

  // War actions
  declareWar: (war: War) => void;
  endWar: (warId: WarId, endDate: War['endDate']) => void;
  updateWarScore: (warId: WarId, delta: number) => void;

  // Battle actions
  startBattle: (battle: Battle) => void;
  resolveBattle: (id: BattleId, result: BattleResult) => void;

  // Save/load
  snapshot: () => MilitaryStoreSnapshot;
  hydrate: (snap: MilitaryStoreSnapshot) => void;
  initialize: () => void;
}

function buildArmyIndices(
  armies: Record<ArmyId, Army>,
): Pick<MilitaryStoreState, 'armiesByNation' | 'armiesByProvince'> {
  const byNation: Record<NationId, ArmyId[]> = {};
  const byProvince: Record<ProvinceId, ArmyId[]> = {};
  for (const a of Object.values(armies)) {
    (byNation[a.nationId] ??= []).push(a.id);
    (byProvince[a.provinceId] ??= []).push(a.id);
  }
  return { armiesByNation: byNation, armiesByProvince: byProvince };
}

function clamp(v: number, min: number, max: number): number {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

export const useMilitaryStore = create<MilitaryStoreState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      armies: {},
      wars: {},
      battles: {},
      armiesByNation: {},
      armiesByProvince: {},

      createArmy: (army) =>
        set(
          (state) => {
            const armies = { ...state.armies, [army.id]: army };
            return { armies, ...buildArmyIndices(armies) };
          },
          false,
          'military/createArmy',
        ),

      moveArmy: (id, target) =>
        set(
          (state) => {
            const existing = state.armies[id];
            if (!existing) return state;
            return {
              armies: {
                ...state.armies,
                [id]: {
                  ...existing,
                  movementTarget: target,
                  movementProgress: target === null ? 0 : existing.movementProgress,
                },
              },
            };
          },
          false,
          'military/moveArmy',
        ),

      setArmyLocation: (id, provinceId) =>
        set(
          (state) => {
            const existing = state.armies[id];
            if (!existing) return state;
            const armies = {
              ...state.armies,
              [id]: { ...existing, provinceId, movementProgress: 0, movementTarget: null },
            };
            return { armies, ...buildArmyIndices(armies) };
          },
          false,
          'military/setArmyLocation',
        ),

      disbandArmy: (id) =>
        set(
          (state) => {
            if (!state.armies[id]) return state;
            const { [id]: _, ...rest } = state.armies;
            return { armies: rest, ...buildArmyIndices(rest) };
          },
          false,
          'military/disbandArmy',
        ),

      updateArmy: (id, patch) =>
        set(
          (state) => {
            const existing = state.armies[id];
            if (!existing) return state;
            const updated: Army = { ...existing, ...patch };
            const armies = { ...state.armies, [id]: updated };
            const reindex =
              patch.nationId !== undefined || patch.provinceId !== undefined;
            return reindex
              ? { armies, ...buildArmyIndices(armies) }
              : { armies };
          },
          false,
          'military/updateArmy',
        ),

      declareWar: (war) =>
        set(
          (state) => ({ wars: { ...state.wars, [war.id]: war } }),
          false,
          'military/declareWar',
        ),

      endWar: (warId, endDate) =>
        set(
          (state) => {
            const w = state.wars[warId];
            if (!w) return state;
            return { wars: { ...state.wars, [warId]: { ...w, endDate } } };
          },
          false,
          'military/endWar',
        ),

      updateWarScore: (warId, delta) =>
        set(
          (state) => {
            const w = state.wars[warId];
            if (!w) return state;
            return {
              wars: {
                ...state.wars,
                [warId]: { ...w, warScore: clamp(w.warScore + delta, -100, 100) },
              },
            };
          },
          false,
          'military/updateWarScore',
        ),

      startBattle: (battle) =>
        set(
          (state) => ({ battles: { ...state.battles, [battle.id]: battle } }),
          false,
          'military/startBattle',
        ),

      resolveBattle: (id, result) =>
        set(
          (state) => {
            const b = state.battles[id];
            if (!b) return state;
            return {
              battles: {
                ...state.battles,
                [id]: { ...b, resolved: true, result },
              },
            };
          },
          false,
          'military/resolveBattle',
        ),

      snapshot: () => {
        const s = get();
        return {
          armies: { ...s.armies },
          wars: { ...s.wars },
          battles: { ...s.battles },
        };
      },

      hydrate: (snap) =>
        set(
          () => ({
            armies: { ...snap.armies },
            wars: { ...snap.wars },
            battles: { ...snap.battles },
            ...buildArmyIndices(snap.armies),
          }),
          false,
          'military/hydrate',
        ),

      initialize: () =>
        set(
          () => ({
            armies: {},
            wars: {},
            battles: {},
            armiesByNation: {},
            armiesByProvince: {},
          }),
          false,
          'military/initialize',
        ),
    })),
    { name: 'militaryStore' },
  ),
);
