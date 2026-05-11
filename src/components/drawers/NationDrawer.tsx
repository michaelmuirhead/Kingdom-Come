'use client';

/**
 * NationDrawer — inspect a nation.
 *
 * Defaults to the player nation when no other nation is selected. Pulls
 * the current ruler's name + stats out of the dynasty store. Ideology
 * vector is rendered as labelled axis bars; v0.2 will switch to the
 * design's radar chart.
 */

import { useDynastyStore } from '@/stores/dynastyStore';
import { useMilitaryStore } from '@/stores/militaryStore';
import { useNationStore } from '@/stores/nationStore';
import { useUIStore } from '@/stores/uiStore';
import { useWorldStore } from '@/stores/worldStore';
import { areNationsAtWar } from '@/engine/diplomacy/opinions';
import {
  ARMY_GOLD_PER_REGIMENT,
  ARMY_MANPOWER_PER_REGIMENT,
  raiseArmy,
} from '@/engine/orchestrator';
import type { Army, IdeologyVector } from '@/types';
import { DrawerContainer } from './DrawerContainer';
import type { ReactNode } from 'react';

const DEFAULT_REGIMENTS = 2;

const AXIS_LABELS: Array<[keyof IdeologyVector, string, string]> = [
  ['militaristPacifist', 'Pacifist', 'Militarist'],
  ['mercantileAgrarian', 'Agrarian', 'Mercantile'],
  ['theocraticSecular', 'Theocratic', 'Secular'],
  ['openIsolationist', 'Open', 'Isolationist'],
  ['aristocraticPopulist', 'Aristocratic', 'Populist'],
  ['traditionalProgressive', 'Traditional', 'Progressive'],
  ['centralistFederalist', 'Centralist', 'Federalist'],
];

export function NationDrawer() {
  const open = useUIStore((s) => s.openDrawer === 'nation');
  const closeDrawer = useUIStore((s) => s.closeDrawer);
  const setDialog = useUIStore((s) => s.setDialog);
  const selectedNationId = useUIStore((s) => s.selectedNationId);
  const playerNationId = useWorldStore((s) => s.playerNationId);
  const nationId = selectedNationId ?? playerNationId;

  const nation = useNationStore((s) =>
    nationId ? s.nations[nationId] : undefined,
  );
  const ruler = useDynastyStore((s) =>
    nation ? s.characters[nation.rulerId] : undefined,
  );
  const wars = useMilitaryStore((s) => s.wars);
  const armies = useMilitaryStore((s) =>
    nation
      ? (s.armiesByNation[nation.id] ?? []).map((id) => s.armies[id]!)
      : ([] as Army[]),
  );

  if (!open || !nation) return null;
  const isForeign = nation.id !== playerNationId;
  const atWar = isForeign && areNationsAtWar(playerNationId, nation.id, wars);

  const armyGoldCost = ARMY_GOLD_PER_REGIMENT * DEFAULT_REGIMENTS;
  const armyManpowerCost = ARMY_MANPOWER_PER_REGIMENT * DEFAULT_REGIMENTS;
  const canAfford =
    nation.treasury >= armyGoldCost && nation.manpower >= armyManpowerCost;

  const handleRaiseArmy = () => {
    if (!canAfford) return;
    raiseArmy({ nationId: nation.id, regimentCount: DEFAULT_REGIMENTS });
  };

  return (
    <DrawerContainer
      open={open}
      onClose={closeDrawer}
      title={nation.name}
      subtitle={nation.tag}
      testid="nation-drawer"
    >
      {atWar ? (
        <div
          data-testid="nation-drawer-at-war"
          className="-mx-4 mb-3 border-y border-red-700 bg-red-900/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-200"
        >
          At war with you
        </div>
      ) : null}

      {isForeign && !atWar ? (
        <button
          type="button"
          data-testid="declare-war-button"
          onClick={() => setDialog('declare_war')}
          className="mb-3 flex h-11 w-full items-center justify-center rounded bg-red-600 text-sm font-semibold text-white hover:bg-red-500"
        >
          Declare War
        </button>
      ) : null}

      <dl className="grid grid-cols-[10rem_1fr] gap-x-3 gap-y-2">
        <Pair label="Government">{nation.governmentType}</Pair>
        <Pair label="Archetype">{nation.archetypeId}</Pair>
        <Pair label="Culture">{nation.cultureId}</Pair>
        <Pair label="Religion">{nation.primaryReligionId}</Pair>
        <Pair label="Succession">{nation.successionLaw}</Pair>
      </dl>

      <Section title="Ruler">
        {ruler ? (
          <div>
            <div className="font-semibold text-neutral-100">
              {ruler.givenName} {ruler.dynastyName}
              {ruler.nickname ? (
                <span className="text-neutral-400">{` "${ruler.nickname}"`}</span>
              ) : null}
            </div>
            <div className="text-xs text-neutral-400">{ruler.position.title}</div>
            <div className="mt-2 grid grid-cols-3 gap-x-2 gap-y-1 font-mono text-sm">
              <Stat label="Dip" value={ruler.stats.diplomacy} />
              <Stat label="Stew" value={ruler.stats.stewardship} />
              <Stat label="Mar" value={ruler.stats.martial} />
              <Stat label="Int" value={ruler.stats.intrigue} />
              <Stat label="Lea" value={ruler.stats.learning} />
              <Stat label="Pie" value={ruler.stats.piety} />
            </div>
          </div>
        ) : (
          <p className="text-neutral-500">No ruler</p>
        )}
      </Section>

      <Section title="Treasury">
        <div className="grid grid-cols-3 gap-2 font-mono text-base">
          <Stat label="Gold" value={Math.round(nation.treasury)} />
          <Stat
            label="Manpower"
            value={`${Math.round(nation.manpower)} / ${Math.round(nation.maxManpower)}`}
          />
          <Stat label="Prestige" value={Math.round(nation.prestige)} />
        </div>
      </Section>

      <Section title="Ideology">
        <ul className="space-y-1">
          {AXIS_LABELS.map(([axis, leftLabel, rightLabel]) => {
            const value = nation.ideologyVector[axis];
            return (
              <li key={axis} className="text-xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>{leftLabel}</span>
                  <span className="font-mono text-neutral-200">{value}</span>
                  <span>{rightLabel}</span>
                </div>
                <AxisBar value={value} />
              </li>
            );
          })}
        </ul>
      </Section>

      {nation.ambitions.length > 0 ? (
        <Section title="Ambitions">
          <ul className="space-y-2">
            {nation.ambitions.map((a) => (
              <li key={a.id} className="rounded border border-neutral-800 p-2">
                <div className="text-neutral-100">{a.description}</div>
                <div className="text-[11px] uppercase tracking-wider text-neutral-500">
                  {a.type} · weight {a.weight}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {!isForeign ? (
        <Section title="Armies">
          {armies.length === 0 ? (
            <p className="mb-2 text-neutral-500">No armies in the field.</p>
          ) : (
            <ul className="mb-2 space-y-1 text-xs">
              {armies.map((a) => {
                if (!a) return null;
                const totalSize = a.regiments.reduce(
                  (s, r) => s + r.size,
                  0,
                );
                return (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded border border-neutral-800 px-2 py-1"
                  >
                    <span className="text-neutral-100">{a.name}</span>
                    <span className="font-mono text-neutral-400">
                      {totalSize.toLocaleString()} @ {a.provinceId}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <button
            type="button"
            data-testid="raise-army-button"
            disabled={!canAfford}
            onClick={handleRaiseArmy}
            className="flex h-11 w-full items-center justify-center rounded bg-amber-500 text-sm font-semibold text-neutral-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Raise army ({DEFAULT_REGIMENTS} regiments · {armyGoldCost}g ·{' '}
            {armyManpowerCost} manpower)
          </button>
        </Section>
      ) : null}
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

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      <span className="text-neutral-100">{value}</span>
    </div>
  );
}

function AxisBar({ value }: { value: number }) {
  // Map -100..+100 to a 0..100% offset within a 100%-wide track, with the
  // origin at 50%. Bar grows in either direction from centre.
  const v = Math.max(-100, Math.min(100, value));
  const absPct = Math.abs(v) / 2; // half-track width
  const offset = v >= 0 ? 50 : 50 - absPct;
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
      <div
        className="absolute h-full bg-amber-400"
        style={{ left: `${offset}%`, width: `${absPct}%` }}
      />
      <div className="absolute left-1/2 h-full w-px bg-neutral-600" />
    </div>
  );
}
