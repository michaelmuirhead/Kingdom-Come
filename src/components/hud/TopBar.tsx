'use client';

/**
 * TopBar — persistent HUD across the top of the play screen.
 *
 * Left:   tappable player-nation banner (opens nation drawer in #20).
 * Middle: current in-game date + speed controls.
 * Right:  player resources.
 *
 * 44px tap targets on every button.
 */

import { useNationStore } from '@/stores/nationStore';
import { useUIStore } from '@/stores/uiStore';
import { useWorldStore } from '@/stores/worldStore';
import { formatDate } from '@/lib/date';
import { ResourceDisplay } from './ResourceDisplay';
import { SpeedControls } from './SpeedControls';

export function TopBar() {
  const currentDate = useWorldStore((s) => s.currentDate);
  const playerNationId = useWorldStore((s) => s.playerNationId);
  const nationName = useNationStore(
    (s) => s.nations[playerNationId]?.name ?? 'No nation',
  );
  const flagColor = useNationStore(
    (s) => s.nations[playerNationId]?.flagColor ?? '#404040',
  );
  const setDrawer = useUIStore((s) => s.setDrawer);
  const setSelectedNation = useUIStore((s) => s.setSelectedNation);

  return (
    <header
      className="z-10 flex h-14 shrink-0 items-center gap-4 border-b border-neutral-800 bg-neutral-950/90 px-3 backdrop-blur"
      data-testid="top-bar"
    >
      <button
        type="button"
        className="flex h-11 items-center gap-2 rounded px-2 transition-colors hover:bg-neutral-800"
        onClick={() => {
          setSelectedNation(playerNationId);
          setDrawer('nation');
        }}
        aria-label={`Open ${nationName} nation panel`}
        data-testid="nation-banner"
      >
        <span
          className="h-6 w-6 shrink-0 rounded-sm border border-neutral-700"
          style={{ backgroundColor: flagColor }}
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-neutral-100">
          {nationName}
        </span>
      </button>

      <div className="flex flex-1 items-center justify-center gap-4">
        <span
          className="rounded bg-neutral-900 px-3 py-1 font-mono text-sm tracking-wider text-neutral-200"
          data-testid="current-date"
        >
          {formatDate(currentDate)}
        </span>
        <SpeedControls />
      </div>

      <div className="flex items-center gap-3">
        <ResourceDisplay />
        <button
          type="button"
          onClick={() => setDrawer('save_load')}
          aria-label="Save or load game"
          data-testid="save-load-button"
          className="flex h-11 w-11 items-center justify-center rounded text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
        >
          💾
        </button>
      </div>
    </header>
  );
}
