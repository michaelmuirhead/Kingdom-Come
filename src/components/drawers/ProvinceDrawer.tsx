'use client';

/**
 * ProvinceDrawer — inspect a single province.
 *
 * Opens when uiStore.openDrawer === 'province'. Reads the
 * selectedProvinceId, cross-references its controller via nationStore,
 * and lays out the v0.1 inspector: owner, culture/religion, terrain,
 * development triple, trade good, buildings, manpower pool.
 */

import { useNationStore } from '@/stores/nationStore';
import { useProvinceStore } from '@/stores/provinceStore';
import { useUIStore } from '@/stores/uiStore';

export function ProvinceDrawer() {
  const open = useUIStore((s) => s.openDrawer === 'province');
  const closeDrawer = useUIStore((s) => s.closeDrawer);
  const setDrawer = useUIStore((s) => s.setDrawer);
  const setSelectedNation = useUIStore((s) => s.setSelectedNation);
  const provinceId = useUIStore((s) => s.selectedProvinceId);
  const province = useProvinceStore((s) =>
    provinceId ? s.provinces[provinceId] : undefined,
  );
  const owner = useNationStore((s) =>
    province ? s.nations[province.controllerId] : undefined,
  );
  const occupier = useNationStore((s) =>
    province && province.occupierId
      ? s.nations[province.occupierId]
      : undefined,
  );

  if (!open || !province) return null;
  const ownerName = owner?.name ?? province.controllerId;
  const occupierName = occupier?.name;

  const handleOpenOwner = () => {
    setSelectedNation(province.controllerId);
    setDrawer('nation');
  };

  return (
    <DrawerWrapper
      open={open}
      onClose={closeDrawer}
      title={province.name}
      subtitle={
        occupierName
          ? `${ownerName} (occupied by ${occupierName})`
          : ownerName
      }
    >
      <button
        type="button"
        data-testid="view-owner-button"
        onClick={handleOpenOwner}
        className="mb-3 flex h-11 w-full items-center justify-center rounded border border-neutral-700 bg-neutral-900 text-sm font-semibold text-neutral-100 hover:bg-neutral-800"
      >
        View {ownerName}
      </button>

      <dl className="grid grid-cols-[10rem_1fr] gap-x-3 gap-y-2">
        <Pair label="Region">{province.regionId}</Pair>
        <Pair label="Terrain">{province.terrain}</Pair>
        <Pair label="Climate">{province.climate}</Pair>
        <Pair label="Culture">{province.cultureId}</Pair>
        <Pair label="Religion">{province.religionId}</Pair>
        <Pair label="Trade good">{province.tradeGoodId}</Pair>
        <Pair label="Coastal">{province.isCoastal ? 'Yes' : 'No'}</Pair>
        <Pair label="Population">{province.population.toLocaleString()}</Pair>
        <Pair label="Unrest">{province.unrest}</Pair>
        <Pair label="Fortification">{`Level ${province.fortificationLevel}`}</Pair>
      </dl>

      <Section title="Development">
        <div className="flex gap-4 font-mono text-base">
          <Stat label="Tax" value={province.development.tax} />
          <Stat label="Prod" value={province.development.production} />
          <Stat label="MP" value={province.development.manpower} />
        </div>
      </Section>

      <Section title="Manpower pool">
        <div className="font-mono">
          {province.manpowerPool.current.toLocaleString()}
          <span className="text-neutral-500"> / </span>
          {province.manpowerPool.max.toLocaleString()}
          <span className="ml-2 text-xs text-neutral-500">
            (+{province.manpowerPool.regenRate}/mo)
          </span>
        </div>
      </Section>

      <Section title="Buildings">
        {province.buildings.length === 0 ? (
          <p className="text-neutral-500">None</p>
        ) : (
          <ul className="list-disc pl-5">
            {province.buildings.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
      </Section>
    </DrawerWrapper>
  );
}

/* Local helpers — avoid pulling in heavier shared primitives for v0.1. */
import { DrawerContainer } from './DrawerContainer';
import type { ReactNode } from 'react';

function DrawerWrapper(props: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <DrawerContainer
      open={props.open}
      onClose={props.onClose}
      title={props.title}
      subtitle={props.subtitle}
      testid="province-drawer"
    >
      {props.children}
    </DrawerContainer>
  );
}

function Pair({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd className="text-neutral-100">{children}</dd>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4 border-t border-neutral-800 pt-3">
      <h3 className="mb-2 text-xs uppercase tracking-wider text-neutral-400">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      <span className="text-neutral-100">{value}</span>
    </div>
  );
}
