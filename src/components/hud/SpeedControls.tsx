'use client';

/**
 * SpeedControls — pause toggle + 5 speed buttons.
 *
 * Reads speedSetting and isPaused from worldStore; setSpeed(0) doubles
 * as a pause path so the engine can treat speed 0 ≡ paused.
 *
 * 44px minimum tap target per the iPad spec.
 */

import { useWorldStore } from '@/stores/worldStore';
import type { SpeedSetting } from '@/types';

const SPEEDS: readonly SpeedSetting[] = [1, 2, 3, 4, 5] as const;

export function SpeedControls() {
  const speedSetting = useWorldStore((s) => s.speedSetting);
  const isPaused = useWorldStore((s) => s.isPaused);
  const setSpeed = useWorldStore((s) => s.setSpeed);
  const togglePause = useWorldStore((s) => s.togglePause);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => togglePause()}
        aria-label={isPaused ? 'Resume' : 'Pause'}
        data-testid="pause-toggle"
        className={`flex h-11 min-w-11 items-center justify-center rounded px-3 text-sm font-semibold transition-colors ${
          isPaused
            ? 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400'
            : 'bg-neutral-700 text-neutral-100 hover:bg-neutral-600'
        }`}
      >
        {isPaused ? '▶' : '❚❚'}
      </button>
      {SPEEDS.map((n) => {
        const active = speedSetting === n && !isPaused;
        return (
          <button
            key={n}
            type="button"
            onClick={() => setSpeed(n)}
            aria-label={`Speed ${n}`}
            aria-pressed={active}
            data-testid={`speed-${n}`}
            className={`flex h-11 w-11 items-center justify-center rounded text-sm font-semibold transition-colors ${
              active
                ? 'bg-amber-400 text-neutral-900'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
