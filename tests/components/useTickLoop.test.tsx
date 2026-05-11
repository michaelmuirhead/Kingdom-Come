import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { SPEED_MS, useTickLoop } from '@/hooks/useTickLoop';
import { startNewCampaign } from '@/persistence/loadCampaign';
import { useWorldStore } from '@/stores/worldStore';

function TickHost() {
  useTickLoop();
  return null;
}

describe('useTickLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    startNewCampaign({ playerNationTag: 'FRA', seed: 'loop-tests' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('SPEED_MS table matches the TECH.md specification', () => {
    expect(SPEED_MS[1]).toBe(2000);
    expect(SPEED_MS[2]).toBe(1000);
    expect(SPEED_MS[3]).toBe(500);
    expect(SPEED_MS[4]).toBe(250);
    expect(SPEED_MS[5]).toBe(100);
    expect(SPEED_MS[0]).toBe(Infinity);
  });

  it('does not tick while paused', () => {
    render(<TickHost />);
    expect(useWorldStore.getState().isPaused).toBe(true);
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(useWorldStore.getState().monthsPlayed).toBe(0);
  });

  it('advances the clock once per interval at the current speed', () => {
    render(<TickHost />);
    act(() => {
      useWorldStore.getState().setSpeed(3); // 500 ms
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(useWorldStore.getState().monthsPlayed).toBe(1);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(useWorldStore.getState().monthsPlayed).toBe(2);
  });

  it('restarts the interval when speed changes', () => {
    render(<TickHost />);
    act(() => {
      useWorldStore.getState().setSpeed(1); // 2000 ms
    });
    act(() => {
      vi.advanceTimersByTime(1_500);
    });
    expect(useWorldStore.getState().monthsPlayed).toBe(0);

    act(() => {
      useWorldStore.getState().setSpeed(5); // 100 ms — should restart timer
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(useWorldStore.getState().monthsPlayed).toBe(1);
  });

  it('stops ticking when paused mid-run', () => {
    render(<TickHost />);
    act(() => {
      useWorldStore.getState().setSpeed(4); // 250 ms
    });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(useWorldStore.getState().monthsPlayed).toBe(1);

    act(() => {
      useWorldStore.getState().togglePause();
    });
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(useWorldStore.getState().monthsPlayed).toBe(1);
  });
});
