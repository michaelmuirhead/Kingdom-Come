/**
 * Succession resolution for v0.1.
 *
 * Supports:
 *   salic_primogeniture     — eldest legitimate son
 *   primogeniture           — eldest legitimate son (male-preferred)
 *   absolute_primogeniture  — eldest legitimate child regardless of gender
 *   elective                — same as primogeniture as a v0.1 fallback
 *
 * Other laws fall back to primogeniture for the skeleton; richer
 * dispatch arrives with the full dynasty engine in v0.2+.
 */

import { compareDates } from '@/lib/date';
import type { Character, CharacterId, SuccessionLaw } from '@/types';

export interface SuccessionContext {
  ruler: Character;
  successionLaw: SuccessionLaw;
  /** Lookup of every character in the world, by id. */
  byId: Readonly<Record<CharacterId, Character>>;
}

export interface SuccessionResult {
  heirId: CharacterId | null;
  crisis: boolean;
}

function olderFirst(a: Character, b: Character): number {
  // Earlier birthDate = older = should come first.
  return compareDates(a.birthDate, b.birthDate);
}

function eligibleChildren(
  ruler: Character,
  byId: Readonly<Record<CharacterId, Character>>,
): Character[] {
  const out: Character[] = [];
  for (const id of ruler.family.legitimateChildIds) {
    const child = byId[id];
    if (!child) continue;
    if (child.deathDate !== null) continue;
    out.push(child);
  }
  out.sort(olderFirst);
  return out;
}

export function resolveSuccession(ctx: SuccessionContext): SuccessionResult {
  const { ruler, successionLaw, byId } = ctx;
  const children = eligibleChildren(ruler, byId);

  switch (successionLaw) {
    case 'absolute_primogeniture': {
      const heir = children[0];
      return heir
        ? { heirId: heir.id, crisis: false }
        : { heirId: null, crisis: true };
    }
    case 'salic_primogeniture':
    case 'primogeniture':
    case 'elective':
    case 'seniority':
    case 'tanistry':
    case 'confederate_partition':
    default: {
      // v0.1 fallback: prefer eldest legitimate son; if none, fall
      // through to eldest legitimate child for primogeniture so
      // realms with all-daughter rulers don't always crisis.
      const son = children.find((c) => c.gender === 'male');
      if (son) return { heirId: son.id, crisis: false };
      if (
        successionLaw === 'salic_primogeniture' ||
        successionLaw === 'seniority' ||
        successionLaw === 'tanistry' ||
        successionLaw === 'confederate_partition'
      ) {
        return { heirId: null, crisis: true };
      }
      const child = children[0];
      return child
        ? { heirId: child.id, crisis: false }
        : { heirId: null, crisis: true };
    }
  }
}
