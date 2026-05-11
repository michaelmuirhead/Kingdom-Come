import { describe, it, expect, beforeEach } from 'vitest';
import {
  useEventQueueStore,
  _RECENT_BUFFER_CAP_FOR_TESTS,
} from '@/stores/eventQueueStore';
import type { QueuedEvent } from '@/types';

const D = { year: 1200, month: 1, day: 1 };

function makeEvent(over: Partial<QueuedEvent> & { id: string }): QueuedEvent {
  const { id, ...rest } = over;
  return {
    id,
    eventDefinitionId: 'evt_default',
    nationId: 'FRA',
    triggeredDate: D,
    contextParams: {},
    ...rest,
  };
}

describe('eventQueueStore', () => {
  beforeEach(() => {
    useEventQueueStore.getState().initialize();
  });

  describe('queueEvent / dequeueEvent / dismissEvent', () => {
    it('queueEvent appends to pending', () => {
      useEventQueueStore.getState().queueEvent(makeEvent({ id: 'e1' }));
      useEventQueueStore.getState().queueEvent(makeEvent({ id: 'e2' }));
      expect(useEventQueueStore.getState().pending.map((e) => e.id)).toEqual([
        'e1',
        'e2',
      ]);
    });

    it('dequeueEvent removes by id', () => {
      useEventQueueStore.getState().queueEvent(makeEvent({ id: 'e1' }));
      useEventQueueStore.getState().queueEvent(makeEvent({ id: 'e2' }));
      useEventQueueStore.getState().dequeueEvent('e1');
      expect(useEventQueueStore.getState().pending.map((e) => e.id)).toEqual([
        'e2',
      ]);
    });

    it('dismissEvent removes from pending and pushes the definition id into recentlyFired', () => {
      useEventQueueStore
        .getState()
        .queueEvent(makeEvent({ id: 'e1', eventDefinitionId: 'def_x' }));
      useEventQueueStore.getState().dismissEvent('e1');
      const s = useEventQueueStore.getState();
      expect(s.pending).toEqual([]);
      expect(s.recentlyFired).toContain('def_x');
    });
  });

  describe('scheduling', () => {
    it('scheduleEvent / unscheduleEvent', () => {
      useEventQueueStore.getState().scheduleEvent('def_a', { year: 1205, month: 3, day: 1 });
      expect(useEventQueueStore.getState().scheduled.def_a?.year).toBe(1205);
      useEventQueueStore.getState().unscheduleEvent('def_a');
      expect(useEventQueueStore.getState().scheduled.def_a).toBeUndefined();
    });

    it('fireScheduled moves to pending and unschedules', () => {
      useEventQueueStore.getState().scheduleEvent('def_a', { year: 1205, month: 3, day: 1 });
      useEventQueueStore
        .getState()
        .fireScheduled('def_a', makeEvent({ id: 'inst_1', eventDefinitionId: 'def_a' }));
      const s = useEventQueueStore.getState();
      expect(s.scheduled.def_a).toBeUndefined();
      expect(s.pending[0]?.id).toBe('inst_1');
    });
  });

  describe('recentlyFired ring buffer', () => {
    it('markRecentlyFired records definition ids', () => {
      const q = useEventQueueStore.getState();
      q.markRecentlyFired('a');
      q.markRecentlyFired('b');
      expect(useEventQueueStore.getState().recentlyFired).toEqual(['a', 'b']);
    });

    it('hasRecentlyFired reflects buffer membership', () => {
      useEventQueueStore.getState().markRecentlyFired('x');
      expect(useEventQueueStore.getState().hasRecentlyFired('x')).toBe(true);
      expect(useEventQueueStore.getState().hasRecentlyFired('y')).toBe(false);
    });

    it('caps the buffer length to RECENT_BUFFER_CAP', () => {
      const cap = _RECENT_BUFFER_CAP_FOR_TESTS;
      const m = useEventQueueStore.getState().markRecentlyFired;
      for (let i = 0; i < cap + 50; i++) m(`evt_${i}`);
      const buf = useEventQueueStore.getState().recentlyFired;
      expect(buf.length).toBe(cap);
      // Earliest entries should have been evicted.
      expect(buf[0]).toBe(`evt_50`);
      expect(buf[buf.length - 1]).toBe(`evt_${cap + 49}`);
    });

    it('re-marking moves an existing entry to the tail without growing length', () => {
      const m = useEventQueueStore.getState().markRecentlyFired;
      m('a');
      m('b');
      m('a'); // re-mark
      const buf = useEventQueueStore.getState().recentlyFired;
      expect(buf).toEqual(['b', 'a']);
    });
  });

  describe('snapshot / hydrate', () => {
    it('round-trips through JSON', () => {
      useEventQueueStore.getState().queueEvent(makeEvent({ id: 'e1' }));
      useEventQueueStore.getState().scheduleEvent('def_a', { year: 1205, month: 3, day: 1 });
      useEventQueueStore.getState().markRecentlyFired('def_b');

      const snap = useEventQueueStore.getState().snapshot();
      const restored = JSON.parse(JSON.stringify(snap));

      useEventQueueStore.getState().initialize();
      useEventQueueStore.getState().hydrate(restored);

      const s = useEventQueueStore.getState();
      expect(s.pending[0]?.id).toBe('e1');
      expect(s.scheduled.def_a?.year).toBe(1205);
      expect(s.recentlyFired).toContain('def_b');
    });
  });
});
