/**
 * Multi-store orchestrators.
 *
 * Per TECH.md §4: components / subsystems never write to multiple
 * stores in one user action — they call an orchestrator like
 * `handleRulerDeath`, which performs every cross-store mutation
 * atomically (well, sequentially with consistent ordering — Zustand
 * has no real transactional layer for v0.1).
 *
 * v0.1 surface:
 *   handleRulerDeath(ruler, nation, now) — death + succession + event
 *                                          queueing + pause
 *   resolveBattle(provinceId, attackerNation, defenderNation, rng, now)
 *                                          — combat + casualties +
 *                                            occupation + retreat
 */

import {
  useDiplomacyStore,
  useDynastyStore,
  useEventQueueStore,
  useMilitaryStore,
  useNationStore,
  useProvinceStore,
  useWorldStore,
} from '@/stores';
import { generateId } from '@/lib/id';
import type { RNG } from '@/lib/rng';
import {
  buildSide,
  resolveCombat,
  type CombatOutcome,
} from './military/combat';
import type {
  Army,
  Character,
  CharacterId,
  GameDate,
  Nation,
  NationId,
  PauseReason,
  ProvinceId,
  QueuedEvent,
} from '@/types';
import {
  resolveSuccession,
  type SuccessionResult,
} from './dynasty/succession';

export interface RulerDeathOutcome {
  rulerId: CharacterId;
  nationId: string;
  successor: SuccessionResult;
}

/**
 * Resolve the death of `ruler`. Kills the character, finds an heir per
 * the nation's succession law, updates rulership, queues a ruler-death
 * event and (if applicable) a succession event, and auto-pauses the
 * game so the player can react.
 */
export function handleRulerDeath(
  ruler: Character,
  nation: Nation,
  now: GameDate,
): RulerDeathOutcome {
  // 1. Kill the ruler in the dynasty store.
  useDynastyStore.getState().killCharacter(ruler.id, now);

  // 2. Resolve succession against the post-kill character roster.
  const byId = useDynastyStore.getState().characters;
  const succession = resolveSuccession({
    ruler,
    successionLaw: nation.successionLaw,
    byId,
  });

  // 3. Update nation rulership.
  if (succession.heirId) {
    useNationStore.getState().setRuler(nation.id, succession.heirId);
  }
  if (succession.crisis) {
    useWorldStore
      .getState()
      .setFlag(`succession_crisis:${nation.id}`, true);
  }

  // 4. Queue events for the player to read.
  const deathEvent: QueuedEvent = {
    id: generateId('evt'),
    eventDefinitionId: 'ruler_death',
    nationId: nation.id,
    triggeredDate: now,
    contextParams: {
      deceasedRulerId: ruler.id,
      successorId: succession.heirId,
      crisis: succession.crisis,
    },
  };
  useEventQueueStore.getState().queueEvent(deathEvent);

  if (succession.heirId) {
    const successionEvent: QueuedEvent = {
      id: generateId('evt'),
      eventDefinitionId: 'succession_complete',
      nationId: nation.id,
      triggeredDate: now,
      contextParams: {
        previousRulerId: ruler.id,
        newRulerId: succession.heirId,
      },
    };
    useEventQueueStore.getState().queueEvent(successionEvent);
  }

  // 5. Auto-pause for player attention. If multiple rulers die in one
  //    tick we collect each into the pause-reasons list.
  const reason: PauseReason = {
    type: 'ruler_death',
    priority: 1,
    message: `${ruler.givenName} ${ruler.dynastyName} has died`,
  };
  const existing = useWorldStore.getState().pauseReasons;
  useWorldStore.getState().pauseWithReasons([...existing, reason]);

  return {
    rulerId: ruler.id,
    nationId: nation.id,
    successor: succession,
  };
}

/**
 * Resolve a battle in `provinceId` between `attackerNationId` and
 * `defenderNationId`. v0.1: instantaneous resolution — no multi-month
 * combat, no morale or organization tracking.
 *
 * Steps:
 *   1. Snapshot armies on each side currently in the province.
 *   2. Roll effectiveness for each side from `rng`.
 *   3. Apply casualties to every regiment (15% winner / 30% loser).
 *   4. Subtract total losses from each nation's manpower.
 *   5. Retreat the loser to a friendly adjacent province; if none,
 *      destroy the army(ies).
 *   6. Set province.occupierId to the winner if it wasn't already the
 *      controller.
 *   7. Record an unresolved → resolved Battle entity for the ledger.
 *
 * Returns the CombatOutcome and the chosen battle id.
 */
export interface BattleResolution {
  battleId: string;
  outcome: CombatOutcome;
  retreatTo: ProvinceId | null;
}

export function resolveBattle(
  provinceId: ProvinceId,
  attackerNationId: NationId,
  defenderNationId: NationId,
  rng: RNG,
  now: GameDate,
): BattleResolution | null {
  const armies = Object.values(useMilitaryStore.getState().armies);
  const attackerArmies = armies.filter(
    (a) => a.nationId === attackerNationId && a.provinceId === provinceId,
  );
  const defenderArmies = armies.filter(
    (a) => a.nationId === defenderNationId && a.provinceId === provinceId,
  );
  if (attackerArmies.length === 0 || defenderArmies.length === 0) return null;

  // 1) Strength + RNG roll.
  const atk = buildSide(attackerNationId, attackerArmies, rng);
  const def = buildSide(defenderNationId, defenderArmies, rng);
  const outcome = resolveCombat(atk, def);

  // 2) Battle entity for the ledger.
  const battleId = generateId('btl');
  useMilitaryStore.getState().startBattle({
    id: battleId,
    provinceId,
    attackerArmyIds: attackerArmies.map((a) => a.id),
    defenderArmyIds: defenderArmies.map((a) => a.id),
    combatWidth: 20,
    startDate: now,
    resolved: false,
  });

  // 3) Apply casualty results to each army (or destroy zero-strength
  //    armies). Retreat the loser side off the battlefield.
  const losingNationId = outcome.loserNationId;
  const winningNationId = outcome.winnerNationId;
  const province = useProvinceStore.getState().provinces[provinceId];
  const adjacencies = province?.adjacencies ?? [];

  // Find a friendly retreat option for the loser.
  let retreatTarget: ProvinceId | null = null;
  for (const adj of adjacencies) {
    const adjProv = useProvinceStore.getState().provinces[adj];
    if (!adjProv) continue;
    if (
      adjProv.controllerId === losingNationId &&
      adjProv.occupierId === null
    ) {
      retreatTarget = adj;
      break;
    }
  }

  for (const [armyId, regiments] of Object.entries(outcome.updatedRegiments)) {
    const totalRemaining = regiments.reduce((s, r) => s + r.size, 0);
    if (totalRemaining <= 0) {
      useMilitaryStore.getState().disbandArmy(armyId);
      continue;
    }
    const army = useMilitaryStore.getState().armies[armyId];
    if (!army) continue;
    const updates: Partial<Army> = { regiments };
    if (army.nationId === losingNationId) {
      if (retreatTarget) {
        // Set new location directly — combat is "instantaneous" so we
        // don't model retreat as ongoing movement in v0.1.
        useMilitaryStore.getState().setArmyLocation(armyId, retreatTarget);
      } else {
        useMilitaryStore.getState().disbandArmy(armyId);
        continue;
      }
    }
    useMilitaryStore.getState().updateArmy(armyId, updates);
  }

  // 4) Manpower casualties.
  useNationStore
    .getState()
    .updateManpower(winningNationId, -outcome.totalWinnerCasualties);
  useNationStore
    .getState()
    .updateManpower(losingNationId, -outcome.totalLoserCasualties);

  // 5) Occupation. If the winner is not the controller, mark the
  //    province occupied.
  if (province && province.controllerId !== winningNationId) {
    useProvinceStore.getState().updateOccupation(provinceId, winningNationId);
  } else if (province && province.controllerId === winningNationId) {
    // Defender held; clear any prior occupation flag.
    useProvinceStore.getState().updateOccupation(provinceId, null);
  }

  // 6) Mark battle resolved.
  useMilitaryStore.getState().resolveBattle(battleId, {
    winnerId: winningNationId,
    attackerCasualties:
      winningNationId === attackerNationId
        ? outcome.totalWinnerCasualties
        : outcome.totalLoserCasualties,
    defenderCasualties:
      winningNationId === defenderNationId
        ? outcome.totalWinnerCasualties
        : outcome.totalLoserCasualties,
    generalsKilled: [],
    generalsWounded: [],
  });

  // 7) Queue a battle-result event for the ledger / drawer.
  useEventQueueStore.getState().queueEvent({
    id: generateId('evt'),
    eventDefinitionId: 'battle_resolved',
    nationId: winningNationId,
    triggeredDate: now,
    contextParams: {
      battleId,
      provinceId,
      winnerNationId: winningNationId,
      loserNationId: losingNationId,
      winnerCasualties: outcome.totalWinnerCasualties,
      loserCasualties: outcome.totalLoserCasualties,
    },
  });

  return { battleId, outcome, retreatTo: retreatTarget };
}

/**
 * Declare war between two nations.
 *
 * Creates the War entity, applies a -50 opinion modifier in both
 * directions, and queues a `war_declared` event. AI peace negotiation
 * arrives post-v0.1 — wars stay open until the player ends them
 * manually (the white-peace UI lives in Issue #25 polish).
 */
export interface DeclareWarOpts {
  attackerNationId: NationId;
  defenderNationId: NationId;
  casusBelli: import('@/types').CasusBelliType;
  now: GameDate;
}

export function declareWar(opts: DeclareWarOpts): string {
  const { attackerNationId, defenderNationId, casusBelli, now } = opts;
  const nations = useNationStore.getState().nations;
  const attacker = nations[attackerNationId];
  const defender = nations[defenderNationId];
  if (!attacker || !defender) {
    throw new Error(
      `declareWar: unknown nation(s) ${attackerNationId}, ${defenderNationId}`,
    );
  }

  const warId = generateId('war');
  useMilitaryStore.getState().declareWar({
    id: warId,
    name: `${attacker.name}–${defender.name} War`,
    startDate: now,
    endDate: null,
    attackers: [attackerNationId],
    defenders: [defenderNationId],
    warLeader: { attacker: attackerNationId, defender: defenderNationId },
    warGoals: [],
    casusBelli,
    warScore: 0,
    battlesIds: [],
    siegesIds: [],
    occupiedProvinces: [],
  });

  const modifier = {
    source: 'Declared war',
    value: -50,
    appliedDate: now,
    expiresDate: null,
  };
  useDiplomacyStore
    .getState()
    .addOpinionModifier(attackerNationId, defenderNationId, modifier);
  useDiplomacyStore
    .getState()
    .addOpinionModifier(defenderNationId, attackerNationId, modifier);

  useEventQueueStore.getState().queueEvent({
    id: generateId('evt'),
    eventDefinitionId: 'war_declared',
    nationId: defenderNationId,
    triggeredDate: now,
    contextParams: {
      warId,
      attackerNationId,
      defenderNationId,
      casusBelli,
    },
  });

  return warId;
}

/**
 * Raise a new army for `nationId`. Costs 100 gold + 5 manpower per
 * regiment. Throws if the nation doesn't have enough of either. The
 * army spawns in the nation's capital (or the first owned province if
 * no capital flag is set anywhere — defensive fallback).
 */
export const ARMY_GOLD_PER_REGIMENT = 100;
export const ARMY_MANPOWER_PER_REGIMENT = 5;

export interface RaiseArmyOpts {
  nationId: NationId;
  regimentCount: number;
}

export function raiseArmy(opts: RaiseArmyOpts): string {
  const { nationId, regimentCount } = opts;
  if (regimentCount <= 0) {
    throw new Error('raiseArmy: regimentCount must be > 0');
  }
  const nation = useNationStore.getState().nations[nationId];
  if (!nation) throw new Error(`raiseArmy: unknown nation ${nationId}`);

  const goldCost = ARMY_GOLD_PER_REGIMENT * regimentCount;
  const manpowerCost = ARMY_MANPOWER_PER_REGIMENT * regimentCount;
  if (nation.treasury < goldCost) {
    throw new Error(
      `raiseArmy: ${nationId} treasury ${nation.treasury} < cost ${goldCost}`,
    );
  }
  if (nation.manpower < manpowerCost) {
    throw new Error(
      `raiseArmy: ${nationId} manpower ${nation.manpower} < cost ${manpowerCost}`,
    );
  }

  // Locate spawn province: capital first, else first owned province.
  const provinces = useProvinceStore.getState().provinces;
  let spawn: ProvinceId | null = null;
  for (const p of Object.values(provinces)) {
    if (p.controllerId !== nationId) continue;
    if (p.isCapital) {
      spawn = p.id;
      break;
    }
    if (spawn === null) spawn = p.id;
  }
  if (!spawn) {
    throw new Error(`raiseArmy: ${nationId} owns no provinces to spawn in`);
  }

  // Build regiments — equal-strength levies for v0.1.
  const regiments = Array.from({ length: regimentCount }, (_, i) => ({
    id: `${nationId}_reg_${Date.now().toString(36)}_${i}`,
    unitType: 'levy',
    size: 1000,
    experience: 0,
  }));

  const armyId = generateId('army');
  useMilitaryStore.getState().createArmy({
    id: armyId,
    nationId,
    name: `${nation.name} Levy ${armyId.slice(-4)}`,
    regiments,
    provinceId: spawn,
    movementTarget: null,
    movementProgress: 0,
    generalId: null,
    morale: 100,
    organization: 100,
    attritionMonth: 0,
    inBattle: null,
    inSiege: null,
    isEmbarked: false,
    embarkedOnFleetId: null,
  });

  useNationStore.getState().updateTreasury(nationId, -goldCost);
  useNationStore.getState().updateManpower(nationId, -manpowerCost);

  return armyId;
}

/**
 * Set an army's movementTarget. Thin orchestrator so UI dispatching
 * stays on the same pattern as everything else.
 */
export function setArmyMovement(armyId: string, target: ProvinceId | null): void {
  useMilitaryStore.getState().moveArmy(armyId, target);
}
