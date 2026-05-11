/**
 * eventQueueStore — pending, scheduled, and recently-fired events.
 *
 * `pending` is the work list the UI surfaces and the AI consumes.
 * `scheduled` holds events with mean-time-to-happen (mtth) that are
 * waiting to mature into pending. `recentlyFired` is a 100-entry ring
 * buffer used by event triggers to de-duplicate frequent-fire events.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { GameDate, QueuedEvent } from '@/types';

const RECENT_BUFFER_CAP = 100;

export interface EventQueueSnapshot {
  pending: QueuedEvent[];
  scheduled: Record<string, GameDate>;
  recentlyFired: string[];
}

export interface EventQueueStoreState extends EventQueueSnapshot {
  queueEvent: (event: QueuedEvent) => void;
  dequeueEvent: (eventInstanceId: string) => void;
  dismissEvent: (eventInstanceId: string) => void;

  scheduleEvent: (eventDefinitionId: string, fireDate: GameDate) => void;
  unscheduleEvent: (eventDefinitionId: string) => void;
  fireScheduled: (eventDefinitionId: string, event: QueuedEvent) => void;

  markRecentlyFired: (eventDefinitionId: string) => void;
  hasRecentlyFired: (eventDefinitionId: string) => boolean;

  // Save/load
  snapshot: () => EventQueueSnapshot;
  hydrate: (snap: EventQueueSnapshot) => void;
  initialize: () => void;
}

function pushBounded(buf: readonly string[], id: string): string[] {
  // Move id to the end if already present, else append. Cap to RECENT_BUFFER_CAP.
  const without = buf.filter((x) => x !== id);
  const next = [...without, id];
  if (next.length > RECENT_BUFFER_CAP) {
    return next.slice(next.length - RECENT_BUFFER_CAP);
  }
  return next;
}

export const useEventQueueStore = create<EventQueueStoreState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      pending: [],
      scheduled: {},
      recentlyFired: [],

      queueEvent: (event) =>
        set(
          (state) => ({ pending: [...state.pending, event] }),
          false,
          'eventQueue/queueEvent',
        ),

      dequeueEvent: (eventInstanceId) =>
        set(
          (state) => ({
            pending: state.pending.filter((e) => e.id !== eventInstanceId),
          }),
          false,
          'eventQueue/dequeueEvent',
        ),

      dismissEvent: (eventInstanceId) =>
        set(
          (state) => {
            const found = state.pending.find((e) => e.id === eventInstanceId);
            const pending = state.pending.filter((e) => e.id !== eventInstanceId);
            if (!found) return { pending };
            return {
              pending,
              recentlyFired: pushBounded(
                state.recentlyFired,
                found.eventDefinitionId,
              ),
            };
          },
          false,
          'eventQueue/dismissEvent',
        ),

      scheduleEvent: (eventDefinitionId, fireDate) =>
        set(
          (state) => ({
            scheduled: { ...state.scheduled, [eventDefinitionId]: fireDate },
          }),
          false,
          'eventQueue/scheduleEvent',
        ),

      unscheduleEvent: (eventDefinitionId) =>
        set(
          (state) => {
            if (!(eventDefinitionId in state.scheduled)) return state;
            const { [eventDefinitionId]: _, ...rest } = state.scheduled;
            return { scheduled: rest };
          },
          false,
          'eventQueue/unscheduleEvent',
        ),

      fireScheduled: (eventDefinitionId, event) =>
        set(
          (state) => {
            const { [eventDefinitionId]: _, ...rest } = state.scheduled;
            return {
              scheduled: rest,
              pending: [...state.pending, event],
            };
          },
          false,
          'eventQueue/fireScheduled',
        ),

      markRecentlyFired: (eventDefinitionId) =>
        set(
          (state) => ({
            recentlyFired: pushBounded(state.recentlyFired, eventDefinitionId),
          }),
          false,
          'eventQueue/markRecentlyFired',
        ),

      hasRecentlyFired: (eventDefinitionId) =>
        get().recentlyFired.includes(eventDefinitionId),

      snapshot: () => {
        const s = get();
        return {
          pending: s.pending.map((e) => ({ ...e })),
          scheduled: { ...s.scheduled },
          recentlyFired: [...s.recentlyFired],
        };
      },

      hydrate: (snap) =>
        set(
          () => ({
            pending: snap.pending.map((e) => ({ ...e })),
            scheduled: { ...snap.scheduled },
            recentlyFired: [...snap.recentlyFired],
          }),
          false,
          'eventQueue/hydrate',
        ),

      initialize: () =>
        set(
          () => ({ pending: [], scheduled: {}, recentlyFired: [] }),
          false,
          'eventQueue/initialize',
        ),
    })),
    { name: 'eventQueueStore' },
  ),
);

export const _RECENT_BUFFER_CAP_FOR_TESTS = RECENT_BUFFER_CAP;
