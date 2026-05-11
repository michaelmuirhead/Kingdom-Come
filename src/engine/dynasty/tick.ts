/**
 * Dynasty monthly tick.
 *
 * For every living character: age, drain health, roll mortality. If a
 * character dies, kill them in the dynasty store. If that character was
 * a nation's ruler, route through the orchestrator to resolve
 * succession, queue events, and pause the game.
 *
 * RNG: pulls a per-month `dynasty` stream from the world's master seed
 * so re-running the same campaign at the same monthly tick produces
 * identical death rolls.
 */

import {
  useDynastyStore,
  useNationStore,
  useWorldStore,
} from '@/stores';
import { createStream } from '@/engine/rngStreams';
import type { Character, Nation } from '@/types';
import { ageInYears, applyHealthDrain, monthlyHealthDrain } from './aging';
import { isPlotArmored, monthlyMortalityRate } from './mortality';
import { handleRulerDeath } from '@/engine/orchestrator';

const HEALTH_BEDRIDDEN = 25;

interface RulerLookup {
  /** Map of ruler-charId → nation that the character rules. */
  byRulerId: Map<string, Nation>;
}

function buildRulerLookup(): RulerLookup {
  const nations = useNationStore.getState().nations;
  const byRulerId = new Map<string, Nation>();
  for (const n of Object.values(nations)) {
    byRulerId.set(n.rulerId, n);
  }
  return { byRulerId };
}

export function dynastyTick(): void {
  const world = useWorldStore.getState();
  const now = world.currentDate;
  const rng = createStream(world.campaignSeed, 'dynasty', world.monthsPlayed);

  const dynasty = useDynastyStore.getState();
  const livingIds = [...dynasty.livingCharacters];
  const characters = dynasty.characters;
  const rulerLookup = buildRulerLookup();

  // Process in a stable order (ID-sorted) so RNG draws are reproducible
  // across runs even when index rebuilds reorder the index.
  livingIds.sort();

  for (const id of livingIds) {
    const c = characters[id];
    if (!c || c.deathDate !== null) continue;

    const ageY = ageInYears(c, now);

    // 1) Health drain
    const drain = monthlyHealthDrain(ageY);
    if (drain > 0) {
      const nextHealth = applyHealthDrain(c.health.current, drain);
      if (nextHealth !== c.health.current) {
        useDynastyStore.getState().updateCharacter(c.id, {
          health: { ...c.health, current: nextHealth },
        });
      }
    }

    // 2) Mortality roll (against post-drain health). Bedridden
    //    characters still roll — we just don't apply a special bonus
    //    above what their lowered health already implies.
    const refreshed = useDynastyStore.getState().characters[c.id] ?? c;
    if (isPlotArmored(refreshed, now)) continue;
    const p = monthlyMortalityRate(ageY, refreshed.health.current);
    if (!rng.chance(p)) continue;
    if (refreshed.health.current >= HEALTH_BEDRIDDEN) {
      // We computed `p` either way; just being explicit that we don't
      // treat the bedridden threshold as a hard cutoff for now. The
      // comment exists so future rules can hook in here.
    }

    // 3) Death
    const ruledNation = rulerLookup.byRulerId.get(refreshed.id);
    if (ruledNation) {
      handleRulerDeath(refreshed as Character, ruledNation, now);
    } else {
      useDynastyStore.getState().killCharacter(refreshed.id, now);
    }
  }
}
