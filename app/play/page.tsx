'use client';

/**
 * Play page — the main game screen.
 *
 * On first mount we kick off a campaign with a deterministic seed so
 * the player always sees the authored 1200 setup after a refresh.
 * A start-screen + nation picker is post-v0.1.
 */

import { useEffect, useState } from 'react';
import { startNewCampaign } from '@/persistence/loadCampaign';
import { WorldMap } from '@/components/map/WorldMap';
import { TopBar } from '@/components/hud/TopBar';
import { ArmySelector } from '@/components/hud/ArmySelector';
import { ProvinceDrawer } from '@/components/drawers/ProvinceDrawer';
import { NationDrawer } from '@/components/drawers/NationDrawer';
import { SaveLoadDrawer } from '@/components/drawers/SaveLoadDrawer';
import { DeclareWarDialog } from '@/components/dialogs/DeclareWarDialog';
import { useTickLoop } from '@/hooks/useTickLoop';

export default function PlayPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    startNewCampaign({
      playerNationTag: 'FRA',
      seed: 'kingdom-come-v0.1',
    });
    setReady(true);
  }, []);

  useTickLoop();

  return (
    <main className="flex h-screen w-screen flex-col bg-neutral-950 text-neutral-100">
      {ready ? <TopBar /> : null}
      <section className="flex-1 overflow-hidden">
        {ready ? <WorldMap /> : <LoadingState />}
      </section>
      {ready ? (
        <>
          <ArmySelector />
          <ProvinceDrawer />
          <NationDrawer />
          <SaveLoadDrawer />
          <DeclareWarDialog />
        </>
      ) : null}
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
