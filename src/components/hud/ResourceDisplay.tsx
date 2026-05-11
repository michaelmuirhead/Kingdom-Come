'use client';

/**
 * ResourceDisplay — treasury / manpower / prestige for the player
 * nation. Subscribes to the three values individually so re-renders
 * only fire when their specific field changes.
 */

import { useNationStore } from '@/stores/nationStore';
import { useWorldStore } from '@/stores/worldStore';

function formatNumber(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 10_000) return `${Math.round(n / 1000)}k`;
  return Math.round(n).toLocaleString();
}

export function ResourceDisplay() {
  const playerNationId = useWorldStore((s) => s.playerNationId);
  const treasury = useNationStore((s) => s.nations[playerNationId]?.treasury);
  const manpower = useNationStore((s) => s.nations[playerNationId]?.manpower);
  const maxManpower = useNationStore(
    (s) => s.nations[playerNationId]?.maxManpower,
  );
  const prestige = useNationStore((s) => s.nations[playerNationId]?.prestige);

  if (treasury === undefined) {
    return <div className="text-xs text-neutral-500">No nation</div>;
  }

  return (
    <div className="flex items-center gap-4">
      <Stat label="Treasury" value={formatNumber(treasury)} suffix="g" testid="stat-treasury" />
      <Stat
        label="Manpower"
        value={`${formatNumber(manpower ?? 0)} / ${formatNumber(maxManpower ?? 0)}`}
        testid="stat-manpower"
      />
      <Stat label="Prestige" value={formatNumber(prestige ?? 0)} testid="stat-prestige" />
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  testid,
}: {
  label: string;
  value: string;
  suffix?: string;
  testid: string;
}) {
  return (
    <div className="flex flex-col text-right leading-tight" data-testid={testid}>
      <span className="text-[10px] uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      <span className="text-sm font-semibold text-neutral-100">
        {value}
        {suffix ? <span className="ml-0.5 text-neutral-400">{suffix}</span> : null}
      </span>
    </div>
  );
}
