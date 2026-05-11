/**
 * Mortality math.
 *
 * Per-age base monthly death rate (from the ROADMAP_V01 #18 spec),
 * scaled by health. A character at health 100 dies at baseRate; at
 * health 0 they die at 5x baseRate. Plot armor (with a future
 * expires-date) skips the roll entirely.
 */

import { compareDates } from '@/lib/date';
import type { RNG } from '@/lib/rng';
import type { Character, GameDate } from '@/types';

const HEALTH_AT_FULL = 100;
const HEALTH_MULTIPLIER_AT_ZERO = 5;

export function baseMortalityRate(ageYears: number): number {
  if (ageYears < 30) return 0.0005;
  if (ageYears < 40) return 0.001;
  if (ageYears < 50) return 0.002;
  if (ageYears < 60) return 0.004;
  if (ageYears < 70) return 0.008;
  if (ageYears < 80) return 0.02;
  return 0.04;
}

export function monthlyMortalityRate(
  ageYears: number,
  health: number,
): number {
  const base = baseMortalityRate(ageYears);
  const h = Math.max(0, Math.min(HEALTH_AT_FULL, health));
  const healthFactor =
    1 + (HEALTH_MULTIPLIER_AT_ZERO - 1) * (1 - h / HEALTH_AT_FULL);
  return base * healthFactor;
}

/**
 * True when the character is shielded by plot armor on `now`.
 * Plot armor without an expiry shields forever (matches the schema's
 * boolean+optional date contract).
 */
export function isPlotArmored(c: Character, now: GameDate): boolean {
  if (!c.health.plotArmor) return false;
  if (!c.health.plotArmorExpires) return true;
  return compareDates(now, c.health.plotArmorExpires) < 0;
}

export function rollDeath(
  c: Character,
  now: GameDate,
  ageYears: number,
  rng: RNG,
): boolean {
  if (isPlotArmored(c, now)) return false;
  const p = monthlyMortalityRate(ageYears, c.health.current);
  return rng.chance(p);
}
