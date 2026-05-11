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
 */

import {
  useDynastyStore,
  useEventQueueStore,
  useNationStore,
  useWorldStore,
} from '@/stores';
import { generateId } from '@/lib/id';
import type {
  Character,
  CharacterId,
  GameDate,
  Nation,
  PauseReason,
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
