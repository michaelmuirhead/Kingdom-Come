/**
 * Pure opinion helpers — modifier construction, war-state queries.
 *
 * Real opinion-drift logic (monthly decay, scaled by treaties /
 * cultural distance / rivalry) lands post-v0.1.
 */

import type { GameDate, NationId, OpinionModifier, War } from '@/types';

export function makeOpinionModifier(opts: {
  source: string;
  value: number;
  appliedDate: GameDate;
  expiresDate?: GameDate;
}): OpinionModifier {
  return {
    source: opts.source,
    value: opts.value,
    appliedDate: opts.appliedDate,
    expiresDate: opts.expiresDate ?? null,
  };
}

export function areNationsAtWar(
  a: NationId,
  b: NationId,
  wars: Record<string, War>,
): boolean {
  for (const w of Object.values(wars)) {
    if (w.endDate !== null) continue;
    const aAtt = w.attackers.includes(a);
    const bDef = w.defenders.includes(b);
    const bAtt = w.attackers.includes(b);
    const aDef = w.defenders.includes(a);
    if ((aAtt && bDef) || (bAtt && aDef)) return true;
  }
  return false;
}
