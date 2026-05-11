/**
 * Pure income math. v0.1: tax only, one gold per development.tax point
 * per province per month, occupied provinces contribute nothing.
 *
 * Trade, production cuts, building modifiers, estate scoops, and tariffs
 * arrive with later issues. Keep this function side-effect-free so the
 * tick orchestrator can call it and the test suite can exercise the
 * formula independently of stores.
 */

import type { Province } from '@/types';

export const GOLD_PER_TAX_POINT = 1.0;

export function provinceMonthlyTax(p: Province): number {
  if (p.occupierId !== null) return 0;
  return p.development.tax * GOLD_PER_TAX_POINT;
}

export function calculateNationTaxIncome(
  nationId: string,
  provinces: readonly Province[],
): number {
  let total = 0;
  for (const p of provinces) {
    if (p.controllerId !== nationId) continue;
    total += provinceMonthlyTax(p);
  }
  return total;
}
