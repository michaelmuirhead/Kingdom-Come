/**
 * Age math and monthly health drain.
 *
 * v0.1 health drain schedule (per month):
 *   age < 40:  no drain
 *   40-55:     0.10 health/month  → lose ~12 over a decade
 *   55-70:     0.25 health/month  → lose ~30 over a decade
 *   70+ :     0.50 health/month  → lose ~60 over a decade
 */

import { monthsBetween } from '@/lib/date';
import type { Character, GameDate } from '@/types';

export function ageInMonths(c: Character, now: GameDate): number {
  return Math.max(0, monthsBetween(c.birthDate, now));
}

export function ageInYears(c: Character, now: GameDate): number {
  return Math.floor(ageInMonths(c, now) / 12);
}

export function monthlyHealthDrain(ageYears: number): number {
  if (ageYears < 40) return 0;
  if (ageYears < 55) return 0.1;
  if (ageYears < 70) return 0.25;
  return 0.5;
}

export function applyHealthDrain(
  current: number,
  drain: number,
): number {
  const next = current - drain;
  return next < 0 ? 0 : next;
}
