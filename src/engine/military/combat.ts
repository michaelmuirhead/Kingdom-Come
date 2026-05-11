/**
 * Pure combat math for v0.1.
 *
 * Effectiveness = numbers × (1 + RNG[-0.1..+0.1]). Higher effectiveness
 * wins; loser takes 30% casualties, winner takes 15%. Casualties are
 * distributed across regiments proportional to regiment size.
 *
 * This is intentionally crude — v0.2 adds combat width, terrain
 * modifiers, general traits, and morale.
 */

import type { Army, NationId, Regiment } from '@/types';
import type { RNG } from '@/lib/rng';

export const WINNER_CASUALTY_RATE = 0.15;
export const LOSER_CASUALTY_RATE = 0.3;

export interface SideStrength {
  nationId: NationId;
  armies: Army[];
  totalSize: number;
  effectiveness: number;
}

export interface CombatOutcome {
  winnerNationId: NationId;
  loserNationId: NationId;
  totalWinnerCasualties: number;
  totalLoserCasualties: number;
  /** Regiments after casualty application, keyed by army id. */
  updatedRegiments: Record<string, Regiment[]>;
}

function totalSize(armies: readonly Army[]): number {
  let total = 0;
  for (const a of armies) {
    for (const r of a.regiments) total += r.size;
  }
  return total;
}

function applyCasualties(armies: Army[], rate: number): {
  updatedRegiments: Record<string, Regiment[]>;
  totalCasualties: number;
} {
  let totalCasualties = 0;
  const updatedRegiments: Record<string, Regiment[]> = {};
  for (const army of armies) {
    const newRegiments: Regiment[] = [];
    for (const r of army.regiments) {
      const losses = Math.round(r.size * rate);
      totalCasualties += losses;
      newRegiments.push({ ...r, size: Math.max(0, r.size - losses) });
    }
    updatedRegiments[army.id] = newRegiments;
  }
  return { updatedRegiments, totalCasualties };
}

export function buildSide(nationId: NationId, armies: Army[], rng: RNG): SideStrength {
  const size = totalSize(armies);
  // Random factor in [-0.1, +0.1].
  const factor = 1 + (rng.next() - 0.5) * 0.2;
  return {
    nationId,
    armies,
    totalSize: size,
    effectiveness: size * factor,
  };
}

export function resolveCombat(
  attacker: SideStrength,
  defender: SideStrength,
): CombatOutcome {
  const winnerIsAttacker = attacker.effectiveness >= defender.effectiveness;
  const winnerSide = winnerIsAttacker ? attacker : defender;
  const loserSide = winnerIsAttacker ? defender : attacker;

  const winnerHit = applyCasualties(winnerSide.armies, WINNER_CASUALTY_RATE);
  const loserHit = applyCasualties(loserSide.armies, LOSER_CASUALTY_RATE);

  return {
    winnerNationId: winnerSide.nationId,
    loserNationId: loserSide.nationId,
    totalWinnerCasualties: winnerHit.totalCasualties,
    totalLoserCasualties: loserHit.totalCasualties,
    updatedRegiments: {
      ...winnerHit.updatedRegiments,
      ...loserHit.updatedRegiments,
    },
  };
}
