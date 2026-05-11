/**
 * Economy monthly tick.
 *
 * Per nation: sum tax income from non-occupied controlled provinces and
 * add to treasury. Regenerate every province's manpower pool then sum
 * (over non-occupied controlled provinces) into nation manpower and
 * maxManpower. Update cachedIncome / cachedNetMonthly so the HUD reads
 * consistent values.
 */

import { useNationStore } from '@/stores/nationStore';
import { useProvinceStore } from '@/stores/provinceStore';
import type { NationId, Province } from '@/types';
import { calculateNationTaxIncome } from './income';
import { regenerateManpower } from './manpower';

interface NationAggregate {
  tax: number;
  manpower: number;
  maxManpower: number;
}

export function economyTick(): void {
  const provinceState = useProvinceStore.getState();
  const provinces = Object.values(provinceState.provinces) as Province[];
  const nations = useNationStore.getState().nations;

  // 1) Manpower regen — collect new pools and apply them.
  const updatedPools: Record<string, Province> = {};
  for (const p of provinces) {
    const nextPool = regenerateManpower(p.manpowerPool);
    if (nextPool === p.manpowerPool) continue;
    updatedPools[p.id] = { ...p, manpowerPool: nextPool };
  }
  for (const [id, updated] of Object.entries(updatedPools)) {
    provinceState.updateProvince(id, { manpowerPool: updated.manpowerPool });
  }

  // 2) Per-nation aggregates using post-regen pool values.
  const aggregates = new Map<NationId, NationAggregate>();
  for (const original of provinces) {
    const post = updatedPools[original.id] ?? original;
    const controllerId = post.controllerId;
    const agg = aggregates.get(controllerId) ?? {
      tax: 0,
      manpower: 0,
      maxManpower: 0,
    };
    if (post.occupierId === null) {
      agg.tax += post.development.tax;
      agg.manpower += post.manpowerPool.current;
      agg.maxManpower += post.manpowerPool.max;
    }
    aggregates.set(controllerId, agg);
  }

  // 3) Apply nation updates atomically so cached fields stay in sync.
  const nationStore = useNationStore.getState();
  for (const nationId of Object.keys(nations)) {
    const agg = aggregates.get(nationId) ?? {
      tax: 0,
      manpower: 0,
      maxManpower: 0,
    };
    const n = nations[nationId];
    if (!n) continue;
    nationStore.updateNation(nationId, {
      treasury: n.treasury + agg.tax,
      manpower: Math.min(agg.manpower, agg.maxManpower),
      maxManpower: agg.maxManpower,
      cachedIncome: {
        tax: agg.tax,
        trade: 0,
        production: 0,
        tariffs: 0,
        tribute: 0,
        total: agg.tax,
      },
      cachedNetMonthly: agg.tax,
    });
  }
}

// Re-export pure helpers for callers that don't want store access.
export { calculateNationTaxIncome, regenerateManpower };
