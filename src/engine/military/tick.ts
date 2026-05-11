/**
 * Military monthly tick.
 *
 * 1) Movement — every army with a movementTarget advances. Arrival
 *    sets provinceId and clears the target.
 * 2) Combat detection — any province containing armies from two
 *    nations that are at war triggers an immediate battle resolved by
 *    the resolveBattle orchestrator.
 *
 * Sieges, multi-month combat, naval movement, and morale arrive in
 * later versions.
 */

import { createStream } from '@/engine/rngStreams';
import {
  useMilitaryStore,
  useProvinceStore,
  useWorldStore,
} from '@/stores';
import type { Army, NationId, ProvinceId, War } from '@/types';
import { resolveBattle } from '@/engine/orchestrator';
import { advanceMovement } from './movement';

function activeWars(): War[] {
  return Object.values(useMilitaryStore.getState().wars).filter(
    (w) => w.endDate === null,
  );
}

function atWar(a: NationId, b: NationId): boolean {
  for (const w of activeWars()) {
    const aAtt = w.attackers.includes(a);
    const bDef = w.defenders.includes(b);
    const bAtt = w.attackers.includes(b);
    const aDef = w.defenders.includes(a);
    if ((aAtt && bDef) || (bAtt && aDef)) return true;
  }
  return false;
}

/** Choose attacker / defender for a province with multiple nations
 *  present. Attacker = nation whose army arrived this tick (proxy: any
 *  side with a non-zero last-move would have its movementTarget already
 *  cleared, so we just take the lexicographically smaller nationId for
 *  deterministic results when both sides have been parked). For v0.1
 *  this is acceptable; deeper attacker-detection arrives with sieges. */
function pickSides(
  nationIds: readonly NationId[],
): { attacker: NationId; defender: NationId } | null {
  if (nationIds.length < 2) return null;
  const sorted = [...nationIds].sort();
  return { attacker: sorted[0]!, defender: sorted[1]! };
}

export function militaryTick(): void {
  const world = useWorldStore.getState();
  const rng = createStream(world.campaignSeed, 'military', world.monthsPlayed);

  // ── 1) Movement ─────────────────────────────────────────────────
  const armies = Object.values(useMilitaryStore.getState().armies) as Army[];
  const provinces = useProvinceStore.getState().provinces;

  for (const army of armies) {
    if (army.movementTarget === null) continue;
    const targetProv = provinces[army.movementTarget];
    if (!targetProv) continue;
    const result = advanceMovement(army, targetProv.terrain);
    if (result.arrived) {
      useMilitaryStore
        .getState()
        .setArmyLocation(army.id, result.army.provinceId);
    } else {
      useMilitaryStore.getState().updateArmy(army.id, {
        movementProgress: result.army.movementProgress,
      });
    }
  }

  // ── 2) Combat detection ─────────────────────────────────────────
  // Group post-movement armies by province; for each province with two
  // or more nations at war, schedule a battle.
  const armiesPost = Object.values(useMilitaryStore.getState().armies) as Army[];
  const byProvince = new Map<ProvinceId, Set<NationId>>();
  for (const a of armiesPost) {
    const set = byProvince.get(a.provinceId) ?? new Set<NationId>();
    set.add(a.nationId);
    byProvince.set(a.provinceId, set);
  }

  for (const [provinceId, nationSet] of byProvince) {
    if (nationSet.size < 2) continue;
    const nationsAtThisSpot = [...nationSet];
    // Find first pair currently at war.
    let attacker: NationId | null = null;
    let defender: NationId | null = null;
    outer: for (let i = 0; i < nationsAtThisSpot.length; i++) {
      for (let j = i + 1; j < nationsAtThisSpot.length; j++) {
        const a = nationsAtThisSpot[i]!;
        const b = nationsAtThisSpot[j]!;
        if (atWar(a, b)) {
          const pick = pickSides([a, b]);
          if (pick) {
            attacker = pick.attacker;
            defender = pick.defender;
            break outer;
          }
        }
      }
    }
    if (!attacker || !defender) continue;

    resolveBattle(provinceId, attacker, defender, rng, world.currentDate);
  }
}
