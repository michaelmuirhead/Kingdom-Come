/**
 * provinceStore — the biggest hot store.
 *
 * ~400 provinces in the full game, ~50 in v0.1. Normalized state by ID
 * plus four indices (by nation, region, culture, religion). Indices are
 * rebuilt incrementally inside actions, not recomputed from scratch, so
 * ownership flips during a war don't iterate the whole map.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type {
  BuildingId,
  CultureId,
  NationId,
  Province,
  ProvinceId,
  ReligionId,
} from '@/types';

export interface ProvinceStoreSnapshot {
  provinces: Record<ProvinceId, Province>;
}

export interface ProvinceStoreState {
  // Data
  provinces: Record<ProvinceId, Province>;

  // Indices — derived from `provinces` and rebuilt incrementally in actions.
  provincesByNation: Record<NationId, ProvinceId[]>;
  provincesByRegion: Record<string, ProvinceId[]>;
  provincesByCulture: Record<CultureId, ProvinceId[]>;
  provincesByReligion: Record<ReligionId, ProvinceId[]>;

  // Actions
  setProvince: (id: ProvinceId, province: Province) => void;
  updateProvince: (id: ProvinceId, patch: Partial<Province>) => void;
  removeProvince: (id: ProvinceId) => void;
  bulkSet: (provinces: Record<ProvinceId, Province>) => void;

  updateOwnership: (id: ProvinceId, newNationId: NationId) => void;
  updateOccupation: (id: ProvinceId, occupierId: NationId | null) => void;
  addBuilding: (id: ProvinceId, buildingId: BuildingId) => void;
  removeBuilding: (id: ProvinceId, buildingId: BuildingId) => void;
  updateDevelopment: (
    id: ProvinceId,
    development: Partial<Province['development']>,
  ) => void;
  startConversion: (
    id: ProvinceId,
    targetReligionId: ReligionId | null,
  ) => void;

  // Save/load
  snapshot: () => ProvinceStoreSnapshot;
  hydrate: (snap: ProvinceStoreSnapshot) => void;
  initialize: () => void;
}

const EMPTY: ProvinceStoreSnapshot = { provinces: {} };

function rebuildIndices(
  provinces: Record<ProvinceId, Province>,
): Pick<
  ProvinceStoreState,
  | 'provincesByNation'
  | 'provincesByRegion'
  | 'provincesByCulture'
  | 'provincesByReligion'
> {
  const byNation: Record<NationId, ProvinceId[]> = {};
  const byRegion: Record<string, ProvinceId[]> = {};
  const byCulture: Record<CultureId, ProvinceId[]> = {};
  const byReligion: Record<ReligionId, ProvinceId[]> = {};

  for (const p of Object.values(provinces)) {
    (byNation[p.controllerId] ??= []).push(p.id);
    (byRegion[p.regionId] ??= []).push(p.id);
    (byCulture[p.cultureId] ??= []).push(p.id);
    (byReligion[p.religionId] ??= []).push(p.id);
  }

  return {
    provincesByNation: byNation,
    provincesByRegion: byRegion,
    provincesByCulture: byCulture,
    provincesByReligion: byReligion,
  };
}

function removeFromList(list: ProvinceId[] | undefined, id: ProvinceId): ProvinceId[] {
  if (!list) return [];
  return list.filter((x) => x !== id);
}

export const useProvinceStore = create<ProvinceStoreState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      provinces: {},
      provincesByNation: {},
      provincesByRegion: {},
      provincesByCulture: {},
      provincesByReligion: {},

      setProvince: (id, province) =>
        set(
          (state) => {
            const provinces = { ...state.provinces, [id]: province };
            return { provinces, ...rebuildIndices(provinces) };
          },
          false,
          'province/setProvince',
        ),

      updateProvince: (id, patch) =>
        set(
          (state) => {
            const existing = state.provinces[id];
            if (!existing) return state;
            const updated: Province = { ...existing, ...patch };
            const provinces = { ...state.provinces, [id]: updated };
            // Indices only need rebuilding if a key field changed.
            const keyChanged =
              patch.controllerId !== undefined ||
              patch.cultureId !== undefined ||
              patch.religionId !== undefined ||
              patch.regionId !== undefined;
            return keyChanged
              ? { provinces, ...rebuildIndices(provinces) }
              : { provinces };
          },
          false,
          'province/updateProvince',
        ),

      removeProvince: (id) =>
        set(
          (state) => {
            if (!state.provinces[id]) return state;
            const { [id]: _, ...rest } = state.provinces;
            return { provinces: rest, ...rebuildIndices(rest) };
          },
          false,
          'province/removeProvince',
        ),

      bulkSet: (provinces) =>
        set(
          () => ({ provinces: { ...provinces }, ...rebuildIndices(provinces) }),
          false,
          'province/bulkSet',
        ),

      updateOwnership: (id, newNationId) =>
        set(
          (state) => {
            const existing = state.provinces[id];
            if (!existing) return state;
            if (existing.controllerId === newNationId) return state;
            const oldNationId = existing.controllerId;
            const updated: Province = { ...existing, controllerId: newNationId };
            const provinces = { ...state.provinces, [id]: updated };
            const byNation = { ...state.provincesByNation };
            byNation[oldNationId] = removeFromList(byNation[oldNationId], id);
            byNation[newNationId] = [...(byNation[newNationId] ?? []), id];
            return { provinces, provincesByNation: byNation };
          },
          false,
          'province/updateOwnership',
        ),

      updateOccupation: (id, occupierId) =>
        set(
          (state) => {
            const existing = state.provinces[id];
            if (!existing) return state;
            return {
              provinces: {
                ...state.provinces,
                [id]: { ...existing, occupierId },
              },
            };
          },
          false,
          'province/updateOccupation',
        ),

      addBuilding: (id, buildingId) =>
        set(
          (state) => {
            const existing = state.provinces[id];
            if (!existing) return state;
            if (existing.buildings.includes(buildingId)) return state;
            return {
              provinces: {
                ...state.provinces,
                [id]: {
                  ...existing,
                  buildings: [...existing.buildings, buildingId],
                },
              },
            };
          },
          false,
          'province/addBuilding',
        ),

      removeBuilding: (id, buildingId) =>
        set(
          (state) => {
            const existing = state.provinces[id];
            if (!existing) return state;
            return {
              provinces: {
                ...state.provinces,
                [id]: {
                  ...existing,
                  buildings: existing.buildings.filter((b) => b !== buildingId),
                },
              },
            };
          },
          false,
          'province/removeBuilding',
        ),

      updateDevelopment: (id, development) =>
        set(
          (state) => {
            const existing = state.provinces[id];
            if (!existing) return state;
            return {
              provinces: {
                ...state.provinces,
                [id]: {
                  ...existing,
                  development: { ...existing.development, ...development },
                },
              },
            };
          },
          false,
          'province/updateDevelopment',
        ),

      startConversion: (id, targetReligionId) =>
        set(
          (state) => {
            const existing = state.provinces[id];
            if (!existing) return state;
            return {
              provinces: {
                ...state.provinces,
                [id]: {
                  ...existing,
                  beingConverted: targetReligionId !== null,
                  conversionTargetReligionId: targetReligionId,
                  conversionProgress:
                    targetReligionId === null ? 0 : existing.conversionProgress,
                },
              },
            };
          },
          false,
          'province/startConversion',
        ),

      snapshot: () => ({ provinces: { ...get().provinces } }),

      hydrate: (snap) =>
        set(
          () => ({
            provinces: { ...snap.provinces },
            ...rebuildIndices(snap.provinces),
          }),
          false,
          'province/hydrate',
        ),

      initialize: () =>
        set(
          () => ({
            provinces: {},
            ...rebuildIndices(EMPTY.provinces),
          }),
          false,
          'province/initialize',
        ),
    })),
    { name: 'provinceStore' },
  ),
);
