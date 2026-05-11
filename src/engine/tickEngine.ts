/**
 * tickEngine — the simulation heartbeat.
 *
 * Calls each subsystem tick in the canonical order (see TECH.md
 * Section 8: economy → military → diplomacy → tech → religion →
 * politics → dynasty → ideology → AI → events), then advances the
 * world clock, then checks for auto-pause conditions.
 *
 * v0.1: economy / military / diplomacy / dynasty are wired as no-op
 * stubs and filled in by issues #17-#19. The remaining subsystems will
 * arrive in later versions.
 *
 * Subsystem functions are looked up via a mutable registry so tests can
 * inject spies without ES-module mocking gymnastics.
 */

import { useWorldStore } from '@/stores/worldStore';
import { economyTick as defaultEconomyTick } from './economy/tick';
import { militaryTick as defaultMilitaryTick } from './military/tick';
import { diplomacyTick as defaultDiplomacyTick } from './diplomacy/tick';
import { dynastyTick as defaultDynastyTick } from './dynasty/tick';

export type TickStage =
  | 'economy'
  | 'military'
  | 'diplomacy'
  | 'dynasty';

/** Canonical execution order. Drives both production runs and tests. */
export const TICK_ORDER: readonly TickStage[] = [
  'economy',
  'military',
  'diplomacy',
  'dynasty',
] as const;

export interface TickRegistry {
  economy: () => void;
  military: () => void;
  diplomacy: () => void;
  dynasty: () => void;
}

const registry: TickRegistry = {
  economy: defaultEconomyTick,
  military: defaultMilitaryTick,
  diplomacy: defaultDiplomacyTick,
  dynasty: defaultDynastyTick,
};

/**
 * Override (or restore) a subsystem tick. Returns a `restore()` function
 * that undoes the override so tests can clean up.
 */
export function setTickStage(stage: TickStage, fn: () => void): () => void {
  const previous = registry[stage];
  registry[stage] = fn;
  return () => {
    registry[stage] = previous;
  };
}

/** Detect conditions that should auto-pause for player attention. */
function checkPauseConditions(): void {
  // Real conditions (ruler death, war declaration, urgent event) land in
  // Issues #18 and #21. Stubbed for v0.1.
}

/** Run one monthly tick end-to-end. */
export function runMonthlyTick(): void {
  for (const stage of TICK_ORDER) {
    registry[stage]();
  }
  useWorldStore.getState().advanceMonth();
  checkPauseConditions();
}
