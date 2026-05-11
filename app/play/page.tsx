'use client';

/**
 * Play page — the main game screen.
 *
 * v0.1 wiring: a fixed top-bar shell (HUD lands in Issue #15) plus the
 * SVG world map below it. On first mount we kick off a campaign with a
 * deterministic seed so the player always sees the authored 1200 setup
 * after a refresh. A start-screen + nation picker is post-v0.1.
 */

import { useEffect, useState } from 'react';
import { startNewCampaign } from '@/persistence/loadCampaign';
import { WorldMap } from '@/components/map/WorldMap';

export default function PlayPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    startNewCampaign({
      playerNationTag: 'FRA',
      seed: 'kingdom-come-v0.1',
    });
    setReady(true);
  }, []);

  return (
    <main className="flex h-screen w-screen flex-col bg-neutral-950 text-neutral-100">
      <header className="flex h-12 shrink-0 items-center border-b border-neutral-800 px-4">
        <span className="text-sm font-semibold tracking-wide">Kingdom Come</span>
        <span className="ml-2 text-xs text-neutral-500">v0.1 skeleton</span>
      </header>
      <section className="flex-1 overflow-hidden">
        {ready ? <WorldMap /> : <LoadingState />}
      </section>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="flex h-full w-full items-center justify-center text-neutral-500">
      Loading campaign…
    </div>
  );
}
